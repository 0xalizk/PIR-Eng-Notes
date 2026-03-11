/* ── PIR Engineering Notes — charts.js ────────────────────────────────
 *
 * Main visualization engine for the "Benching PIR (WIP)" site.
 * Renders all Plotly charts from data/reported.json (v2 schema).
 *
 * ── Architecture Overview ──────────────────────────────────────────
 *
 * Data pipeline:
 *   1. init() fetches reported.json and calls transformV2() to flatten
 *      the nested scheme→config→benchmark structure into a flat array
 *      of "entities" (one per scheme-variant). Each entity carries the
 *      primary benchmark metrics (largest DB, best tier).
 *   2. computeCompositeScores() ranks all entities on 4 core metrics
 *      and produces percentile ranks, absolute log-normalizations, and
 *      a composite score used for default sorting.
 *   3. Each chart section has its own independent tab state (DB tier,
 *      entry bucket, primary dimension, secondary filters). Tab clicks
 *      only re-render charts within that section via filterData().
 *   4. Individual render functions produce Plotly traces from the
 *      filtered entity array.
 *
 * Chart inventory (in render order):
 *   1. Heatmap         — sorted by composite, 7 metrics, color = rank
 *   2. Comm Scatter    — query vs response KB (log-log)
 *   3a. Throughput Bars — GB/s horizontal bars
 *   3b. Server Time    — server_time_ms bars
 *   4. Client Cost     — client_time_ms bars
 *   5a. Offline/Storage — offline_comm_mb + client_storage_mb grouped bars
 *   5b. Preprocessing  — server_preprocessing_time_ms / client_preprocessing_time_ms bars (offline computation cost)
 *   6a–d. Pareto 2D    — four 2-metric scatter plots (comm/server/storage/client)
 *         Pareto 3D    — (commented out) two 3-metric scatter3d plots
 *   6f. Radar          — per-scheme polar plots (tabbed by DB-size tier)
 *   7. Timeline        — throughput evolution by year (post-2020)
 *   8. Catalog         — sortable/filterable scheme table
 *
 * Key concepts:
 *   - "Data tier": confidence level of benchmark numbers.
 *       Tier 1 = exact (author-reported), Tier 2 = approximate (read
 *       from figures), Tier 3 = derived from asymptotics/estimates.
 *   - "DB-size tier": database size category the benchmark was run on.
 *       tiny (≤1GB), small (1–8GB), medium (8–32GB), large (>32GB),
 *       1-bit (single-bit entries, a special PIR problem class).
 *   - "Variant": some schemes have multiple protocol variants (e.g.
 *       SimplePIR, DoublePIR). Each variant may have its own benchmarks.
 *   - "Variant consolidation": when multiple variants of the same scheme
 *       have similar metric values (within 10%), they are merged into a
 *       single plot point to reduce visual clutter. The merged point uses
 *       the first variant's data as representative, and the hover text
 *       lists all consolidated variant names. See consolidateVariants().
 *   - "Composite score": a 0–1 score combining percentile ranks across
 *       4 core metrics. Used for default heatmap sort order.
 *   - "Theory-only": a scheme with no open-source implementation AND no
 *       author-reported concrete benchmarks. These are purely theoretical
 *       constructions included for completeness in the catalog.
 *   - "Open-source impl": whether independently-verifiable source code
 *       exists. Catalog column shows "Yes" (linked), "No" (authors claim
 *       benchmarks but code isn't public), or "Theory-only".
 *
 * Rendering notes:
 *   - All charts use Plotly 2.35.2 via CDN.
 *   - Dark/light theme adapts via prefers-color-scheme media query.
 *   - Charts re-render on theme change and window resize (debounced).
 *   - After initial render, anchor scroll is triggered after a 700ms
 *     delay to wait for Plotly's async layout.
 *   - 3D scatter plots (scatter3d) only support a limited symbol set;
 *     Pareto-optimal points use a "ring overlay" trace workaround.
 *   - Group X (Extensions) is excluded from radar and top-level scatter
 *     plots per project convention (different problem class).
 */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  //
  // PIR scheme groups per taxonomy (https://notes.ethereum.org/U9xM4VOPR9isPK7lOZJUQg?view#41-Taxonomy):
  //   1a = Stateless Client, Stateful Server (server caches per-client eval keys)
  //   1b = Stateless Client, Stateless Server (no per-client state anywhere)
  //   2a = Download-Hint (client downloads server-computed global hint)
  //   2b = Interactive-Hint (bidirectional hint generation, sublinear server)
  //   X  = Extensions (keyword PIR, distributional PIR — different problem class)
  var GROUP_COLORS = { '1a': '#1f77b4', '1b': '#2ca02c', '2a': '#ff7f0e', '2b': '#d62728', X: '#7f7f7f' };
  var GROUP_NAMES = {
    '1a': 'Stateless Client, Stateful Server', '1b': 'Stateless Client, Stateless Server',
    '2a': 'Download-Hint', '2b': 'Interactive-Hint', X: 'Extensions'
  };
  // Plotly scatter3d only supports: circle, circle-open, cross, diamond,
  // diamond-open, square, square-open, x — no 'star' or 'triangle'.
  var GROUP_SYMBOLS_3D = { '1a': 'circle', '1b': 'square', '2a': 'diamond', '2b': 'cross', X: 'x' };

  // Database size tiers — benchmarks are categorized by the total DB size
  // (num_entries × entry_size_bytes) they were measured on. The tab system
  // lets users compare schemes at the same scale.
  var DB_SIZE_TIERS = ['tiny', 'small', 'medium', 'large'];
  var DB_SIZE_LABELS = {
    tiny: '\u22641GB', small: '1\u20138GB', medium: '8\u201332GB', large: '>32GB'
  };
  var DB_SIZE_COLORS = {
    tiny: '#9b59b6', small: '#3498db', medium: '#e67e22', large: '#e74c3c'
  };

  // Entry size buckets — benchmarks categorized by the per-entry size.
  var ENTRY_BUCKETS = ['1-bit', 'lt256', '256-1k', '1k-32k', 'gt32k'];
  var ENTRY_BUCKET_LABELS = {
    '1-bit': '1 bit', 'lt256': '< 256 B', '256-1k': '256 B\u20131 KB',
    '1k-32k': '1\u201332 KB', 'gt32k': '> 32 KB'
  };
  var ENTRY_BUCKET_COLORS = {
    '1-bit': '#17becf', 'lt256': '#bcbd22', '256-1k': '#e377c2',
    '1k-32k': '#8c564b', 'gt32k': '#7f7f7f'
  };
  // Data confidence tiers — visual encoding:
  //   Tier 1: full opacity, circle marker, solid radar line, no badge
  //   Tier 2: 80% opacity, square marker, dashed radar line, † badge
  //   Tier 3: 55% opacity, diamond marker, dotted radar line, * badge
  var TIER_OPACITY = { 1: 1.0, 2: 0.8, 3: 0.55 };
  var TIER_LABELS = { 1: 'From data', 2: 'From figures/analytics', 3: 'From asymptotics' };
  var TIER_BADGE = { 1: '', 2: '\u2020', 3: '*' };

  // Core metrics used for composite scoring (the 4 most universally reported).
  // ALL_METRICS adds client_time, offline comm, and client storage for the
  // heatmap and radar views.
  var CORE_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps'];
  var ALL_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps',
    'client_time_ms', 'offline_comm_mb', 'client_storage_mb',
    'server_preprocessing_time_ms', 'client_preprocessing_time_ms'];
  var METRIC_LABELS = {
    query_size_kb: 'Query (KB)', response_size_kb: 'Response (KB)',
    server_time_ms: 'Server (ms)', throughput_gbps: 'Throughput (GB/s)',
    client_time_ms: 'Client (ms)', offline_comm_mb: 'Offline (MB)',
    client_storage_mb: 'Storage (MB)',
    server_preprocessing_time_ms: 'Server Preprocessing (ms)',
    client_preprocessing_time_ms: 'Client Preprocessing (ms)'
  };
  var METRIC_NAMES = {
    query_size_kb: 'Query', response_size_kb: 'Response',
    server_time_ms: 'Server', throughput_gbps: 'Throughput',
    client_time_ms: 'Client', offline_comm_mb: 'Offline',
    client_storage_mb: 'Storage',
    server_preprocessing_time_ms: 'Server Preproc.',
    client_preprocessing_time_ms: 'Client Preproc.'
  };
  var METRIC_UNITS = {
    query_size_kb: 'KB', response_size_kb: 'KB',
    server_time_ms: 'ms', throughput_gbps: 'GB/s',
    client_time_ms: 'ms', offline_comm_mb: 'MB',
    client_storage_mb: 'MB',
    server_preprocessing_time_ms: 'ms', client_preprocessing_time_ms: 'ms'
  };
  // Directionality: lower is better for all metrics except throughput.
  // This affects ranking (sort direction) and normalization (inversion).
  var HIGHER_IS_BETTER = { throughput_gbps: true, rate: true };

  var BASE_URL = 'https://github.com/0xalizk/PIR-Eng-Notes/blob/main/research/';

  function schemeUrl(s) {
    var path = (typeof s === 'object') ? s.notes_path : null;
    return path ? BASE_URL + path : '#';
  }

  // ── Helpers ────────────────────────────────────────────

  // Extract a metric value from a flat entity. Entity's `concrete` object
  // holds the benchmark metrics (e.g. { query_size_kb: 14, ... }).
  function getVal(s, metric) {
    if (!s.concrete) return null;
    var v = s.concrete[metric];
    return v !== undefined ? v : null;
  }

  // True if v is a finite number > 0. All PIR benchmark metrics are strictly
  // positive when reported, so this is the canonical check for "has data".
  // Catches null, undefined, NaN, 0, strings, and objects in one test.
  function isPos(v) { return typeof v === 'number' && isFinite(v) && v > 0; }

  // True if v is a finite number >= 0. For computed ranks/norms (0–1 scale)
  // where 0 is a valid value meaning "best".
  function isNum(v) { return typeof v === 'number' && isFinite(v) && v >= 0; }

  // Annotation for metrics that need clarification (e.g. OnionPIRv2 client_storage is server-side)
  var STORAGE_NOTE_IDS = { 'onionpirv2_2025': true };
  var STORAGE_NOTE_TEXT = '<br><br><i>NOTE: server-side per-client storage<br>(evaluation keys the server holds),<br>not client-side storage</i>';
  function storageNote(s) {
    return STORAGE_NOTE_IDS[s.id] ? STORAGE_NOTE_TEXT : '';
  }

  // Returns a Plotly annotation explaining † (Tier 2) and * (Tier 3) badges,
  // or null if all items are Tier 1.
  // Returns a Plotly annotation with colored squares for each group present in items.
  // Positioned below the chart, stacking below the tier badge if both are used.
  function groupColorLegend(items, t, colorMap, nameMap) {
    colorMap = colorMap || GROUP_COLORS;
    nameMap = nameMap || GROUP_NAMES;
    var groups = Object.keys(colorMap);
    if (groups.length <= 1) return null;
    var parts = groups.map(function (g) {
      return '<span style="color:' + (colorMap[g] || '#999') + '">\u25A0</span> ' + (nameMap[g] || g);
    });
    return {
      text: parts.join(' &nbsp; '),
      xref: 'paper', yref: 'paper', x: 0.5, xanchor: 'center', y: 0, yanchor: 'top', yshift: -60,
      showarrow: false, font: { size: 11, color: t.muted }
    };
  }

  // Appends group + tier annotations to a layout, adjusting bottom margin as needed.
  function addLegendAnnotations(layout, items, t, colorMap, nameMap) {
    var anns = layout.annotations || [];
    var badge = tierBadgeLegend(items, t);
    var groupLeg = groupColorLegend(items, t, colorMap, nameMap);
    if (badge) anns = anns.concat(badge);
    if (groupLeg) {
      // Stack group legend below tier badge if both present
      if (badge) groupLeg.yshift = -78;
      anns = anns.concat(groupLeg);
    }
    if (badge || groupLeg) {
      layout.annotations = anns;
      layout.margin.b = groupLeg && badge ? 100 : 80;
    }
  }

  function tierBadgeLegend(items, t) {
    return {
      text: '<i>\u2020 from figures/analytics &nbsp; * from asymptotics</i>',
      xref: 'paper', yref: 'paper', x: 0, y: 0, yanchor: 'top', yshift: -60,
      showarrow: false, font: { size: 11, color: t.muted }
    };
  }

  function isDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function themeColors() {
    var dark = isDark();
    return {
      paper: 'rgba(0,0,0,0)',
      plot: dark ? '#161b22' : '#ffffff',
      text: dark ? '#e6edf3' : '#1f2328',
      muted: dark ? '#8b949e' : '#656d76',
      grid: dark ? '#30363d' : '#d0d7de',
      font: { family: '"Ubuntu", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
    };
  }

  function baseLayout(title, extra) {
    var t = themeColors();
    var layout = {
      title: { text: title, font: { size: 16, color: t.text, family: t.font.family } },
      paper_bgcolor: t.paper,
      plot_bgcolor: t.plot,
      font: { color: t.text, family: t.font.family, size: 12 },
      margin: { t: 48, r: 24, b: 48, l: 60 },
      hoverlabel: { font: { family: t.font.family, size: 12 } }
    };
    if (extra) Object.assign(layout, extra);
    return layout;
  }

  function isMobile() { return window.innerWidth <= 900; }

  function dbSizeBytes(s) {
    return isPos(s._db_size_bytes) ? s._db_size_bytes : null;
  }

  function dbSizeLabel(s) {
    var bytes = dbSizeBytes(s);
    if (!isPos(bytes)) return null;
    if (bytes >= 1e12) return (bytes / 1e12).toFixed(1) + ' TB';
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB';
    return bytes + ' B';
  }
  function barLeftMargin() { return isMobile() ? 110 : 140; }

  function entrySizeLabel(s) {
    return s._entry_size_label || null;
  }

  // ── Variant Consolidation ──────────────────────────────
  //
  // Problem: some schemes (e.g. SimplePIR/DoublePIR, or iSimplePIR with
  // row-level/entry-level variants) produce multiple data points that are
  // visually on top of each other, cluttering scatter/bar/Pareto plots.
  //
  // Solution: group entities by scheme ID, then cluster variants whose
  // metric values are all within `threshold` (default 10%) of each other.
  // Clusters of 2+ variants are merged into a single representative point.
  //
  // The representative inherits the first variant's data and gets a
  // `_consolidated` array of all merged variant display names. The helper
  // functions consolidatedName() and consolidatedHoverSuffix() use this
  // to show a common prefix as the label and list variants on hover.
  //
  // Variants that differ by >15% on any metric remain as separate points.
  // Variants with null metric values are always kept standalone (can't compare).
  //
  // Applied to: Communication Scatter, Throughput/Server/Client/Offline bars,
  // all four Pareto 2D charts. NOT applied to
  // Heatmap (needs all variants for ranking) or Radar (per-scheme view).
  function consolidateVariants(data, metricKeys, threshold) {
    if (!threshold) threshold = 0.10;
    var schemeMap = {};
    var schemeOrder = [];
    data.forEach(function (s) {
      var key = s.id;
      if (!schemeMap[key]) { schemeMap[key] = []; schemeOrder.push(key); }
      schemeMap[key].push(s);
    });
    var result = [];
    schemeOrder.forEach(function (key) {
      var variants = schemeMap[key];
      if (variants.length <= 1) { result.push(variants[0]); return; }
      // Cluster variants by proximity on the given metrics
      var clusters = [];
      variants.forEach(function (v) {
        var vals = metricKeys.map(function (m) { return getVal(v, m); });
        if (vals.some(function (x) { return !isPos(x); })) {
          // Can't compare — keep as standalone
          result.push(v);
          return;
        }
        // Try to merge into existing cluster
        var merged = false;
        for (var i = 0; i < clusters.length; i++) {
          var cVals = metricKeys.map(function (m) { return getVal(clusters[i].rep, m); });
          var close = metricKeys.every(function (m, mi) {
            var a = vals[mi], b = cVals[mi];
            if (a === 0 && b === 0) return true;
            var maxAb = Math.max(Math.abs(a), Math.abs(b));
            return maxAb > 0 && Math.abs(a - b) / maxAb <= threshold;
          });
          if (close) { clusters[i].members.push(v); merged = true; break; }
        }
        if (!merged) clusters.push({ rep: v, members: [v] });
      });
      clusters.forEach(function (c) {
        if (c.members.length === 1) { result.push(c.rep); return; }
        // Build consolidated entity from the first member (cluster representative)
        var copy = {};
        Object.keys(c.rep).forEach(function (k) { copy[k] = c.rep[k]; });
        copy._consolidated = c.members.map(function (m) {
          var vals = {};
          metricKeys.forEach(function (mk) { vals[mk] = getVal(m, mk); });
          return { name: m.display_name, vals: vals };
        });
        copy._consolidatedThreshold = threshold;
        copy._consolidatedMetricKeys = metricKeys;
        result.push(copy);
      });
    });
    return result;
  }

  // Helper: display name for a possibly-consolidated entity
  function consolidatedName(s) {
    if (!s._consolidated || s._consolidated.length <= 1) return s.display_name;
    // Find common prefix of all variant names
    var names = s._consolidated.map(function (c) { return c.name; });
    var prefix = names.reduce(function (a, b) {
      var i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.substring(0, i);
    }).replace(/[\s\-\(]+$/, '').replace(/-[a-z]$/i, '');
    if (prefix.length > 3) return prefix;
    return s.display_name;
  }

  // Helper: hover text suffix for consolidated variants.
  // Shows each variant with its metric values, plus the merge threshold.
  // e.g. "Merged (within 10%): SimplePIR (9.9 GB/s), DoublePIR (7.4 GB/s)"
  function consolidatedHoverSuffix(s) {
    if (!s._consolidated || s._consolidated.length <= 1) return '';
    var pct = Math.round((s._consolidatedThreshold || 0.15) * 100);
    var keys = s._consolidatedMetricKeys || [];
    var parts = s._consolidated.map(function (c) {
      var valParts = keys.map(function (mk) {
        var v = c.vals[mk];
        return isPos(v) ? formatNum(v) + ' ' + (METRIC_UNITS[mk] || '') : 'N/A';
      });
      return c.name + ' (' + valParts.join(', ') + ')';
    });
    return '<br><i>Variants merged (because \u2264' + pct + '% different): ' + parts.join('; ') + '</i>';
  }

  // ── Text Overlap Avoidance ─────────────────────────────
  //
  // For log-log scatter plots and Pareto charts, data points that are close
  // in log-space would have overlapping text labels if all set to 'top center'.
  // This function assigns each point a text position from a rotating list
  // based on how many nearby points precede it.
  //
  // pts: array of {x, y, key} where x,y are raw (pre-log) axis values.
  // Returns: map from key → Plotly textposition string.
  // Proximity threshold: 0.4 decades in both log(x) and log(y).
  function avoidTextOverlap(pts) {
    var positions = ['top center', 'bottom center', 'top right', 'bottom right', 'top left', 'bottom left', 'middle right', 'middle left'];
    var logPts = pts.map(function (p) {
      return { lx: Math.log10(Math.max(p.x, 1e-6)), ly: Math.log10(Math.max(p.y, 1e-6)), key: p.key };
    });
    logPts.sort(function (a, b) { return a.lx - b.lx || a.ly - b.ly; });
    var posMap = {};
    logPts.forEach(function (pt, i) {
      var nearby = 0;
      for (var j = 0; j < i; j++) {
        if (Math.abs(logPts[j].lx - pt.lx) < 0.4 && Math.abs(logPts[j].ly - pt.ly) < 0.4) {
          nearby++;
        }
      }
      posMap[pt.key] = positions[nearby % positions.length];
    });
    return posMap;
  }

  // Filter entities to those that have benchmarks in the given DB-size tier,
  // and swap in tier-specific metrics. Each entity may have benchmarks across
  // multiple DB sizes (e.g. a scheme tested on both 1GB and 8GB databases).
  // This function picks the tier-specific benchmark and creates a shallow copy
  // with that benchmark's metrics, data_tier, source_ref, estimation_meta, and config details.
  // Used by the DB-size tab system to re-render charts for a specific scale.
  // General filter: select benchmarks matching both a DB tier and entry bucket.
  // dbTier: string or null (null = any DB size)
  // entryBuckets: Set of bucket ids, or null (null/empty = any entry size)
  // Returns a new entity array with metrics swapped to the best matching benchmark.
  // Filter data using a section state object { primaryDim, activeDbTier, activeEntryBucket, secondaryFilters }
  function filterData(data, sectionState) {
    var dbTier, entryBuckets;
    if (!sectionState || typeof sectionState === 'string') {
      // Legacy call: filterData(data, tierString) — used by radar/heatmap
      dbTier = sectionState || null;
      entryBuckets = null;
    } else if (sectionState.primaryDim === 'entry') {
      dbTier = null;
      entryBuckets = null;
      // Filter by entry bucket primary + optional DB tier pills
      var activeEntry = sectionState.activeEntryBucket;
      var dbPills = sectionState.secondaryFilters.size > 0 ? sectionState.secondaryFilters : null;
      return data.map(function (s) {
        var best = null;
        (s._allBenchmarks || []).forEach(function (rec) {
          var entryOk = rec._entryBucket === activeEntry;
          var dbOk = !dbPills || dbPills.has(rec._dbTier);
          if (!entryOk || !dbOk) return;
          if (!best || rec._db_size_bytes > best._db_size_bytes ||
              (rec._db_size_bytes === best._db_size_bytes && rec.data_tier < best.data_tier)) {
            best = rec;
          }
        });
        if (!best) return null;
        var copy = {};
        Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
        copy.concrete = best.metrics;
        copy.data_tier = best.data_tier;
        copy.source_ref = best.source_ref;
        copy.estimation_meta = best.estimation_meta;
        copy._db_size_bytes = best._db_size_bytes;
        copy._entry_size_bytes = best._config.entry_size_bytes;
        copy._entry_size_label = best._config.entry_size_label;
        copy._num_entries = best._config.num_entries;
        return copy;
      }).filter(Boolean);
    } else {
      // DB primary
      dbTier = sectionState.activeDbTier;
      entryBuckets = sectionState.secondaryFilters.size > 0 ? sectionState.secondaryFilters : null;
    }
    var hasEntryFilter = entryBuckets && entryBuckets.size > 0;
    return data.map(function (s) {
      var best = null;
      (s._allBenchmarks || []).forEach(function (rec) {
        var dbOk = !dbTier || rec._dbTier === dbTier;
        var entryOk = !hasEntryFilter || entryBuckets.has(rec._entryBucket);
        if (!dbOk || !entryOk) return;
        if (!best || rec._db_size_bytes > best._db_size_bytes ||
            (rec._db_size_bytes === best._db_size_bytes && rec.data_tier < best.data_tier)) {
          best = rec;
        }
      });
      if (!best) return null;
      var copy = {};
      Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
      copy.concrete = best.metrics;
      copy.data_tier = best.data_tier;
      copy.source_ref = best.source_ref;
      copy.estimation_meta = best.estimation_meta;
      copy._db_size_bytes = best._db_size_bytes;
      copy._entry_size_bytes = best._config.entry_size_bytes;
      copy._entry_size_label = best._config.entry_size_label;
      copy._num_entries = best._config.num_entries;
      return copy;
    }).filter(Boolean);
  }

  // Convenience wrapper matching old filterByDbSize signature (used by radar)
  function filterByDbSize(data, tier) {
    return filterData(data, tier);
  }

  function plotConfig() {
    return { responsive: true, displayModeBar: false };
  }

  function formatNum(v) {
    if (typeof v !== 'number' || !isFinite(v)) return '\u2014';
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
    if (v >= 1) return v.toFixed(v < 10 ? 2 : 1);
    return v.toPrecision(3);
  }

  // ── Composite Scoring ──────────────────────────────────
  //
  // Computes three things on each entity:
  //
  // 1. _composite (0–1): average percentile rank across 4 core metrics
  //    (query_size, response_size, server_time, throughput). Lower = better.
  //    - Rank 0 = best value in the dataset, rank 1 = worst.
  //    - Tier 3 discount: ranks are compressed toward midpoint (×0.8+0.1)
  //      to avoid giving asymptotic estimates the same weight as measured data.
  //    - Coverage penalty: +0.1 per missing core metric, but only when fewer
  //      than 3 of 4 are available (1 missing = no penalty; 2 missing = +0.2;
  //      3 missing = +0.3; 0 available = composite forced to 1.0).
  //      so schemes with incomplete data don't unfairly rank high.
  //    - Used for: heatmap default sort, radar sort within groups.
  //
  // 2. _ranks (per ALL_METRICS): percentile rank for each of the 7 metrics.
  //    Used for: heatmap cell colors (green=best, red=worst), radar "relative" mode.
  //    Note: tied values get the same rank via indexOf (min-rank, not midpoint).
  //
  // 3. _absNorm (per ALL_METRICS): log-scale min-max normalization (0=best, 1=worst).
  //    Used for: radar "absolute" mode. Unlike percentile ranks which only care
  //    about ordering, absNorm preserves the magnitude of differences.
  //
  function computeCompositeScores(data) {
    // Step 1: collect values per core metric for percentile ranking
    var metricVals = {};
    CORE_METRICS.forEach(function (m) { metricVals[m] = []; });

    data.forEach(function (s) {
      CORE_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (isPos(v)) metricVals[m].push(v);
      });
    });

    // sort each metric for ranking
    CORE_METRICS.forEach(function (m) {
      if (HIGHER_IS_BETTER[m]) {
        metricVals[m].sort(function (a, b) { return b - a; }); // highest first = rank 0
      } else {
        metricVals[m].sort(function (a, b) { return a - b; }); // lowest first = rank 0
      }
    });

    // Step 2: compute per-scheme percentile ranks + composite
    data.forEach(function (s) {
      var ranks = [];
      var available = 0;
      CORE_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (isPos(v)) {
          var idx = metricVals[m].indexOf(v);
          var rank = metricVals[m].length > 1 ? idx / (metricVals[m].length - 1) : 0.5;
          // Tier 3 discount: push toward midpoint
          if (s.data_tier === 3) {
            rank = rank * 0.8 + 0.1;
          }
          ranks.push(rank);
          available++;
        }
      });

      // Penalize schemes missing core metrics: +0.1 per missing metric when <3 available.
      // A scheme reporting only 1 of 4 core metrics gets +0.3 penalty, making it rank lower
      // than a scheme with full data. Schemes with 0 metrics get composite = 1.0 (worst).
      var coveragePenalty = available < 3 ? 0.1 * (4 - available) : 0;
      s._composite = ranks.length > 0 ? (ranks.reduce(function (a, b) { return a + b; }, 0) / ranks.length) + coveragePenalty : 1.0;
      s._coreAvailable = available;
    });

    // Also compute per-metric percentile ranks for ALL metrics (for heatmap)
    var allMetricVals = {};
    ALL_METRICS.forEach(function (m) { allMetricVals[m] = []; });
    data.forEach(function (s) {
      ALL_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (isPos(v)) allMetricVals[m].push(v);
      });
    });
    ALL_METRICS.forEach(function (m) {
      if (HIGHER_IS_BETTER[m]) {
        allMetricVals[m].sort(function (a, b) { return b - a; });
      } else {
        allMetricVals[m].sort(function (a, b) { return a - b; });
      }
    });

    data.forEach(function (s) {
      s._ranks = {};
      ALL_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (isPos(v)) {
          var idx = allMetricVals[m].indexOf(v);
          s._ranks[m] = allMetricVals[m].length > 1 ? idx / (allMetricVals[m].length - 1) : 0.5;
        } else {
          s._ranks[m] = null;
        }
      });
    });

    // Absolute normalization: map each metric value to [0,1] using log-scale min-max.
    // Unlike percentile ranks which only preserve ordinal position, this preserves
    // the relative magnitude of differences (e.g. a 10ms vs 10000ms gap is wider
    // than 10ms vs 20ms). Used for radar "absolute" mode.
    var absMin = {}, absMax = {};
    ALL_METRICS.forEach(function (m) {
      var vals = allMetricVals[m].filter(function (v) { return v > 0; });
      if (!vals.length) { absMin[m] = 0; absMax[m] = 1; return; }
      var logs = vals.map(function (v) { return Math.log(v); });
      absMin[m] = Math.min.apply(null, logs);
      absMax[m] = Math.max.apply(null, logs);
    });
    data.forEach(function (s) {
      s._absNorm = {};
      ALL_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (isPos(v)) {
          var logV = Math.log(v);
          var range = absMax[m] - absMin[m];
          var norm = range > 0 ? (logV - absMin[m]) / range : 0.5;
          // Invert for higher-is-better so 0 = best for all metrics
          s._absNorm[m] = HIGHER_IS_BETTER[m] ? 1 - norm : norm;
        } else {
          s._absNorm[m] = null;
        }
      });
    });

    return data;
  }

  // ── 1. Sorted Heatmap ─────────────────────────────────
  //
  // A color-coded matrix: Y-axis = scheme names (sorted by composite score,
  // best at top), X-axis = 7 metrics. Cell color encodes percentile rank
  // (green = best, yellow = mid, red = worst). Cell text shows the raw value
  // with a tier badge († for Tier 2, * for Tier 3).
  //
  // Clicking any cell re-sorts by that cell's metric column. The heatmap operates
  // on un-consolidated data (all variants shown) since ranking needs the
  // full population.
  //
  // Title: "Data Reported in the Paper" — emphasizes these are author-reported numbers.
  //
  function buildHeatmapData(sorted) {
    var metricLabels = ALL_METRICS.map(function (m) { return METRIC_LABELS[m]; });
    // z[scheme_idx][metric_idx] for Plotly heatmap (y=schemes, x=metrics)
    var z = [];
    var text = [];
    var hoverText = [];

    sorted.forEach(function (s) {
      var row = [];
      var tRow = [];
      var hRow = [];
      ALL_METRICS.forEach(function (m) {
        var rank = s._ranks[m];
        row.push(isNum(rank) ? rank : NaN);
        var raw = getVal(s, m);
        tRow.push(isPos(raw) ? formatNum(raw) + TIER_BADGE[s.data_tier] : '');
        var lbl = METRIC_LABELS[m];
        var lblMatch = lbl.match(/^(.+?) \((.+)\)$/);
        if (!isPos(raw)) {
          hRow.push('');
        } else {
          var hoverVal = lblMatch ? formatNum(raw) + ' ' + lblMatch[2] : formatNum(raw);
          var hover = s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>' + (lblMatch ? lblMatch[1] : lbl) + ': ' + hoverVal +
            '<br>Tier: ' + TIER_LABELS[s.data_tier] +
            '<br>Group: ' + s.group + ' (' + GROUP_NAMES[s.group] + ')' +
            '<br>Composite: ' + s._composite.toFixed(3) +
            '<br>Source: ' + (s.source_ref || 'N/A');
          if (s.data_tier >= 2 && s.estimation_meta) {
            hover += '<br>Confidence: ' + (s.estimation_meta.confidence || 'N/A');
            if (s.estimation_meta.method) {
              var method = s.estimation_meta.method;
              if (method.length > 120) method = method.slice(0, 120) + '...';
              hover += '<br>Method: ' + method;
            }
          }
          hRow.push(hover);
        }
      });
      z.push(row);
      text.push(tRow);
      hoverText.push(hRow);
    });

    // group color swatches: thin bar on left margin per scheme row
    var shapes = sorted.map(function (s, i) {
      return {
        type: 'rect', xref: 'paper', yref: 'y',
        x0: -0.008, x1: 0, y0: i - 0.5, y1: i + 0.5,
        fillcolor: GROUP_COLORS[s.group], line: { width: 0 }
      };
    });

    return { z: z, text: text, hoverText: hoverText, metricLabels: metricLabels, shapes: shapes };
  }

  function renderHeatmap(data) {
    var el = document.getElementById('chart-heatmap');
    if (!el) return;

    // sort best (lowest composite) at top → reverse so Plotly puts index 0 at bottom
    var sorted = data.slice().sort(function (a, b) { return b._composite - a._composite; });
    var t = themeColors();
    var schemes = sorted.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + s.display_name; });
    var hd = buildHeatmapData(sorted);

    var trace = {
      z: hd.z,
      x: hd.metricLabels,
      y: schemes,
      type: 'heatmap',
      colorscale: [[0, '#22c55e'], [0.5, '#eab308'], [1, '#ef4444']],
      text: hd.text,
      texttemplate: '%{text}',
      textfont: { size: isMobile() ? 8 : 10 },
      hovertext: hd.hoverText,
      hoverinfo: 'text',
      showscale: false,
      zmin: 0, zmax: 1,
      xgap: 2, ygap: 1
    };

    var titleText = 'Data Reported in the Paper<br><span style="font-size:11px;font-weight:normal;color:' + t.muted + '"><i>Click inside a column to sort by it</i></span>';
    var layout = baseLayout(titleText, {
      title: { text: titleText, font: { size: 16, color: t.text, family: t.font.family }, y: 0.98, yanchor: 'top', pad: { b: 0 } },
      xaxis: {
        tickfont: { size: isMobile() ? 9 : 11 }, side: 'top',
        gridcolor: t.grid
      },
      yaxis: {
        tickfont: { size: isMobile() ? 8 : 10 }, autorange: true,
        gridcolor: t.grid
      },
      margin: { t: 150, r: isMobile() ? 20 : 80, b: 24, l: isMobile() ? 72 : 160 },
      shapes: hd.shapes,
      height: Math.max(500, sorted.length * 22 + 120),
      annotations: hd.annotations || []
    });

    Plotly.newPlot(el, [trace], layout, plotConfig());

    // cursor pointer on heatmap cells (sortable by click)
    var plotArea = el.querySelector('.nsewdrag');
    if (plotArea) plotArea.style.cursor = 'pointer';

    // click any cell to re-sort by that cell's metric column
    el.on('plotly_click', function (eventData) {
      if (!eventData.points.length) return;
      var pt = eventData.points[0];
      // x = metric label string; find the metric key
      var metricIdx = hd.metricLabels.indexOf(pt.x);
      if (metricIdx < 0) return;
      var metric = ALL_METRICS[metricIdx];

      var reSorted = data.slice().sort(function (a, b) {
        var va = getVal(a, metric);
        var vb = getVal(b, metric);
        var aMissing = !isPos(va);
        var bMissing = !isPos(vb);
        if (aMissing && bMissing) return 0;
        if (aMissing) return -1; // nulls at bottom (index 0 in Plotly = visual bottom)
        if (bMissing) return 1;
        // reversed sort: worst at index 0 (bottom), best at top
        return HIGHER_IS_BETTER[metric] ? va - vb : vb - va;
      });

      var newSchemes = reSorted.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + s.display_name; });
      var nhd = buildHeatmapData(reSorted);

      Plotly.react(el, [{
        z: nhd.z, x: nhd.metricLabels, y: newSchemes,
        type: 'heatmap',
        colorscale: [[0, '#22c55e'], [0.5, '#eab308'], [1, '#ef4444']],
        text: nhd.text, texttemplate: '%{text}', textfont: { size: isMobile() ? 8 : 10 },
        hovertext: nhd.hoverText, hoverinfo: 'text',
        showscale: false,
        zmin: 0, zmax: 1, xgap: 2, ygap: 1
      }], Object.assign({}, layout, { shapes: nhd.shapes }), plotConfig());
    });
  }

  // ── 2. Communication Scatter ──────────────────────────
  //
  // Log-log scatter: X = query size (KB), Y = response size (KB).
  // Marker size encodes server_time_ms (log-scaled). Marker shape encodes
  // data tier (circle/square/diamond). Color encodes group (1a/1b/2a/2b/X).
  // Diagonal reference lines at 10/100/1K/10K KB. On log-log axes these are
  // straight lines (iso-product), serving as approximate visual guides for
  // total communication magnitude (exact iso-sum curves would be hyperbolic).
  // Variant consolidation merges nearby same-scheme variants into one dot.
  // Text positions are assigned by avoidTextOverlap() to reduce label collisions.
  //
  function renderCommunicationScatter(data) {
    var el = document.getElementById('chart-communication');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['query_size_kb', 'response_size_kb']);

    var traces = [];
    var groups = {};
    var overlapPts = [];
    data.forEach(function (s, idx) {
      var qk = getVal(s, 'query_size_kb');
      var rk = getVal(s, 'response_size_kb');
      if (!isPos(qk) || !isPos(rk)) return;
      overlapPts.push({ x: qk, y: rk, key: idx });
      if (!groups[s.group]) groups[s.group] = { x: [], y: [], text: [], names: [], positions: [], marker: { color: [], opacity: [], size: [], symbol: [] } };
      var g = groups[s.group];
      g.x.push(qk);
      g.y.push(rk);
      g.names.push(consolidatedName(s));
      g.positions.push(idx);
      g.text.push(consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Query: ' + formatNum(qk) + ' KB<br>Response: ' + formatNum(rk) + ' KB<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s));
      g.marker.color.push(GROUP_COLORS[s.group]);
      g.marker.opacity.push(TIER_OPACITY[s.data_tier]);
      var st = getVal(s, 'server_time_ms');
      g.marker.size.push(isPos(st) ? Math.max(8, Math.min(30, Math.log10(st + 1) * 8)) : 10);
      g.marker.symbol.push(s.data_tier === 3 ? 'diamond' : s.data_tier === 2 ? 'square' : 'circle');
    });
    var posMap = avoidTextOverlap(overlapPts);

    // Group legend entries — thick line for rectangular color patches
    Object.keys(groups).forEach(function (g) {
      traces.push({
        x: [null], y: [null],
        mode: 'lines',
        type: 'scatter',
        name: GROUP_NAMES[g],
        legendgroup: 'groups',
        legendgrouptitle: { text: 'Groups', font: { size: 11, color: t.muted } },
        legendrank: 1,
        line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });

    // Group data traces — hidden from legend
    Object.keys(groups).forEach(function (g) {
      traces.push({
        x: groups[g].x, y: groups[g].y,
        mode: 'markers+text',
        type: 'scatter',
        name: GROUP_NAMES[g],
        showlegend: false,
        legendgroup: 'group-' + g,
        text: groups[g].names,
        textposition: groups[g].positions.map(function (idx) { return posMap[idx] || 'top center'; }),
        cliponaxis: false,
        textfont: { size: isMobile() ? 7 : 9, color: t.muted },
        hovertext: groups[g].text,
        hoverinfo: 'text',
        marker: {
          color: groups[g].marker.color,
          opacity: groups[g].marker.opacity,
          size: isMobile() ? groups[g].marker.size.map(function (s) { return Math.max(6, s * 0.7); }) : groups[g].marker.size,
          symbol: groups[g].marker.symbol,
          line: { width: 1, color: t.text }
        }
      });
    });

    // Tier legend entries — unfilled shapes
    var tierShapes = { 1: 'circle', 2: 'square', 3: 'diamond' };
    var tierNames = { 1: 'From data', 2: 'From figures/analytics', 3: 'From asymptotics' };
    [1, 2, 3].forEach(function (tier) {
      traces.push({
        x: [null], y: [null],
        mode: 'markers',
        type: 'scatter',
        name: tierNames[tier],
        legendgroup: 'tiers',
        legendgrouptitle: { text: 'Data Source', font: { size: 11, color: t.muted } },
        legendrank: 2,
        marker: {
          symbol: tierShapes[tier],
          size: 10,
          color: 'rgba(0,0,0,0)',
          line: { width: 2, color: t.text }
        },
        hoverinfo: 'skip'
      });
    });

    // iso-communication diagonals
    [10, 100, 1000, 10000].forEach(function (total) {
      traces.push({
        x: [0.01, total], y: [total, 0.01],
        mode: 'lines', type: 'scatter',
        line: { dash: 'dot', width: 1, color: t.muted },
        showlegend: false, hoverinfo: 'skip'
      });
    });

    var layout = baseLayout('Query v Response', {
      xaxis: {
        title: 'Query Size', type: 'log', gridcolor: t.grid,
        tickvals: isMobile() ? [0.1, 1, 10, 100, 1000, 10000] : [0.01, 0.1, 1, 10, 100, 1000, 10000],
        ticktext: isMobile() ? ['0.1K', '1K', '10K', '100K', '1M', '10M'] : ['0.01 KB', '0.1 KB', '1 KB', '10 KB', '100 KB', '1 MB', '10 MB'],
        tickfont: { size: isMobile() ? 9 : 12 }
      },
      yaxis: {
        title: 'Response Size', type: 'log', gridcolor: t.grid,
        tickvals: isMobile() ? [0.1, 1, 10, 100, 1000, 10000] : [0.01, 0.1, 1, 10, 100, 1000, 10000],
        ticktext: isMobile() ? ['0.1K', '1K', '10K', '100K', '1M', '10M'] : ['0.01 KB', '0.1 KB', '1 KB', '10 KB', '100 KB', '1 MB', '10 MB'],
        tickfont: { size: isMobile() ? 9 : 12 }
      },
      margin: { t: 48, r: isMobile() ? 16 : 48, b: 100, l: isMobile() ? 44 : 60 },
      legend: { orientation: 'h', x: 0, y: isMobile() ? -0.18 : -0.12, traceorder: 'grouped', groupclick: 'toggleitem', font: { size: isMobile() ? 9 : 11 } },
      height: isMobile() ? 550 : 750
    });

    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── 3. Server Performance (Throughput + Server Time) ─────────
  // Both charts share the same height so they align in the chart-pair layout.
  // Reported values shown as solid bars; derived values shown hatched.
  // Long y-labels are wrapped to two lines.

  function _wrapLabel(label, maxLen) {
    if (label.length <= maxLen) return label;
    // Break at space nearest to the midpoint
    var mid = Math.floor(maxLen * 0.6);
    var best = -1;
    for (var i = 0; i < label.length; i++) {
      if (label[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
    if (best > 0) return label.slice(0, best) + '<br>' + label.slice(best + 1);
    return label;
  }

  function _serverPerfLabel(s) {
    return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + _wrapLabel(consolidatedName(s), 22);
  }

  // Shared annotation builder for server perf charts
  function _serverPerfAnnotations(items, t, hasDerived, derivedText) {
    var anns = [];
    var yPos = -60;
    var badge = tierBadgeLegend(items, t);
    if (badge) { anns = anns.concat(badge); yPos -= 18; }
    anns.push({
      text: '\u2588 reported &nbsp; <span style="letter-spacing:-2px">///</span> ' + derivedText,
      xref: 'paper', yref: 'paper', x: 0.5, xanchor: 'center', y: 0, yanchor: 'top', yshift: yPos,
      showarrow: false, font: { size: 11, color: t.muted }
    });
    yPos -= 18;
    // Group color legend — always show all groups, split into two lines
    var groups = Object.keys(GROUP_COLORS);
    if (groups.length > 1) {
      var parts = groups.map(function (g) {
        return '<span style="color:' + (GROUP_COLORS[g] || '#999') + '">\u25A0</span> ' + (GROUP_NAMES[g] || g);
      });
      var mid = Math.ceil(parts.length / 2);
      var line1 = parts.slice(0, mid).join(' &nbsp; ');
      var line2 = parts.slice(mid).join(' &nbsp; ');
      anns.push({
        text: line1 + '<br>' + line2,
        xref: 'paper', yref: 'paper', x: 0.5, xanchor: 'center', y: 0, yanchor: 'top', yshift: yPos,
        showarrow: false, font: { size: 11, color: t.muted }
      });
      yPos -= 36;
    }
    var bottomPad = 48 + Math.abs(yPos + 60) + 10;
    return { anns: anns, bottomPad: bottomPad };
  }

  // Prepare throughput items (with derivation from server_time)
  function _prepareThroughputItems(data) {
    var augmented = data.map(function (s) {
      var reported = getVal(s, 'throughput_gbps');
      var st = getVal(s, 'server_time_ms');
      var dbBytes = s._db_size_bytes || 0;
      if (!isPos(reported) && isPos(st) && dbBytes > 0) {
        var copy = {}; Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
        copy.concrete = {}; Object.keys(s.concrete).forEach(function (k) { copy.concrete[k] = s.concrete[k]; });
        copy.concrete.throughput_gbps = (dbBytes / 1e9) / (st / 1000);
        copy._tputDerived = true;
        return copy;
      }
      return s;
    });
    augmented = consolidateVariants(augmented, ['throughput_gbps']);
    var items = augmented.filter(function (s) { return isPos(getVal(s, 'throughput_gbps')); });
    items.forEach(function (s) {
      s._tput = getVal(s, 'throughput_gbps');
      if (!s.hasOwnProperty('_tputDerived')) s._tputDerived = false;
    });
    items.sort(function (a, b) { return b._tput - a._tput; });
    return items;
  }

  // Prepare server-time items (with derivation from throughput)
  function _prepareServerTimeItems(data) {
    var augmented = data.map(function (s) {
      var reported = getVal(s, 'server_time_ms');
      var tput = getVal(s, 'throughput_gbps');
      var dbBytes = s._db_size_bytes || 0;
      if (!isPos(reported) && isPos(tput) && dbBytes > 0) {
        var copy = {}; Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
        copy.concrete = {}; Object.keys(s.concrete).forEach(function (k) { copy.concrete[k] = s.concrete[k]; });
        copy.concrete.server_time_ms = (dbBytes / 1e9) / tput * 1000;
        copy._stDerived = true;
        return copy;
      }
      return s;
    });
    augmented = consolidateVariants(augmented, ['server_time_ms']);
    var items = augmented.filter(function (s) { return isPos(getVal(s, 'server_time_ms')); });
    items.forEach(function (s) {
      s._st = getVal(s, 'server_time_ms');
      if (!s.hasOwnProperty('_stDerived')) s._stDerived = false;
    });
    items.sort(function (a, b) { return a._st - b._st; });
    return items;
  }

  function renderThroughputBars(tputItems, sharedHeight) {
    var el = document.getElementById('chart-throughput');
    if (!el) return;
    var t = themeColors();
    var items = tputItems;
    var hasDerived = items.some(function (s) { return s._tputDerived; });

    var traces = [{
      y: items.map(function (s) { return _serverPerfLabel(s); }),
      x: items.map(function (s) { return s._tput; }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        pattern: { shape: items.map(function (s) { return s._tputDerived ? '/' : ''; }) },
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return formatNum(s._tput) + ' GB/s'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var derivedNote = s._tputDerived ? '<br><i>Derived from DB size \u00F7 server time</i>' : '';
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + derivedNote + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];

    var ann = _serverPerfAnnotations(items, t, hasDerived, 'derived from DB size \u00F7 server time');
    var layout = baseLayout('Server Throughput — DB Scan Rate (GB/s)', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Throughput (log)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: ann.bottomPad },
      height: sharedHeight,
      annotations: ann.anns
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  function renderServerTimeBars(stItems, sharedHeight) {
    var el = document.getElementById('chart-server-time');
    if (!el) return;
    var t = themeColors();
    var items = stItems;
    var hasDerived = items.some(function (s) { return s._stDerived; });

    var traces = [{
      y: items.map(function (s) { return _serverPerfLabel(s); }),
      x: items.map(function (s) { return s._st; }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        pattern: { shape: items.map(function (s) { return s._stDerived ? '/' : ''; }) },
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return formatNum(s._st) + ' ms'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var derivedNote = s._stDerived ? '<br><i>Derived from DB size \u00F7 throughput</i>' : '';
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + derivedNote + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];

    var ann = _serverPerfAnnotations(items, t, hasDerived, 'derived from DB size \u00F7 throughput');
    var layout = baseLayout('Server Time (ms)', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Server Time (log)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: ann.bottomPad },
      height: sharedHeight,
      annotations: ann.anns
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── 4. Client Compute Bars ───────────────────────────────
  // Horizontal bars ranked by client_time_ms (lower is better).
  function renderClientCost(data) {
    var el = document.getElementById('chart-client-cost');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['client_time_ms']);

    var items = data.filter(function (s) { return isPos(getVal(s, 'client_time_ms')); });
    items.sort(function (a, b) { return getVal(a, 'client_time_ms') - getVal(b, 'client_time_ms'); });

    var traces = [{
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + consolidatedName(s); }),
      x: items.map(function (s) { return getVal(s, 'client_time_ms'); }),
      type: 'bar', orientation: 'h',
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'client_time_ms')) + ' ms'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];
    var layout = baseLayout('Client Computation Time (ms)', {
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: 'Client Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(300, items.length * 30 + 100)
    });
    addLegendAnnotations(layout, items, t);
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── 5. Offline & Storage Bar Chart ───────────────────
  // Grouped horizontal bars: blue = offline communication (MB),
  // amber = client-side storage (MB). Sorted by max of the two values.
  // These metrics only apply to preprocessing-based schemes (Groups C, D).
  function renderOfflineStorage(data) {
    var el = document.getElementById('chart-offline-storage');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['offline_comm_mb', 'client_storage_mb']);

    var HINT_COLOR = '#3b82f6';
    var STORAGE_COLOR = '#f59e0b';

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'offline_comm_mb')) || isPos(getVal(s, 'client_storage_mb'));
    });

    // sort by max of the two values (largest at top)
    items.sort(function (a, b) {
      var aMax = Math.max(getVal(a, 'offline_comm_mb') || 0, getVal(a, 'client_storage_mb') || 0);
      var bMax = Math.max(getVal(b, 'offline_comm_mb') || 0, getVal(b, 'client_storage_mb') || 0);
      return aMax - bMax;
    });

    var schemes = items.map(function (s) { return consolidatedName(s); });
    var traces = [];

    // Offline comm bars
    traces.push({
      y: schemes,
      x: items.map(function (s) { return getVal(s, 'offline_comm_mb'); }),
      type: 'bar', orientation: 'h',
      name: 'Offline',
      marker: { color: HINT_COLOR, opacity: 0.85, line: { color: HINT_COLOR, width: 1.5 } },
      text: items.map(function (s) {
        var v = getVal(s, 'offline_comm_mb');
        return isPos(v) ? formatNum(v) + ' MB' : '';
      }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'offline_comm_mb');
        return isPos(v) ? consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Offline: ' + formatNum(v) + ' MB<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s) : '';
      }),
      hoverinfo: 'text'
    });

    // Client storage bars
    traces.push({
      y: schemes,
      x: items.map(function (s) { return getVal(s, 'client_storage_mb'); }),
      type: 'bar', orientation: 'h',
      name: 'Client Storage',
      marker: { color: STORAGE_COLOR, opacity: 0.85, line: { color: STORAGE_COLOR, width: 1.5 } },
      text: items.map(function (s) {
        var v = getVal(s, 'client_storage_mb');
        return isPos(v) ? formatNum(v) + ' MB' : '';
      }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'client_storage_mb');
        return isPos(v) ? consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Client Storage: ' + formatNum(v) + ' MB' + storageNote(s) + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s) : '';
      }),
      hoverinfo: 'text'
    });

    var layout = baseLayout('Offline & Client Storage', {
      barmode: 'group',
      xaxis: { title: 'Size (MB)', gridcolor: t.grid },
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      legend: { orientation: 'h', x: 0, y: -0.12, font: { size: 11 } },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 100 },
      height: Math.max(400, items.length * 40 + 160)
    });
    var badge = tierBadgeLegend(items, t);
    if (badge) { badge.yshift = -70; layout.annotations = (layout.annotations || []).concat(badge); }
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── 5b. Preprocessing Time Bar Chart ──────────────────
  // Horizontal grouped bars: server_preprocessing_time_ms (blue-ish) and
  // client_preprocessing_time_ms (orange-ish). Log x-axis, sorted by max of the two.
  var CLIENT_PREPROC_NOTE = {
    simplepir_2022: 'NOTE: seed expansion estimate — A ∈ Z_q^{~31K×1024}, ~127 MB PRG at ~2.5 GB/s (Section 4.1 p.7, Figure 18 p.30)',
    doublepir_2022: 'NOTE: seed expansion estimate — A_1+A_2 ∈ Z_q^{~80K×1024}, ~328 MB PRG at ~2.5 GB/s (Section 5.1 p.8, Figure 18 p.30)'
  };
  var PREPROC_DESC = {
    simplepir_2022: 'Expand A from seed + download hint',
    doublepir_2022: 'Expand A_1,A_2 from seeds + download hint',
    frodopir_2022: 'Server: M=A·D; Client: derive A from seed',
    hintlesspir_2023: 'Encode DB into RLWE-friendly form',
    respire_2024: 'Pack DB via ring packing + NTT',
    npir_2026: 'Encode DB as NTRU polynomials',
    incrementalpir_2026: 'Download + store incremental hint',
    piano_2023: 'Stream DB, build PRF hint sets',
    rms24_2024: 'Stream DB, build partition hints',
    spiral_2022: 'Generate + upload evaluation keys',
    onionpirv2_2025: 'Convert DB to NTT domain',
    thorpir_2024: 'Client-dependent FHE preprocessing'
  };

  function renderPreprocessingTime(data) {
    var el = document.getElementById('chart-preprocessing-time');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['server_preprocessing_time_ms', 'client_preprocessing_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'server_preprocessing_time_ms')) || isPos(getVal(s, 'client_preprocessing_time_ms'));
    });
    items.sort(function (a, b) {
      var av = Math.max(getVal(a, 'server_preprocessing_time_ms') || 0, getVal(a, 'client_preprocessing_time_ms') || 0);
      var bv = Math.max(getVal(b, 'server_preprocessing_time_ms') || 0, getVal(b, 'client_preprocessing_time_ms') || 0);
      return av - bv;
    });

    function fmtTime(v) { return v >= 1000 ? formatNum(v / 1000) + ' s' : formatNum(v) + ' ms'; }

    var yLabels = items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + consolidatedName(s); });

    var traces = [];
    var srvVals = items.map(function (s) { return getVal(s, 'server_preprocessing_time_ms') || 0; });
    var cliVals = items.map(function (s) { return getVal(s, 'client_preprocessing_time_ms') || 0; });

    var hasSrv = srvVals.some(function (v) { return v > 0; });
    var hasCli = cliVals.some(function (v) { return v > 0; });

    if (hasSrv) traces.push({
      name: 'Server',
      y: yLabels,
      x: srvVals.map(function (v) { return v || null; }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: srvVals.map(function (v) { return v > 0 ? fmtTime(v) : ''; }),
      textposition: 'outside', cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'server_preprocessing_time_ms');
        if (!isPos(v)) return '';
        var desc = PREPROC_DESC[s.id] || '';
        return consolidatedName(s) + (desc ? '<br><i>' + desc + '</i>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    });

    if (hasCli) traces.push({
      name: 'Client',
      y: yLabels,
      x: cliVals.map(function (v) { return v || null; }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        pattern: { shape: '/' },
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: cliVals.map(function (v) { return v > 0 ? fmtTime(v) : ''; }),
      textposition: 'outside', cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'client_preprocessing_time_ms');
        if (!isPos(v)) return '';
        var desc = PREPROC_DESC[s.id] || '';
        var note = CLIENT_PREPROC_NOTE[s.id] || '';
        return consolidatedName(s) + (desc ? '<br><i>' + desc + '</i>' : '') + (note ? '<br>' + note : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    });

    // Collect which groups are present for the HTML legend
    var seenGroups = {};
    items.forEach(function (s) { seenGroups[s.group] = true; });

    var layout = baseLayout('Preprocessing / Offline Computation Time', {
      barmode: 'group',
      showlegend: false,
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Time (ms)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: isMobile() ? 140 : 160, r: 80, t: 48, b: 50 },
      height: Math.max(300, items.length * 30 + 80)
    });
    var badge = tierBadgeLegend(items, t);
    if (badge) { layout.annotations = (layout.annotations || []).concat(badge); layout.margin.b = 80; }
    Plotly.newPlot(el, traces, layout, plotConfig());

    // HTML legend below the chart
    var legendId = 'preproc-legend';
    var existing = document.getElementById(legendId);
    if (existing) existing.remove();
    var lg = document.createElement('div');
    lg.id = legendId;
    lg.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px 18px;justify-content:center;font-size:12px;color:' + t.text + ';margin-top:-2px;';
    // Row 1: server/client distinction
    var solidSvg = '<svg width="14" height="14" style="vertical-align:middle;margin-right:3px"><rect width="14" height="14" fill="' + t.text + '"/></svg>';
    var hatchSvg = '<svg width="14" height="14" style="vertical-align:middle;margin-right:3px">' +
      '<defs><pattern id="pp-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="4" stroke="' + t.text + '" stroke-width="2"/></pattern></defs>' +
      '<rect width="14" height="14" fill="url(#pp-hatch)" stroke="' + t.text + '" stroke-width="1"/></svg>';
    lg.innerHTML = '<span>' + solidSvg + ' Server</span><span>' + hatchSvg + ' Client</span><span style="width:36px"></span>';
    // Row 2: group colors
    ['1a', '1b', '2a', '2b', 'X'].forEach(function (g) {
      if (!seenGroups[g]) return;
      lg.innerHTML += '<span><svg width="14" height="14" style="vertical-align:middle;margin-right:3px"><rect width="14" height="14" fill="' + GROUP_COLORS[g] + '"/></svg> ' + GROUP_NAMES[g] + '</span>';
    });
    el.parentNode.insertBefore(lg, el.nextSibling);
  }

  // ── 6a. Pareto Frontier — Total Comm vs Server Time ──
  //
  // Log-log scatter of total communication (query+response KB) vs server time (ms).
  // Pareto-optimal points are those not dominated by any other scheme (no other
  // scheme is weakly better on all axes and strictly better on at least one). Marked with star symbols
  // and connected by a dashed purple step-line.
  //
  // All three 2D Pareto charts (6a–c) follow the same structure:
  //   1. Consolidate nearby variants
  //   2. Filter to items with required metrics
  //   3. Compute derived axis (_totalComm = query + response)
  //   4. Identify Pareto-optimal set
  //   5. Compute text overlap avoidance positions
  //   6. Render: legend swatches → group scatter traces → Pareto line → tier legend
  //
  function renderPareto(data) {
    var el = document.getElementById('chart-pareto');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['query_size_kb', 'response_size_kb', 'server_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'query_size_kb')) && isPos(getVal(s, 'response_size_kb')) && isPos(getVal(s, 'server_time_ms'));
    });

    // Derived axis: total communication = query + response.
    // Note: _totalComm is mutated onto shared data objects. Multiple Pareto
    // functions compute the same value, so this is benign but technically a
    // shared-state mutation (flagged in audit C2 as code smell).
    items.forEach(function (s) {
      s._totalComm = getVal(s, 'query_size_kb') + getVal(s, 'response_size_kb');
    });

    // Pareto optimality (standard dominance): s is Pareto-optimal iff no other
    // scheme o is weakly better on all axes AND strictly better on at least one.
    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s && o._totalComm <= s._totalComm && getVal(o, 'server_time_ms') <= getVal(s, 'server_time_ms') &&
          (o._totalComm < s._totalComm || getVal(o, 'server_time_ms') < getVal(s, 'server_time_ms'));
      });
    });
    pareto.sort(function (a, b) { return a._totalComm - b._totalComm; });

    var posMap = avoidTextOverlap(items.map(function (s, i) {
      return { x: s._totalComm, y: getVal(s, 'server_time_ms'), key: i };
    }));
    var itemIdx = {};
    items.forEach(function (s, i) { itemIdx[s.id + '|' + s.display_name] = i; });

    var traces = [];

    // Group legend patches — thick lines render as rectangular swatches
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], mode: 'lines', type: 'scatter',
        name: GROUP_NAMES[g],
        line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });

    // all points
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s._totalComm; }),
        y: gItems.map(function (s) { return getVal(s, 'server_time_ms'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: gItems.map(function (s) { return posMap[itemIdx[s.id + '|' + s.display_name]] || 'top center'; }),
        cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });

    // Pareto step line
    if (pareto.length > 1) {
      traces.push({
        x: pareto.map(function (s) { return s._totalComm; }),
        y: pareto.map(function (s) { return getVal(s, 'server_time_ms'); }),
        mode: 'lines', type: 'scatter',
        line: { shape: 'hv', width: 2, dash: 'dash', color: '#a855f7' },
        name: 'Pareto frontier', hoverinfo: 'skip'
      });
    }

    // Shape legend: Tier 1 (circle) and Tier 3 (diamond)
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From data',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From asymptotics',
      marker: { symbol: 'diamond-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });

    Plotly.newPlot(el, traces, baseLayout('', {
      xaxis: { title: 'Total Communication (KB)', type: 'log', gridcolor: t.grid },
      yaxis: { title: 'Server Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { t: 16, r: 48, b: 100, l: 60 },
      legend: { orientation: 'h', y: -0.2 },
      height: 605
    }), plotConfig());
  }

  // ── 6b. Pareto — Total Comm vs Client Storage ───────
  // Same structure as 6a but Y-axis = client_storage_mb.
  // Shows the comm/storage tradeoff — preprocessing schemes (2a, 2b) trade
  // higher client storage for lower online communication.
  function renderParetoCommStorage(data) {
    var el = document.getElementById('chart-pareto-comm-storage');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['query_size_kb', 'response_size_kb', 'client_storage_mb']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'query_size_kb')) && isPos(getVal(s, 'response_size_kb')) && isPos(getVal(s, 'client_storage_mb'));
    });
    items.forEach(function (s) {
      s._totalComm = getVal(s, 'query_size_kb') + getVal(s, 'response_size_kb');
    });

    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s && o._totalComm <= s._totalComm && getVal(o, 'client_storage_mb') <= getVal(s, 'client_storage_mb') &&
          (o._totalComm < s._totalComm || getVal(o, 'client_storage_mb') < getVal(s, 'client_storage_mb'));
      });
    });
    pareto.sort(function (a, b) { return a._totalComm - b._totalComm; });

    var posMap = avoidTextOverlap(items.map(function (s, i) {
      return { x: s._totalComm, y: getVal(s, 'client_storage_mb'), key: i };
    }));
    var itemIdx = {};
    items.forEach(function (s, i) { itemIdx[s.id + '|' + s.display_name] = i; });

    var traces = [];
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], mode: 'lines', type: 'scatter',
        name: GROUP_NAMES[g], line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s._totalComm; }),
        y: gItems.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: gItems.map(function (s) { return posMap[itemIdx[s.id + '|' + s.display_name]] || 'top center'; }), cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Client Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' + storageNote(s) +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });
    if (pareto.length > 1) {
      traces.push({
        x: pareto.map(function (s) { return s._totalComm; }),
        y: pareto.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        mode: 'lines', type: 'scatter',
        line: { shape: 'hv', width: 2, dash: 'dash', color: '#a855f7' },
        name: 'Pareto frontier', hoverinfo: 'skip'
      });
    }
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From data',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From asymptotics',
      marker: { symbol: 'diamond-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });

    Plotly.newPlot(el, traces, baseLayout('', {
      xaxis: { title: 'Total Communication (KB)', type: 'log', gridcolor: t.grid },
      yaxis: { title: 'Client Storage (MB)', type: 'log', gridcolor: t.grid },
      margin: { t: 16, r: 48, b: 100, l: 60 },
      legend: { orientation: 'h', y: -0.2 },
      height: 605
    }), plotConfig());
  }

  // ── 6c. Pareto — Total Comm vs Client Time ──────────
  // Same structure as 6a but Y-axis = client_time_ms.
  function renderParetoCommClient(data) {
    var el = document.getElementById('chart-pareto-comm-client');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['query_size_kb', 'response_size_kb', 'client_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'query_size_kb')) && isPos(getVal(s, 'response_size_kb')) && isPos(getVal(s, 'client_time_ms'));
    });
    items.forEach(function (s) {
      s._totalComm = getVal(s, 'query_size_kb') + getVal(s, 'response_size_kb');
    });

    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s && o._totalComm <= s._totalComm && getVal(o, 'client_time_ms') <= getVal(s, 'client_time_ms') &&
          (o._totalComm < s._totalComm || getVal(o, 'client_time_ms') < getVal(s, 'client_time_ms'));
      });
    });
    pareto.sort(function (a, b) { return a._totalComm - b._totalComm; });

    var posMap = avoidTextOverlap(items.map(function (s, i) {
      return { x: s._totalComm, y: getVal(s, 'client_time_ms'), key: i };
    }));
    var itemIdx = {};
    items.forEach(function (s, i) { itemIdx[s.id + '|' + s.display_name] = i; });

    var traces = [];
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], mode: 'lines', type: 'scatter',
        name: GROUP_NAMES[g], line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s._totalComm; }),
        y: gItems.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: gItems.map(function (s) { return posMap[itemIdx[s.id + '|' + s.display_name]] || 'top center'; }), cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });
    if (pareto.length > 1) {
      traces.push({
        x: pareto.map(function (s) { return s._totalComm; }),
        y: pareto.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'lines', type: 'scatter',
        line: { shape: 'hv', width: 2, dash: 'dash', color: '#a855f7' },
        name: 'Pareto frontier', hoverinfo: 'skip'
      });
    }
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From data',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From asymptotics',
      marker: { symbol: 'diamond-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });

    Plotly.newPlot(el, traces, baseLayout('', {
      xaxis: { title: 'Total Communication (KB)', type: 'log', gridcolor: t.grid },
      yaxis: { title: 'Client Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { t: 16, r: 48, b: 100, l: 60 },
      legend: { orientation: 'h', y: -0.2 },
      height: 605
    }), plotConfig());
  }

  // ── 6d. Pareto — Server Time vs Client Time ─────────
  // Shows the server/client compute tradeoff.
  function renderParetoServerClient(data) {
    var el = document.getElementById('chart-pareto-server-client');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['server_time_ms', 'client_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'server_time_ms')) && isPos(getVal(s, 'client_time_ms'));
    });

    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s && getVal(o, 'server_time_ms') <= getVal(s, 'server_time_ms') && getVal(o, 'client_time_ms') <= getVal(s, 'client_time_ms') &&
          (getVal(o, 'server_time_ms') < getVal(s, 'server_time_ms') || getVal(o, 'client_time_ms') < getVal(s, 'client_time_ms'));
      });
    });
    pareto.sort(function (a, b) { return getVal(a, 'server_time_ms') - getVal(b, 'server_time_ms'); });

    var posMap = avoidTextOverlap(items.map(function (s, i) {
      return { x: getVal(s, 'server_time_ms'), y: getVal(s, 'client_time_ms'), key: i };
    }));
    var itemIdx = {};
    items.forEach(function (s, i) { itemIdx[s.id + '|' + s.display_name] = i; });

    var traces = [];
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], mode: 'lines', type: 'scatter',
        name: GROUP_NAMES[g], line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return getVal(s, 'server_time_ms'); }),
        y: gItems.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: gItems.map(function (s) { return posMap[itemIdx[s.id + '|' + s.display_name]] || 'top center'; }), cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server Time: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });
    if (pareto.length > 1) {
      traces.push({
        x: pareto.map(function (s) { return getVal(s, 'server_time_ms'); }),
        y: pareto.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'lines', type: 'scatter',
        line: { shape: 'hv', width: 2, dash: 'dash', color: '#a855f7' },
        name: 'Pareto frontier', hoverinfo: 'skip'
      });
    }
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From data',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'From asymptotics',
      marker: { symbol: 'diamond-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });

    Plotly.newPlot(el, traces, baseLayout('', {
      xaxis: { title: 'Server Time (ms)', type: 'log', gridcolor: t.grid },
      yaxis: { title: 'Client Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { t: 16, r: 48, b: 100, l: 60 },
      legend: { orientation: 'h', y: -0.2 },
      height: 605
    }), plotConfig());
  }

  /* ── 3D Pareto plots (commented out — may revisit) ──────────────────
  function renderPareto3DComm(data) {
    var el = document.getElementById('chart-pareto-3d-comm');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['query_size_kb', 'response_size_kb', 'client_storage_mb', 'client_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'query_size_kb')) && isPos(getVal(s, 'response_size_kb')) &&
        isPos(getVal(s, 'client_storage_mb')) && isPos(getVal(s, 'client_time_ms'));
    });
    items.forEach(function (s) {
      s._totalComm = getVal(s, 'query_size_kb') + getVal(s, 'response_size_kb');
    });

    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s &&
          o._totalComm <= s._totalComm &&
          getVal(o, 'client_storage_mb') <= getVal(s, 'client_storage_mb') &&
          getVal(o, 'client_time_ms') <= getVal(s, 'client_time_ms') &&
          (o._totalComm < s._totalComm || getVal(o, 'client_storage_mb') < getVal(s, 'client_storage_mb') || getVal(o, 'client_time_ms') < getVal(s, 'client_time_ms'));
      });
    });

    var traces = [];
    // legend-only swatches (correct group symbol)
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], z: [null], mode: 'markers', type: 'scatter3d',
        name: GROUP_NAMES[g],
        marker: { size: 8, color: GROUP_COLORS[g], symbol: GROUP_SYMBOLS_3D[g], line: { width: 1, color: t.text } },
        hoverinfo: 'skip'
      });
    });
    // data traces per group
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s._totalComm; }),
        y: gItems.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        z: gItems.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers+text', type: 'scatter3d', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: 'top center',
        textfont: { size: 9, color: t.muted },
        marker: {
          size: 6,
          color: GROUP_COLORS[g],
          symbol: GROUP_SYMBOLS_3D[g],
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Comm: ' + formatNum(s._totalComm) + ' KB<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' + storageNote(s) + '<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });
    // Pareto ring overlay
    if (pareto.length) {
      traces.push({
        x: pareto.map(function (s) { return s._totalComm; }),
        y: pareto.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        z: pareto.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers', type: 'scatter3d', name: 'Pareto-optimal',
        marker: { size: 14, color: 'rgba(0,0,0,0)', symbol: 'circle', line: { width: 3, color: '#a855f7' } },
        hovertext: pareto.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Comm: ' + formatNum(s._totalComm) + ' KB<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' + storageNote(s) + '<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            '<br><b>Pareto-optimal \u2605</b><br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    }

    Plotly.newPlot(el, traces, baseLayout('', {
      scene: {
        xaxis: { title: 'Comm (KB)', type: 'log', gridcolor: t.grid },
        yaxis: { title: 'Storage (MB)', type: 'log', gridcolor: t.grid },
        zaxis: { title: 'Client (ms)', type: 'log', gridcolor: t.grid },
        bgcolor: 'rgba(0,0,0,0)',
      },
      margin: { t: 48, r: 24, b: 24, l: 24 },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.02 },
      height: 700
    }), plotConfig());
  }

  // ── 6e. 3D Scatter — Server Time × Client Storage × Client Time ──
  // Same structure as 6d but X-axis = server_time_ms instead of total comm.
  function renderPareto3DServer(data) {
    var el = document.getElementById('chart-pareto-3d-server');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['server_time_ms', 'client_storage_mb', 'client_time_ms']);

    var items = data.filter(function (s) {
      return isPos(getVal(s, 'server_time_ms')) &&
        isPos(getVal(s, 'client_storage_mb')) && isPos(getVal(s, 'client_time_ms'));
    });

    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s &&
          getVal(o, 'server_time_ms') <= getVal(s, 'server_time_ms') &&
          getVal(o, 'client_storage_mb') <= getVal(s, 'client_storage_mb') &&
          getVal(o, 'client_time_ms') <= getVal(s, 'client_time_ms') &&
          (getVal(o, 'server_time_ms') < getVal(s, 'server_time_ms') || getVal(o, 'client_storage_mb') < getVal(s, 'client_storage_mb') || getVal(o, 'client_time_ms') < getVal(s, 'client_time_ms'));
      });
    });

    var traces = [];
    // legend-only swatches (correct group symbol)
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], z: [null], mode: 'markers', type: 'scatter3d',
        name: GROUP_NAMES[g],
        marker: { size: 8, color: GROUP_COLORS[g], symbol: GROUP_SYMBOLS_3D[g], line: { width: 1, color: t.text } },
        hoverinfo: 'skip'
      });
    });
    // data traces per group
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return getVal(s, 'server_time_ms'); }),
        y: gItems.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        z: gItems.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers+text', type: 'scatter3d', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return consolidatedName(s); }),
        textposition: 'top center',
        textfont: { size: 9, color: t.muted },
        marker: {
          size: 6,
          color: GROUP_COLORS[g],
          symbol: GROUP_SYMBOLS_3D[g],
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' + storageNote(s) + '<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    });
    // Pareto ring overlay
    if (pareto.length) {
      traces.push({
        x: pareto.map(function (s) { return getVal(s, 'server_time_ms'); }),
        y: pareto.map(function (s) { return getVal(s, 'client_storage_mb'); }),
        z: pareto.map(function (s) { return getVal(s, 'client_time_ms'); }),
        mode: 'markers', type: 'scatter3d', name: 'Pareto-optimal',
        marker: { size: 14, color: 'rgba(0,0,0,0)', symbol: 'circle', line: { width: 3, color: '#a855f7' } },
        hovertext: pareto.map(function (s) {
          return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' + storageNote(s) + '<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            '<br><b>Pareto-optimal \u2605</b><br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
        }),
        hoverinfo: 'text'
      });
    }

    Plotly.newPlot(el, traces, baseLayout('', {
      scene: {
        xaxis: { title: 'Server (ms)', type: 'log', gridcolor: t.grid },
        yaxis: { title: 'Storage (MB)', type: 'log', gridcolor: t.grid },
        zaxis: { title: 'Client (ms)', type: 'log', gridcolor: t.grid },
        bgcolor: 'rgba(0,0,0,0)',
        camera: { eye: { x: 1.5, y: 1.5, z: 0.1 } }
      },
      margin: { t: 48, r: 24, b: 24, l: 24 },
      legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.02 },
      height: 700
    }), plotConfig());
  }
  ── end commented-out 3D Pareto plots ── */

  // ── 6f. Radar — Per-Scheme Polar Plots ────────────────
  //
  // One polar plot per scheme, arranged in a 2-per-row grid. Each radar
  // shows the scheme's performance across all 7 metrics. Axes go from
  // 0 (best) to 1 (worst) at the outer edge.
  //
  // Two modes (toggled by Relative/Absolute tabs):
  //   - Relative: axes show percentile rank among peers in the same DB-size
  //     tier. A scheme at 0.2 is in the top 20% for that metric.
  //   - Absolute: axes show log-scale min-max normalization. Preserves the
  //     magnitude of performance gaps (a 100× difference isn't flattened to
  //     a single rank increment).
  //
  // Tab system: "Raw" tab shows the heatmap; per-tier tabs (≤1GB, 1–8GB, etc.)
  // show radar grids filtered to schemes benchmarked at that scale.
  //
  // Visual encoding:
  //   - Line color = group color (1a/1b/2a/2b)
  //   - Line style = data tier (solid/dashed/dotted)
  //   - Fill opacity = data tier (full/light/none)
  //   - Red "?" markers at outer edge = missing data for that metric
  //   - "(no impl)" annotation below radar if scheme has no open-source code
  //
  // Group X (Extensions) is excluded from radar per project convention.
  //
  // hoverdistance: -1 makes hover trigger anywhere on the radar, not just
  // when directly over a data point marker.
  //
  var _lastRadarTab = null;
  var _radarMode = 'relative'; // 'relative' | 'absolute'

  function renderRadar(data) {
    var tabsEl = document.getElementById('radar-tabs');
    var gridEl = document.getElementById('radar-grid');
    var allPanel = document.getElementById('radar-all-panel');
    var legendEl = document.getElementById('radar-tier-legend');
    var modeTabsEl = document.getElementById('radar-mode-tabs');
    if (!tabsEl || !gridEl) return;

    // build construction-type legend (once): tier line-styles first, taxonomy second
    if (legendEl && !legendEl.hasChildNodes()) {
      // tier line-style legend (first row)
      legendEl.className = 'construction-legend';
      [
        { label: 'From data',              dash: '' },
        { label: 'From figures/analytics', dash: '6,4' },
        { label: 'From asymptotics',      dash: '2,3' }
      ].forEach(function (t) {
        var item = document.createElement('span');
        item.className = 'construction-legend-item';
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '10');
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '5');
        line.setAttribute('x2', '24');
        line.setAttribute('y2', '5');
        line.setAttribute('stroke', 'var(--text-muted)');
        line.setAttribute('stroke-width', '2');
        if (t.dash) line.setAttribute('stroke-dasharray', t.dash);
        svg.appendChild(line);
        item.appendChild(svg);
        item.appendChild(document.createTextNode(t.label));
        legendEl.appendChild(item);
      });

      // taxonomy group-color legend (second row)
      var groupDiv = document.createElement('div');
      groupDiv.id = 'radar-group-legend';
      groupDiv.className = 'construction-legend';
      groupDiv.style.marginTop = '6px';
      Object.keys(GROUP_COLORS).forEach(function (g) {
        if (g === 'X') return; // excluded from radar per convention
        var span = document.createElement('span');
        span.className = 'construction-legend-item';
        var dot = document.createElement('span');
        dot.className = 'construction-dot';
        dot.style.background = GROUP_COLORS[g];
        span.appendChild(dot);
        span.appendChild(document.createTextNode(GROUP_NAMES[g]));
        groupDiv.appendChild(span);
      });
      legendEl.parentNode.insertBefore(groupDiv, legendEl.nextSibling);
    }

    var radarMetrics = ALL_METRICS.filter(function (m) {
      return data.some(function (s) { return isPos(getVal(s, m)); });
    });
    var theta = radarMetrics.map(function (m) { return METRIC_LABELS[m]; });
    theta.push(theta[0]);

    var activeTab = _lastRadarTab || null;

    function showAll() {
      activeTab = 'all';
      _lastRadarTab = 'all';
      Array.from(tabsEl.children).forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.tier === 'all');
      });
      gridEl.style.display = 'none';
      gridEl.innerHTML = '';
      if (allPanel) allPanel.style.display = '';
      if (legendEl) legendEl.style.display = 'none';
      var groupLeg = document.getElementById('radar-group-legend');
      if (groupLeg) groupLeg.style.display = 'none';
      if (modeTabsEl) modeTabsEl.style.display = 'none';
      var re = document.getElementById('radar-explainer-relative');
      var ae = document.getElementById('radar-explainer-absolute');
      if (re) re.style.display = 'none';
      if (ae) ae.style.display = 'none';
    }

    function drawTier(tier) {
      activeTab = tier;
      _lastRadarTab = tier;
      Array.from(tabsEl.children).forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.tier === tier);
      });
      if (allPanel) allPanel.style.display = 'none';
      if (legendEl) legendEl.style.display = 'flex';
      var groupLeg = document.getElementById('radar-group-legend');
      if (groupLeg) groupLeg.style.display = 'flex';
      if (modeTabsEl) modeTabsEl.style.display = 'flex';
      var re = document.getElementById('radar-explainer-relative');
      var ae = document.getElementById('radar-explainer-absolute');
      if (re) re.style.display = _radarMode === 'relative' ? '' : 'none';
      if (ae) ae.style.display = _radarMode === 'absolute' ? '' : 'none';
      gridEl.style.display = '';
      gridEl.innerHTML = '';
      var useAbs = _radarMode === 'absolute';

      var schemes = filterByDbSize(data, tier)
        .filter(function (s) { return s.group !== 'X'; }) // Group X excluded from radar
        .filter(function (s) { // skip schemes with zero reported metrics
          return radarMetrics.some(function (m) { return isPos(getVal(s, m)); });
        })
        .sort(function (a, b) {
          if (a.group !== b.group) return a.group.localeCompare(b.group);
          return a._composite - b._composite;
        });

      if (!schemes.length) {
        gridEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">No schemes in this DB-size tier.</p>';
        return;
      }

      var t = themeColors();

      schemes.forEach(function (s) {
        var cell = document.createElement('div');
        cell.className = 'radar-cell';
        gridEl.appendChild(cell);

        var color = GROUP_COLORS[s.group];
        var titleEl = document.createElement('div');
        titleEl.style.textAlign = 'center';
        titleEl.style.padding = '12px 0 0';
        var url = schemeUrl(s);
        var nameHtml = url && url !== '#'
          ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color:' + t.text + ';text-decoration:none;font-weight:bold;font-size:15.4px">' + s.display_name + '</a>'
          : '<span style="font-weight:bold;font-size:15.4px;color:' + t.text + '">' + s.display_name + '</span>';
        var sizeLabel = dbSizeLabel(s);
        var sizeUrl = s.notes_path ? BASE_URL + s.notes_path : null;
        var sizeTip = s._num_entries
          ? s._num_entries.toLocaleString() + ' \u00d7 ' + (s._entry_size_label || s._entry_size_bytes + 'B')
          : '';
        var sizeHtml = '';
        if (sizeLabel && sizeUrl) {
          sizeHtml = '<br><a href="' + sizeUrl + '" target="_blank" rel="noopener noreferrer" title="' + sizeTip.replace(/"/g, '&quot;') + '" style="font-size:11px;color:' + t.muted + ';text-decoration:none">' + sizeLabel + ' db</a>';
        } else if (sizeLabel) {
          sizeHtml = '<br><span style="font-size:11px;color:' + t.muted + '">' + sizeLabel + ' db</span>';
        }
        titleEl.innerHTML = nameHtml + sizeHtml;
        cell.appendChild(titleEl);

        var plotDiv = document.createElement('div');
        cell.appendChild(plotDiv);

        var vals = useAbs ? s._absNorm : s._ranks;
        var r = radarMetrics.map(function (m) {
          return isNum(vals[m]) ? vals[m] : 1;
        });
        r.push(r[0]);

        var tierDash = { 1: 'solid', 2: 'dash', 3: 'dot' };
        var tierFill = { 1: color + '22', 2: color + '0d', 3: 'rgba(0,0,0,0)' };
        var trace = {
          type: 'scatterpolar', mode: 'lines+markers',
          r: r, theta: theta,
          name: s.display_name,
          marker: { size: 5, color: color },
          line: { color: color, width: 2, dash: tierDash[s.data_tier] || 'solid' },
          fill: 'toself',
          fillcolor: tierFill[s.data_tier] || color + '22',
          hovertext: (function () {
            var ht = radarMetrics.map(function (m) {
              var raw = getVal(s, m);
              var rankLine = useAbs
                ? 'Log-norm: ' + (isNum(s._absNorm[m]) ? (s._absNorm[m] * 100).toFixed(0) + '%' : 'N/A')
                : 'Rank: ' + (isNum(s._ranks[m]) ? (s._ranks[m] * 100).toFixed(0) + '%' : 'N/A');
              var valStr = isPos(raw) ? formatNum(raw) + ' ' + METRIC_UNITS[m] : 'N/A';
              var dbEntry = 'DB / Entry: ' + (dbSizeLabel(s) || 'N/A') + ' / ' + (s._entry_size_label || 'N/A');
              return METRIC_NAMES[m] + ': ' + valStr +
                '<br>' + rankLine +
                '<br>' + dbEntry +
                '<br>Source: ' + (s.source_ref || 'N/A');
            });
            ht.push(ht[0]); // closing point matches first metric
            return ht;
          })(),
          hoverinfo: 'text'
        };

        // Missing-data markers: red "?" at outer edge where data is null
        var missingR = [], missingTheta = [], missingText = [];
        radarMetrics.forEach(function (m, i) {
          if (!isNum(vals[m])) {
            missingR.push(1);
            missingTheta.push(theta[i]);
            missingText.push(METRIC_LABELS[m] + ': no data');
          }
        });
        var traces = [trace];
        if (missingR.length) {
          traces.push({
            type: 'scatterpolar', mode: 'markers+text',
            r: missingR, theta: missingTheta,
            text: missingR.map(function () { return '?'; }),
            textposition: 'top center',
            textfont: { size: 10, color: '#e74c3c', family: 'Ubuntu, sans-serif' },
            marker: { size: 7, color: 'rgba(0,0,0,0)', line: { color: '#e74c3c', width: 1.5 } },
            hovertext: missingText,
            hoverinfo: 'text',
            showlegend: false
          });
        }

        var layout = {
          polar: {
            domain: { x: [0.125, 0.875], y: [0.1, 0.85] },
            radialaxis: {
              visible: true, range: [0, 1],
              tickvals: [0, 0.5, 1],
              ticktext: useAbs ? ['Best', '', 'Worst'] : ['Best', 'Mid', 'Worst'],
              gridcolor: t.grid, linecolor: t.grid,
              tickfont: { color: t.muted, size: 9 }
            },
            angularaxis: {
              tickfont: { size: 9, color: t.text },
              gridcolor: t.grid, linecolor: t.grid
            },
            bgcolor: 'rgba(0,0,0,0)'
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: t.text, family: t.font.family, size: 11 },
          showlegend: false,
          hoverdistance: -1,
          margin: { t: 8, r: 8, b: 8, l: 8 },
          height: 280,
          annotations: s.implementation_url ? [] : [{
            text: '(no impl)',
            showarrow: false,
            xref: 'paper', yref: 'paper',
            x: 0.5, y: -0.02,
            font: { size: 10, color: t.muted }
          }]
        };

        Plotly.newPlot(plotDiv, traces, layout, plotConfig());
      });
    }

    // build tabs (clear first for theme re-render)
    tabsEl.innerHTML = '';

    // "Raw" tab (heatmap)
    var allBtn = document.createElement('button');
    allBtn.className = 'radar-tab';
    allBtn.dataset.tier = 'all';
    allBtn.textContent = 'Raw';
    allBtn.style.fontWeight = 'bold';
    allBtn.style.marginRight = '16px';
    allBtn.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.25) 0%, rgba(234,179,8,0.18) 50%, rgba(239,68,68,0.25) 100%)';
    allBtn.style.borderColor = 'rgba(34,197,94,0.4)';
    allBtn.addEventListener('click', function () { showAll(); });
    tabsEl.appendChild(allBtn);

    // Per DB-size tier tabs
    DB_SIZE_TIERS.forEach(function (tier) {
      var btn = document.createElement('button');
      btn.className = 'radar-tab';
      btn.dataset.tier = tier;
      btn.textContent = DB_SIZE_LABELS[tier];
      btn.addEventListener('click', function () { drawTier(tier); });
      tabsEl.appendChild(btn);
    });

    // Wire up mode tabs (Relative / Absolute)
    var relExplainer = document.getElementById('radar-explainer-relative');
    var absExplainer = document.getElementById('radar-explainer-absolute');
    function updateExplainer() {
      if (relExplainer) relExplainer.style.display = _radarMode === 'relative' ? '' : 'none';
      if (absExplainer) absExplainer.style.display = _radarMode === 'absolute' ? '' : 'none';
    }
    if (modeTabsEl) {
      Array.from(modeTabsEl.querySelectorAll('.radar-mode-tab')).forEach(function (btn) {
        btn.addEventListener('click', function () {
          _radarMode = btn.dataset.mode;
          Array.from(modeTabsEl.querySelectorAll('.radar-mode-tab')).forEach(function (b) {
            b.classList.toggle('active', b.dataset.mode === _radarMode);
          });
          updateExplainer();
          // re-draw current tier
          if (activeTab && activeTab !== 'all') drawTier(activeTab);
        });
      });
    }

    // restore last tab or default to 'tiny' (≤1GB)
    if (_lastRadarTab === 'all') { showAll(); }
    else { drawTier(_lastRadarTab || 'tiny'); }
  }

  // ── 7. Timeline — Throughput Evolution by Year ───────
  //
  // Scatter plot: X = publication year, Y = throughput (GB/s, log scale).
  // Filtered to year >= 2020 (earlier schemes lack throughput data).
  //
  // Uses its own variant consolidation (not consolidateVariants()) because
  // it needs to pick the best-throughput variant as representative and list
  // all variants' throughputs in the hover text. Multi-variant schemes get
  // a common-prefix name (e.g. "SimplePIR" from "SimplePIR-Row" + "SimplePIR-Col").
  //
  // Marker size encodes communication cost (inverse log — smaller comm = bigger dot).
  // Text overlap avoidance uses the position-cycling algorithm (similar to
  // avoidTextOverlap but with different proximity thresholds for year/logY).
  //
  function renderTimeline(data) {
    var el = document.getElementById('chart-timeline');
    if (!el) return;
    var t = themeColors();

    var withTput = data.filter(function (s) { return isPos(getVal(s, 'throughput_gbps')) && s.year >= 2020; });

    // Consolidate variants per scheme: keep best throughput, list others in hover
    var schemeMap = {};
    var schemeOrder = [];
    withTput.forEach(function (s) {
      var key = s.id; // all variants of a scheme share the same id
      if (!schemeMap[key]) {
        schemeMap[key] = { best: s, variants: [] };
        schemeOrder.push(key);
      }
      schemeMap[key].variants.push(s);
      if (getVal(s, 'throughput_gbps') > getVal(schemeMap[key].best, 'throughput_gbps')) {
        schemeMap[key].best = s;
      }
    });

    var items = schemeOrder.map(function (key) {
      var entry = schemeMap[key];
      var best = entry.best;
      var varNames = entry.variants.map(function (v) { return v.display_name; });
      // For multi-variant schemes, find the common scheme name
      var schemeName = best.display_name;
      if (entry.variants.length > 1) {
        schemeName = varNames.reduce(function (a, b) {
          var i = 0;
          while (i < a.length && i < b.length && a[i] === b[i]) i++;
          return a.substring(0, i);
        }).replace(/[\s\-\(]+$/, '').replace(/-[a-z]$/i, '') || best.display_name;
      }
      return {
        year: best.year, group: best.group, id: key,
        display_name: schemeName,
        data_tier: best.data_tier,
        source_ref: best.source_ref,
        _throughput: getVal(best, 'throughput_gbps'),
        _query_kb: getVal(best, 'query_size_kb'),
        _response_kb: getVal(best, 'response_size_kb'),
        _variantLines: entry.variants.map(function (v) {
          return v.display_name + ': ' + formatNum(getVal(v, 'throughput_gbps')) + ' GB/s';
        }),
        _entryLabel: entrySizeLabel(best)
      };
    });

    var traces = [];

    // Group legend patches
    Object.keys(GROUP_COLORS).forEach(function (g) {
      if (!items.some(function (s) { return s.group === g; })) return;
      traces.push({
        x: [null], y: [null], mode: 'lines', type: 'scatter',
        name: GROUP_NAMES[g],
        line: { color: GROUP_COLORS[g], width: 10 },
        hoverinfo: 'skip'
      });
    });

    // Pre-compute text positions to avoid overlaps
    var allPts = items.map(function (s) {
      return { year: s.year, logY: Math.log10(isPos(s._throughput) ? s._throughput : 0.01), id: s.id };
    });
    var posMap = {};
    var positions = ['top center', 'bottom center', 'top right', 'bottom right', 'top left', 'bottom left'];
    allPts.sort(function (a, b) { return a.year - b.year || a.logY - b.logY; });
    allPts.forEach(function (pt, i) {
      var nearby = 0;
      for (var j = 0; j < i; j++) {
        if (Math.abs(allPts[j].year - pt.year) <= 0.5 && Math.abs(allPts[j].logY - pt.logY) < 0.3) {
          nearby++;
        }
      }
      posMap[pt.id] = positions[nearby % positions.length];
    });

    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s.year; }),
        y: gItems.map(function (s) { return s._throughput; }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        showlegend: false,
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: gItems.map(function (s) { return posMap[s.id] || 'top center'; }),
        cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          color: GROUP_COLORS[g],
          size: gItems.map(function (s) {
            var comm = (isPos(s._query_kb) ? s._query_kb : 100) + (isPos(s._response_kb) ? s._response_kb : 100);
            return Math.max(10, Math.min(40, 50 / Math.log10(comm + 1)));
          }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          var lines = s.display_name + ' (' + s.year + ')';
          if (s._entryLabel) lines += '<br>Entry size: ' + s._entryLabel;
          if (s._variantLines.length > 1) {
            lines += '<br><br>' + s._variantLines.join('<br>');
          } else {
            lines += '<br>Throughput: ' + formatNum(s._throughput) + ' GB/s';
          }
          lines += '<br>Source: ' + (s.source_ref || 'N/A');
          return lines;
        }),
        hoverinfo: 'text'
      });
    });

    Plotly.newPlot(el, traces, baseLayout('Throughput Timeline — Evolution by Year', {
      xaxis: { title: 'Year', dtick: 1, gridcolor: t.grid },
      yaxis: {
        title: 'Throughput (GB/s) — Higher is Better',
        type: 'log', gridcolor: t.grid,
        tickvals: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20],
        ticktext: ['0.1', '0.2', '0.5', '1', '2', '5', '10', '20']
      },
      margin: { t: 48, r: 48, b: 100, l: 60 },
      legend: { orientation: 'h', y: -0.12 },
      height: isMobile() ? 430 : 540
    }), plotConfig());
  }

  // ── 8. Scheme Catalog Table ───────────────────────────
  //
  // Sortable, filterable HTML table listing all 29 schemes.
  //
  // Columns: Scheme (linked to notes), Group, DB Sizes (colored pills),
  // Year, Open-Source Impl?, Tier, and 5 metric columns (query, response,
  // server time, throughput, client time).
  //
  // "Open-Source Impl?" column values and their semantics:
  //   - "Yes" (linked)   — an independently-verifiable open-source implementation
  //                         exists. Link goes to the repository (implementation_url).
  //   - "No"             — the authors claim to have implemented and benchmarked the
  //                         scheme (concrete numbers exist in reported.json), but the
  //                         source code is not publicly available for independent verification.
  //   - "Theory-only"    — no implementation exists at all (neither open-source nor
  //                         author-internal). The scheme is a purely theoretical
  //                         construction with no concrete benchmark data. These schemes
  //                         have theory_only=true in reported.json and empty metrics.
  //
  // Filter pills: Tier (1/2/3), Include Theory-only (on by default), Group (A–X),
  // DB size (tiny–1-bit). "Clear" deselects all; "Select all" resets.
  //
  // Default sort: by year descending (newest first). Clicking column headers
  // toggles ascending/descending sort on that column.
  //
  function renderCatalog(data) {
    var el = document.getElementById('catalog-body');
    var headerRow = document.getElementById('catalog-header');
    if (!el || !headerRow) return;

    var sorted = data.slice().sort(function (a, b) { return b.year - a.year; });
    var sortCol = 'year';
    var sortAsc = false;

    function renderRows(items) {
      el.innerHTML = '';
      items.forEach(function (s) {
        var tr = document.createElement('tr');
        var link = schemeUrl(s);
        var dbPills = (s.db_size_categories || []).map(function (c) {
          return '<span class="db-size-pill" style="border-color:' + DB_SIZE_COLORS[c] + ';color:' + DB_SIZE_COLORS[c] + '">' + DB_SIZE_LABELS[c] + '</span>';
        }).join(' ') || '<span style="color:var(--text-muted)">\u2014</span>';
        tr.innerHTML =
          '<td><a href="' + link + '" target="_blank" rel="noopener noreferrer">' + s.display_name + '</a></td>' +
          '<td style="text-align:center"><span class="group-dot" style="background:' + GROUP_COLORS[s.group] + '"></span> ' + s.group + '</td>' +
          '<td>' + dbPills + '</td>' +
          '<td style="text-align:center">' + s.year + '</td>' +
          '<td style="text-align:center">' + (s.implementation_url ? '<a href="' + s.implementation_url + '" target="_blank" rel="noopener noreferrer">Yes</a>' : '<span style="color:var(--text-muted)">' + (s.theory_only ? 'Theory-only' : 'No') + '</span>') + '</td>' +
          '<td class="num" style="text-align:center">' + formatNum(getVal(s, 'query_size_kb')) + '</td>' +
          '<td class="num" style="text-align:center">' + formatNum(getVal(s, 'response_size_kb')) + '</td>' +
          '<td class="num" style="text-align:center">' + formatNum(getVal(s, 'server_time_ms')) + '</td>' +
          '<td class="num" style="text-align:center">' + formatNum(getVal(s, 'throughput_gbps')) + '</td>' +
          '<td class="num" style="text-align:center">' + formatNum(getVal(s, 'client_time_ms')) + '</td>' +
          '<td style="text-align:center">' + TIER_LABELS[s.data_tier] + '</td>';
        el.appendChild(tr);
      });
    }

    // sortable headers
    var columns = [
      { key: 'display_name', label: 'Scheme' },
      { key: 'group', label: 'Group' },
      { key: 'db_size', label: 'DB Size' },
      { key: 'year', label: 'Year' },
      { key: 'theory_only', label: 'Open-Source<br>Impl?' },
      { key: 'query_size_kb', label: 'Query KB', metric: true },
      { key: 'response_size_kb', label: 'Response KB', metric: true },
      { key: 'server_time_ms', label: 'Server ms', metric: true },
      { key: 'throughput_gbps', label: 'Throughput GB/s', metric: true },
      { key: 'client_time_ms', label: 'Client ms', metric: true },
      { key: 'data_tier', label: 'Tier' }
    ];

    headerRow.innerHTML = '';
    columns.forEach(function (col, ci) {
      var th = document.createElement('th');
      th.innerHTML = col.label;
      th.style.cursor = 'pointer';
      if (ci !== 0 && ci !== 2) th.style.textAlign = 'center';
      th.addEventListener('click', function () {
        if (sortCol === col.key) {
          sortAsc = !sortAsc;
        } else {
          sortCol = col.key;
          sortAsc = true;
        }
        sorted.sort(function (a, b) {
          var va, vb;
          if (col.metric) {
            va = getVal(a, col.key);
            vb = getVal(b, col.key);
          } else if (col.key === 'db_size') {
            va = (a.db_size_categories || []).length;
            vb = (b.db_size_categories || []).length;
          } else {
            va = a[col.key];
            vb = b[col.key];
          }
          if (va == null || (typeof va === 'number' && !isFinite(va))) return 1;
          if (vb == null || (typeof vb === 'number' && !isFinite(vb))) return -1;
          if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
          return sortAsc ? va - vb : vb - va;
        });
        renderRows(sorted);
      });
      headerRow.appendChild(th);
    });

    // filter pills
    var filterEl = document.getElementById('catalog-filters');
    if (filterEl) {
      filterEl.innerHTML = '';
      var activeGroups = new Set(Object.keys(GROUP_COLORS));
      var activeTiers = new Set([1, 2, 3]);
      var activeDbSizes = new Set(DB_SIZE_TIERS);
      var includeTheoryOnly = true; // true = show theory-only schemes

      function applyFilters() {
        var filtered = data.filter(function (s) {
          var groupOk = activeGroups.has(s.group);
          var tierOk = activeTiers.has(s.data_tier);
          var implOk = includeTheoryOnly || !s.theory_only;
          var dbOk = activeDbSizes.size === DB_SIZE_TIERS.length || // all selected = no filter
            (s.db_size_categories && s.db_size_categories.some(function (c) { return activeDbSizes.has(c); }));
          return groupOk && tierOk && implOk && dbOk;
        });
        if (sortCol) {
          var col = columns.filter(function (c) { return c.key === sortCol; })[0];
          filtered.sort(function (a, b) {
            var va, vb;
            if (col && col.metric) { va = getVal(a, sortCol); vb = getVal(b, sortCol); }
            else if (sortCol === 'db_size') { va = (a.db_size_categories || []).length; vb = (b.db_size_categories || []).length; }
            else { va = a[sortCol]; vb = b[sortCol]; }
            if (va == null || (typeof va === 'number' && !isFinite(va))) return 1;
            if (vb == null || (typeof vb === 'number' && !isFinite(vb))) return -1;
            if (typeof va === 'string') return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
            return sortAsc ? va - vb : vb - va;
          });
        } else {
          filtered.sort(function (a, b) { return a._composite - b._composite; });
        }
        sorted = filtered;
        renderRows(sorted);
      }

      // tier row
      var tierRow = document.createElement('div');
      tierRow.className = 'filter-row-line';
      [1, 2, 3].forEach(function (tier) {
        var pill = document.createElement('button');
        pill.className = 'filter-pill active';
        pill.textContent = TIER_LABELS[tier];
        pill.addEventListener('click', function () {
          if (activeTiers.has(tier)) { activeTiers.delete(tier); pill.classList.remove('active'); }
          else { activeTiers.add(tier); pill.classList.add('active'); }
          applyFilters();
        });
        tierRow.appendChild(pill);
      });
      // impl pill on tier row
      var implPill = document.createElement('button');
      implPill.className = 'filter-pill active';
      implPill.textContent = 'Include Theory-only';
      implPill.addEventListener('click', function () {
        includeTheoryOnly = !includeTheoryOnly;
        implPill.classList.toggle('active', includeTheoryOnly);
        applyFilters();
      });
      tierRow.appendChild(implPill);
      filterEl.appendChild(tierRow);

      // group row
      var groupRow = document.createElement('div');
      groupRow.className = 'filter-row-line';
      Object.keys(GROUP_COLORS).forEach(function (g) {
        var pill = document.createElement('button');
        pill.className = 'filter-pill active';
        pill.style.borderColor = GROUP_COLORS[g];
        pill.textContent = GROUP_NAMES[g];
        pill.addEventListener('click', function () {
          if (activeGroups.has(g)) { activeGroups.delete(g); pill.classList.remove('active'); }
          else { activeGroups.add(g); pill.classList.add('active'); }
          applyFilters();
        });
        groupRow.appendChild(pill);
      });
      filterEl.appendChild(groupRow);

      // DB size row
      var dbRow = document.createElement('div');
      dbRow.className = 'filter-row-line';
      DB_SIZE_TIERS.forEach(function (tier) {
        var pill = document.createElement('button');
        pill.className = 'filter-pill active';
        pill.style.borderColor = DB_SIZE_COLORS[tier];
        pill.textContent = DB_SIZE_LABELS[tier];
        pill.addEventListener('click', function () {
          if (activeDbSizes.has(tier)) { activeDbSizes.delete(tier); pill.classList.remove('active'); }
          else { activeDbSizes.add(tier); pill.classList.add('active'); }
          applyFilters();
        });
        dbRow.appendChild(pill);
      });
      filterEl.appendChild(dbRow);

      // select all / clear links
      var actionsRow = document.createElement('div');
      actionsRow.className = 'filter-row-line';

      var selectAllLink = document.createElement('a');
      selectAllLink.href = '#';
      selectAllLink.textContent = 'Select all';
      selectAllLink.className = 'filter-clear';
      selectAllLink.addEventListener('click', function (e) {
        e.preventDefault();
        activeGroups = new Set(Object.keys(GROUP_COLORS));
        activeTiers = new Set([1, 2, 3]);
        activeDbSizes = new Set(DB_SIZE_TIERS);
        includeTheoryOnly = true;
        Array.from(filterEl.querySelectorAll('.filter-pill')).forEach(function (p) {
          p.classList.add('active');
        });
        applyFilters();
      });
      actionsRow.appendChild(selectAllLink);

      var clearLink = document.createElement('a');
      clearLink.href = '#';
      clearLink.textContent = 'Clear';
      clearLink.className = 'filter-clear';
      clearLink.addEventListener('click', function (e) {
        e.preventDefault();
        activeGroups = new Set();
        activeTiers = new Set();
        activeDbSizes = new Set();
        includeTheoryOnly = false;
        Array.from(filterEl.querySelectorAll('.filter-pill')).forEach(function (p) {
          p.classList.remove('active');
        });
        applyFilters();
      });
      actionsRow.appendChild(clearLink);

      filterEl.appendChild(actionsRow);
    }

    renderRows(sorted);
  }

  // ── DB Size Tab System ───────────────────────────────
  //
  // The tab bar (tiny / small / medium / large / 1-bit) appears at the top of
  // each section and controls which DB-size tier's data is shown.
  // Each tab container has its own independent state (DB tier, entry bucket,
  // primary dimension, secondary filters). Tab clicks only re-render
  // charts owned by that section.
  // The active tab state is synced across all tab bar instances on the page.
  //
  // ── Misc: Communication Rate Bars ───────────────────────
  // Horizontal bars ranked by rate (higher is better).
  function renderRateBars(data) {
    var el = document.getElementById('chart-rate');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['rate']);

    var items = data.filter(function (s) { return isPos(getVal(s, 'rate')); });
    items.sort(function (a, b) { return getVal(b, 'rate') - getVal(a, 'rate'); });

    var traces = [{
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + consolidatedName(s); }),
      x: items.map(function (s) { return getVal(s, 'rate'); }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return getVal(s, 'rate').toFixed(3); }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') +
          '<br>Rate: ' + getVal(s, 'rate').toFixed(4) +
          '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];
    var layout = baseLayout('Communication Rate (plaintext / ciphertext)', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Rate (higher = better, 1.0 = optimal)', standoff: 20 }, range: [0, 1.05], gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(350, items.length * 30 + 120)
    });
    addLegendAnnotations(layout, items, t);
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── Misc: Amortized Offline Communication Bars ─────────
  // Horizontal bars ranked by amortized_offline_comm_kb (lower is better).
  function renderAmortizedOfflineComm(data) {
    var el = document.getElementById('chart-amortized-offline-comm');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['amortized_offline_comm_kb']);

    var items = data.filter(function (s) { return isPos(getVal(s, 'amortized_offline_comm_kb')); });
    items.sort(function (a, b) { return getVal(a, 'amortized_offline_comm_kb') - getVal(b, 'amortized_offline_comm_kb'); });

    var traces = [{
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + consolidatedName(s); }),
      x: items.map(function (s) { return getVal(s, 'amortized_offline_comm_kb'); }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'amortized_offline_comm_kb')) + ' KB'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') +
          '<br>Amortized Offline Comm: ' + formatNum(getVal(s, 'amortized_offline_comm_kb')) + ' KB/query' +
          '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];
    var layout = baseLayout('Amortized Offline Communication (KB/query)', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Amortized Offline Comm (KB/query)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(350, items.length * 30 + 120)
    });
    addLegendAnnotations(layout, items, t);
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── Misc: Amortized Offline Time Bars ──────────────────
  // Horizontal bars ranked by amortized_offline_time_ms (lower is better).
  function renderAmortizedOfflineTime(data) {
    var el = document.getElementById('chart-amortized-offline-time');
    if (!el) return;
    var t = themeColors();
    data = consolidateVariants(data, ['amortized_offline_time_ms']);

    var items = data.filter(function (s) { return isPos(getVal(s, 'amortized_offline_time_ms')); });
    items.sort(function (a, b) { return getVal(a, 'amortized_offline_time_ms') - getVal(b, 'amortized_offline_time_ms'); });

    var traces = [{
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + consolidatedName(s); }),
      x: items.map(function (s) { return getVal(s, 'amortized_offline_time_ms'); }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
        line: { color: items.map(function (s) { return GROUP_COLORS[s.group]; }), width: 1.5 }
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'amortized_offline_time_ms')) + ' ms'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return consolidatedName(s) + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') +
          '<br>Amortized Offline Time: ' + formatNum(getVal(s, 'amortized_offline_time_ms')) + ' ms/query' +
          '<br>Source: ' + (s.source_ref || 'N/A') + consolidatedHoverSuffix(s);
      }),
      hoverinfo: 'text'
    }];
    var layout = baseLayout('Amortized Offline Time (ms/query)', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Amortized Offline Time (ms/query)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(350, items.length * 30 + 120)
    });
    addLegendAnnotations(layout, items, t);
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── Per-section chart state ──────────────────────────
  //
  // Each .dim-tabs-container has its own independent filter state.
  // Clicking a tab in one section only re-renders charts in that section.
  //
  // Chart ID → render function mapping (populated once in init).
  var _chartRenderers = {};
  // Map from chart ID → the _SectionState that owns it.
  var _chartToSection = {};

  function _buildChartRenderers(data) {
    var cache = {};
    function make(id, fn) { cache[id] = fn; }
    make('chart-communication', function () { renderCommunicationScatter(filterData(_cachedData, _chartToSection['chart-communication'])); });
    make('chart-throughput', function () {
      var st = _chartToSection['chart-throughput'];
      var d = filterData(_cachedData, st);
      var items = _prepareThroughputItems(d);
      var stItems = _prepareServerTimeItems(d);
      var maxBars = Math.max(items.length, stItems.length);
      var h = Math.max(350, maxBars * 28 + 120);
      renderThroughputBars(items, h);
    });
    make('chart-server-time', function () {
      var st = _chartToSection['chart-server-time'];
      var d = filterData(_cachedData, st);
      var tputItems = _prepareThroughputItems(d);
      var stItems = _prepareServerTimeItems(d);
      var maxBars = Math.max(tputItems.length, stItems.length);
      var h = Math.max(350, maxBars * 28 + 120);
      renderServerTimeBars(stItems, h);
    });
    make('chart-client-cost', function () { renderClientCost(filterData(_cachedData, _chartToSection['chart-client-cost'])); });
    make('chart-offline-storage', function () { renderOfflineStorage(filterData(_cachedData, _chartToSection['chart-offline-storage'])); });
    make('chart-preprocessing-time', function () { renderPreprocessingTime(filterData(_cachedData, _chartToSection['chart-preprocessing-time'])); });
    make('chart-pareto', function () { renderPareto(filterData(_cachedData, _chartToSection['chart-pareto'])); });
    make('chart-pareto-comm-storage', function () { renderParetoCommStorage(filterData(_cachedData, _chartToSection['chart-pareto-comm-storage'])); });
    make('chart-pareto-comm-client', function () { renderParetoCommClient(filterData(_cachedData, _chartToSection['chart-pareto-comm-client'])); });
    make('chart-pareto-server-client', function () { renderParetoServerClient(filterData(_cachedData, _chartToSection['chart-pareto-server-client'])); });
    make('chart-rate', function () { renderRateBars(filterData(_cachedData, _chartToSection['chart-rate'])); });
    make('chart-amortized-offline-comm', function () { renderAmortizedOfflineComm(filterData(_cachedData, _chartToSection['chart-amortized-offline-comm'])); });
    make('chart-amortized-offline-time', function () { renderAmortizedOfflineTime(filterData(_cachedData, _chartToSection['chart-amortized-offline-time'])); });
    _chartRenderers = cache;
  }

  // Render only the charts owned by a given section state
  function _renderSectionCharts(sectionState) {
    sectionState.chartIds.forEach(function (id) {
      var fn = _chartRenderers[id];
      if (fn) fn();
    });
  }

  // Render all filterable charts (used on initial load)
  function renderFilteredCharts() {
    Object.keys(_chartRenderers).forEach(function (id) {
      var fn = _chartRenderers[id];
      if (document.getElementById(id)) fn();
    });
  }

  // ── Per-section tab management ──────────────────────

  // Discover chart IDs owned by a .dim-tabs-container.
  // Walks forward through subsequent siblings collecting .chart-container elements
  // (or .chart-container elements inside .chart-pair wrappers) until hitting
  // another .dim-tabs-container, a heading, or end of parent.
  function _discoverChartIds(tabContainer) {
    var ids = [];
    var sib = tabContainer.nextElementSibling;
    while (sib) {
      if (sib.classList.contains('dim-tabs-container')) break;
      if (/^H[1-6]$/.test(sib.tagName)) break;
      if (sib.classList.contains('chart-container') && sib.id) {
        ids.push(sib.id);
      }
      // .chart-pair wraps multiple chart containers (e.g. throughput + server-time)
      if (sib.classList.contains('chart-pair')) {
        sib.querySelectorAll('.chart-container').forEach(function (el) {
          if (el.id) ids.push(el.id);
        });
      }
      sib = sib.nextElementSibling;
    }
    return ids;
  }

  // Sync a single tab container's DOM to its section state
  function _syncSectionTabUI(container, state) {
    var dbRow = container.querySelector('.db-tab-row');
    var entryRow = container.querySelector('.entry-tab-row');
    var dbPills = container.querySelector('.db-pills');
    var entryPills = container.querySelector('.entry-pills');
    if (!dbRow || !entryRow) return;

    if (state.primaryDim === 'db') {
      dbRow.classList.add('primary');
      dbRow.classList.remove('secondary');
      entryRow.classList.add('secondary');
      entryRow.classList.remove('primary');
    } else {
      entryRow.classList.add('primary');
      entryRow.classList.remove('secondary');
      dbRow.classList.add('secondary');
      dbRow.classList.remove('primary');
    }

    // Sync active tab highlights
    dbRow.querySelectorAll('.dim-tab').forEach(function (b) {
      b.classList.toggle('active', state.primaryDim === 'db' && b.dataset.value === state.activeDbTier);
    });
    entryRow.querySelectorAll('.dim-tab').forEach(function (b) {
      b.classList.toggle('active', state.primaryDim === 'entry' && b.dataset.value === state.activeEntryBucket);
    });

    // Rebuild secondary filter pills
    function buildPills(el, items, labels) {
      el.innerHTML = '';
      items.forEach(function (id) {
        var pill = document.createElement('button');
        pill.className = 'secondary-pill' + (state.secondaryFilters.has(id) ? ' active' : '');
        pill.dataset.value = id;
        pill.textContent = labels[id];
        pill.addEventListener('click', function () {
          if (state.secondaryFilters.has(id)) {
            state.secondaryFilters.delete(id);
          } else {
            state.secondaryFilters.add(id);
          }
          _syncSectionTabUI(container, state);
          _renderSectionCharts(state);
        });
        el.appendChild(pill);
      });
    }

    if (dbPills) {
      if (state.primaryDim === 'db') {
        buildPills(dbPills, ENTRY_BUCKETS, ENTRY_BUCKET_LABELS);
      } else {
        dbPills.innerHTML = '';
      }
    }
    if (entryPills) {
      if (state.primaryDim === 'entry') {
        buildPills(entryPills, DB_SIZE_TIERS, DB_SIZE_LABELS);
      } else {
        entryPills.innerHTML = '';
      }
    }
  }

  function initDimensionTabs() {
    document.querySelectorAll('.dim-tabs-container').forEach(function (container) {
      // Each container gets its own independent state
      var state = {
        primaryDim: 'db',
        activeDbTier: 'tiny',
        activeEntryBucket: null,
        secondaryFilters: new Set(),
        chartIds: _discoverChartIds(container)
      };

      // Register chart→state mapping
      state.chartIds.forEach(function (id) {
        _chartToSection[id] = state;
      });

      // DB tab row
      var dbRow = container.querySelector('.db-tab-row');
      if (dbRow) {
        dbRow.querySelectorAll('.dim-tab').forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (state.primaryDim !== 'db') {
              state.primaryDim = 'db';
              state.secondaryFilters = new Set();
            }
            state.activeDbTier = btn.dataset.value;
            _syncSectionTabUI(container, state);
            _renderSectionCharts(state);
          });
        });
      }

      // Entry tab row — generate dynamically
      var entryRow = document.createElement('div');
      entryRow.className = 'entry-tab-row secondary';
      var entryBtns = document.createElement('div');
      entryBtns.className = 'tab-row-buttons';
      ENTRY_BUCKETS.forEach(function (bucket) {
        var btn = document.createElement('button');
        btn.className = 'dim-tab entry-tab';
        btn.dataset.value = bucket;
        btn.textContent = ENTRY_BUCKET_LABELS[bucket];
        btn.addEventListener('click', function () {
          if (state.primaryDim !== 'entry') {
            state.primaryDim = 'entry';
            state.secondaryFilters = new Set();
          }
          state.activeEntryBucket = bucket;
          _syncSectionTabUI(container, state);
          _renderSectionCharts(state);
        });
        entryBtns.appendChild(btn);
      });
      entryRow.appendChild(entryBtns);

      // Secondary pills containers
      var dbPills = document.createElement('div');
      dbPills.className = 'secondary-pills db-pills';
      dbRow.appendChild(dbPills);
      var entryPills = document.createElement('div');
      entryPills.className = 'secondary-pills entry-pills';
      entryRow.appendChild(entryPills);

      // Insert entry row after db row
      if (dbRow) {
        dbRow.parentNode.insertBefore(entryRow, dbRow.nextSibling);
      } else {
        container.appendChild(entryRow);
      }

      // Initial UI sync
      _syncSectionTabUI(container, state);
    });
  }

  // ── v2 Data Transformation ────────────────────────────
  //
  // Flattens the nested v2 JSON schema into a flat array of "entities" for plotting.
  //
  // v2 schema structure (reported.json):
  //   { schemes: [
  //       { id, display_name, group, year, theory_only, implementation_url,
  //         configs: [ { config_id, num_entries, entry_size_bytes, ... } ],
  //         variants: ["SimplePIR", "DoublePIR"],
  //         benchmarks: [ { variant, config_id, data_tier, metrics: {...}, ... } ]
  //       }
  //   ]}
  //
  // For each scheme-variant combination, transformV2:
  //   1. Looks up the config for each benchmark to compute db_size_bytes.
  //   2. Classifies each benchmark into a DB-size tier (tiny/small/medium/large/1-bit).
  //   3. Within each tier, picks the benchmark with the largest DB as representative.
  //   4. Across tiers, picks the primary benchmark: largest DB, with ties broken
  //      by preferring lower data_tier (more reliable data).
  //   5. Emits one entity per variant, carrying:
  //      - Primary benchmark's metrics as `concrete`
  //      - All tier benchmarks in `_tierBenchmarks` (for the tab system)
  //      - List of DB-size categories the scheme covers
  //
  // Variants with no benchmarks are silently skipped.
  // Schemes with a single variant get display_name = scheme name.
  // Multi-variant schemes get display_name = "SchemeName (VariantName)" unless
  // the variant name already starts with the scheme name.
  //
  function classifyDbTier(dbBytes) {
    if (dbBytes <= 1e9) return 'tiny';
    if (dbBytes <= 8e9) return 'small';
    if (dbBytes <= 32e9) return 'medium';
    return 'large';
  }

  function classifyEntryBucket(entrySizeBytes) {
    if (entrySizeBytes <= 0.125) return '1-bit';
    if (entrySizeBytes < 256) return 'lt256';
    if (entrySizeBytes <= 1024) return '256-1k';
    if (entrySizeBytes <= 32768) return '1k-32k';
    return 'gt32k';
  }

  function variantDisplayName(schemeName, variant, isMultiVariant) {
    if (!isMultiVariant) return schemeName;
    if (variant === schemeName) return schemeName;
    if (variant.toLowerCase().indexOf(schemeName.toLowerCase()) === 0) return variant;
    var combined = schemeName + ' (' + variant + ')';
    if (combined.length > 28) return schemeName + '<br>(' + variant + ')';
    return combined;
  }

  function transformV2(raw) {
    var schemes = (raw && raw.schemes) ? raw.schemes : (Array.isArray(raw) ? raw : []);
    var entities = [];

    schemes.forEach(function (scheme) {
      // Build config lookup and compute db_size_bytes per config
      var configMap = {};
      (scheme.configs || []).forEach(function (c) {
        c._db_size_bytes = c.num_entries * c.entry_size_bytes;
        configMap[c.config_id] = c;
      });

      var variants = scheme.variants && scheme.variants.length ? scheme.variants : ['default'];
      var isMultiVariant = variants.length > 1;

      // Group benchmarks by variant
      var benchByVariant = {};
      (scheme.benchmarks || []).forEach(function (b) {
        var v = b.variant || 'default';
        if (!benchByVariant[v]) benchByVariant[v] = [];
        benchByVariant[v].push(b);
      });

      variants.forEach(function (variant) {
        var benches = benchByVariant[variant] || [];
        if (!benches.length) return;

        // Store all benchmarks for cross-filtering; classify by DB tier and entry bucket
        var allBenchmarks = [];
        var tierBenchmarks = {};
        var entryBenchmarks = {};
        var dbCategories = {};
        var entryCategories = {};

        benches.forEach(function (b) {
          var config = configMap[b.config_id];
          if (!config) return;
          var dbBytes = config._db_size_bytes;
          var dbTier = classifyDbTier(dbBytes);
          var entryBucket = classifyEntryBucket(config.entry_size_bytes);

          var rec = {
            metrics: b.metrics,
            data_tier: b.data_tier,
            source_ref: b.source_ref,
            estimation_meta: b.estimation_meta,
            _db_size_bytes: dbBytes,
            _config: config,
            _dbTier: dbTier,
            _entryBucket: entryBucket
          };
          allBenchmarks.push(rec);

          dbCategories[dbTier] = true;
          entryCategories[entryBucket] = true;

          if (!tierBenchmarks[dbTier] || dbBytes > tierBenchmarks[dbTier]._db_size_bytes) {
            tierBenchmarks[dbTier] = rec;
          }
          if (!entryBenchmarks[entryBucket] || dbBytes > entryBenchmarks[entryBucket]._db_size_bytes) {
            entryBenchmarks[entryBucket] = rec;
          }
        });

        // Pick primary benchmark: largest db_size, prefer lower data_tier
        var primary = null;
        var primaryDbSize = -1;
        allBenchmarks.forEach(function (rec) {
          if (rec._db_size_bytes > primaryDbSize ||
              (rec._db_size_bytes === primaryDbSize && rec.data_tier < (primary ? primary.data_tier : 4))) {
            primary = rec;
            primaryDbSize = rec._db_size_bytes;
          }
        });

        if (!primary) return;

        entities.push({
          id: scheme.id,
          display_name: variantDisplayName(scheme.display_name, variant, isMultiVariant),
          group: scheme.group,
          year: scheme.year,
          theory_only: scheme.theory_only || false,
          implementation_url: scheme.implementation_url || null,
          notes_path: scheme.notes_path || null,
          concrete: primary.metrics,
          data_tier: primary.data_tier,
          source_ref: primary.source_ref,
          estimation_meta: primary.estimation_meta,
          _db_size_bytes: primary._db_size_bytes,
          _entry_size_bytes: primary._config.entry_size_bytes,
          _entry_size_label: primary._config.entry_size_label || null,
          _num_entries: primary._config.num_entries,
          db_size_categories: Object.keys(dbCategories),
          entry_size_categories: Object.keys(entryCategories),
          _tierBenchmarks: tierBenchmarks,
          _entryBenchmarks: entryBenchmarks,
          _allBenchmarks: allBenchmarks
        });
      });
    });

    return entities;
  }

  // ── Data Loading & Init ───────────────────────────────
  //
  // Startup sequence:
  //   1. init() fetches reported.json (path resolved relative to script location)
  //   2. transformV2() flattens to entities
  //   3. computeCompositeScores() adds ranking/normalization metadata
  //   4. initDimensionTabs() wires up DB-size and entry-size tab handlers
  //   5. renderCharts() renders all visualizations
  //   6. renderCatalog() builds the sortable table
  //   7. After 700ms, page loading overlay is removed and anchor scroll fires
  //
  // _cachedData holds the full scored entity array. It's reused on:
  //   - Theme change (dark↔light)
  //   - Window resize (debounced 200ms)
  //   - DB-size tab switches
  //
  var _cachedData = null;
  var _cachedRawSchemes = null;

  // ── Extensions: KeywordPIR Charts ───────────────────
  //
  // These render functions work with the raw scheme data (not transformed
  // entities) because they need all per-config benchmarks, not just the
  // representative per DB-size tier.

  var KW_VARIANT_COLORS = {
    OptimizedSealPIR: '#1f77b4',
    MulPIR: '#ff7f0e',
    GentryRamzan: '#2ca02c',
    ClientAidedGR: '#d62728'
  };
  var KW_VARIANT_LABELS = {
    OptimizedSealPIR: 'SealPIR (Additive HE)',
    MulPIR: 'MulPIR (Somewhat HE)',
    GentryRamzan: 'Gentry-Ramzan (Number-theoretic)',
    ClientAidedGR: 'Client-Aided GR (Number-theoretic)'
  };

  function getKwScheme(rawSchemes) {
    return rawSchemes.find(function (s) { return s.id === 'keywordpir_2019'; });
  }

  function kwConfigMap(scheme) {
    var map = {};
    (scheme.configs || []).forEach(function (c) { map[c.config_id] = c; });
    return map;
  }

  // Chart 1: Communication vs Server Time scatter (log-log)
  function renderKwCommServer() {
    var el = document.getElementById('chart-kw-comm-server');
    if (!el || !_cachedRawSchemes) return;
    var scheme = getKwScheme(_cachedRawSchemes);
    if (!scheme) return;
    var configs = kwConfigMap(scheme);
    var t = themeColors();

    var traces = [];
    var variants = scheme.variants || [];
    variants.forEach(function (variant) {
      var benches = (scheme.benchmarks || []).filter(function (b) {
        return b.variant === variant && isPos(b.metrics.server_time_ms) &&
               (isPos(b.metrics.query_size_kb) || isPos(b.metrics.response_size_kb));
      });
      if (!benches.length) return;
      var x = [], y = [], text = [];
      benches.forEach(function (b) {
        var totalComm = (b.metrics.query_size_kb || 0) + (b.metrics.response_size_kb || 0);
        x.push(totalComm);
        y.push(b.metrics.server_time_ms);
        var c = configs[b.config_id];
        text.push(
          (KW_VARIANT_LABELS[variant] || variant) +
          '<br>Config: ' + (c ? c.num_entries_label + ' × ' + c.entry_size_label : b.config_id) +
          '<br>Query: ' + formatNum(b.metrics.query_size_kb || 0) + ' KB' +
          '<br>Response: ' + formatNum(b.metrics.response_size_kb || 0) + ' KB' +
          '<br>Total Comm: ' + formatNum(totalComm) + ' KB' +
          '<br>Server: ' + formatNum(b.metrics.server_time_ms) + ' ms' +
          '<br>Source: ' + b.source_ref
        );
      });
      traces.push({
        x: x, y: y, mode: 'markers', type: 'scatter', name: KW_VARIANT_LABELS[variant] || variant,
        marker: { color: KW_VARIANT_COLORS[variant] || '#999', size: 12, line: { width: 1, color: t.text } },
        hovertext: text, hoverinfo: 'text'
      });
    });

    var layout = baseLayout('Communication vs Server Time — KeywordPIR Paradigm Trade-off', {
      xaxis: { title: { text: 'Total Communication (KB)', standoff: 12 }, type: 'log', gridcolor: t.grid },
      yaxis: { title: { text: 'Server Time (ms)', standoff: 12 }, type: 'log', gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.22, x: 0.5, xanchor: 'center', font: { size: 11 } },
      margin: { l: 70, r: 24, t: 48, b: 100 },
      height: 500
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // Chart 2: Server time grouped bars by config
  function renderKwServerTime() {
    var el = document.getElementById('chart-kw-server-time');
    if (!el || !_cachedRawSchemes) return;
    var scheme = getKwScheme(_cachedRawSchemes);
    if (!scheme) return;
    var configs = kwConfigMap(scheme);
    var t = themeColors();

    // Group benchmarks by config_id; only include configs that have ≥2 variants for comparison
    var configOrder = (scheme.configs || []).map(function (c) { return c.config_id; });
    var benchByConfig = {};
    (scheme.benchmarks || []).forEach(function (b) {
      if (!isPos(b.metrics.server_time_ms)) return;
      if (!benchByConfig[b.config_id]) benchByConfig[b.config_id] = {};
      benchByConfig[b.config_id][b.variant] = b;
    });

    // Filter to configs with data
    var activeConfigs = configOrder.filter(function (cid) { return benchByConfig[cid]; });

    var xLabels = activeConfigs.map(function (cid) {
      var c = configs[cid];
      return c ? c.num_entries_label + ' × ' + c.entry_size_label : cid;
    });

    var traces = [];
    (scheme.variants || []).forEach(function (variant) {
      var values = [], hoverTexts = [];
      activeConfigs.forEach(function (cid) {
        var b = benchByConfig[cid] && benchByConfig[cid][variant];
        values.push(b ? b.metrics.server_time_ms : null);
        if (b) {
          hoverTexts.push(
            (KW_VARIANT_LABELS[variant] || variant) +
            '<br>Server: ' + formatNum(b.metrics.server_time_ms) + ' ms' +
            '<br>Source: ' + b.source_ref
          );
        } else {
          hoverTexts.push('');
        }
      });
      traces.push({
        x: xLabels, y: values, type: 'bar',
        name: KW_VARIANT_LABELS[variant] || variant,
        marker: { color: KW_VARIANT_COLORS[variant] || '#999' },
        hovertext: hoverTexts, hoverinfo: 'text'
      });
    });

    var layout = baseLayout('Server Time by Configuration', {
      barmode: 'group',
      xaxis: { title: { text: 'Database Configuration', standoff: 12 }, gridcolor: t.grid, tickangle: -30 },
      yaxis: { title: { text: 'Server Time (ms)', standoff: 12 }, type: 'log', gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.35, x: 0.5, xanchor: 'center', font: { size: 10 } },
      margin: { l: 70, r: 24, t: 48, b: 120 },
      height: 500
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // Chart 3: Communication breakdown — query + response per variant/config
  function renderKwCommBreakdown() {
    var el = document.getElementById('chart-kw-comm-breakdown');
    if (!el || !_cachedRawSchemes) return;
    var scheme = getKwScheme(_cachedRawSchemes);
    if (!scheme) return;
    var configs = kwConfigMap(scheme);
    var t = themeColors();

    // Build data: one group per (variant, config) combination that has both query + response
    var items = [];
    (scheme.benchmarks || []).forEach(function (b) {
      if (!isPos(b.metrics.query_size_kb) && !isPos(b.metrics.response_size_kb)) return;
      var c = configs[b.config_id];
      items.push({
        label: (KW_VARIANT_LABELS[b.variant] || b.variant).split(' (')[0] +
               '<br>' + (c ? c.num_entries_label + '×' + c.entry_size_label : b.config_id),
        query: b.metrics.query_size_kb || 0,
        response: b.metrics.response_size_kb || 0,
        variant: b.variant,
        source_ref: b.source_ref,
        config: c
      });
    });

    // Sort: group by variant, then by DB size within variant
    var variantOrder = { OptimizedSealPIR: 0, MulPIR: 1, GentryRamzan: 2, ClientAidedGR: 3 };
    items.sort(function (a, b) {
      var va = variantOrder[a.variant] !== undefined ? variantOrder[a.variant] : 9;
      var vb = variantOrder[b.variant] !== undefined ? variantOrder[b.variant] : 9;
      if (va !== vb) return va - vb;
      return (a.config ? a.config.num_entries : 0) - (b.config ? b.config.num_entries : 0);
    });

    var traces = [
      {
        y: items.map(function (i) { return i.label; }),
        x: items.map(function (i) { return i.query; }),
        type: 'bar', orientation: 'h', name: 'Query (upload)',
        marker: { color: 'rgba(31,119,180,0.7)', line: { width: 1, color: 'rgba(31,119,180,1)' } },
        hovertext: items.map(function (i) {
          return i.label.replace('<br>', ' ') + '<br>Query: ' + formatNum(i.query) + ' KB<br>Source: ' + i.source_ref;
        }),
        hoverinfo: 'text'
      },
      {
        y: items.map(function (i) { return i.label; }),
        x: items.map(function (i) { return i.response; }),
        type: 'bar', orientation: 'h', name: 'Response (download)',
        marker: { color: 'rgba(255,127,14,0.7)', line: { width: 1, color: 'rgba(255,127,14,1)' } },
        hovertext: items.map(function (i) {
          return i.label.replace('<br>', ' ') + '<br>Response: ' + formatNum(i.response) + ' KB<br>Source: ' + i.source_ref;
        }),
        hoverinfo: 'text'
      }
    ];

    var layout = baseLayout('Communication Breakdown — Query vs Response', {
      barmode: 'stack',
      xaxis: { title: { text: 'Communication (KB)', standoff: 12 }, type: 'log', gridcolor: t.grid },
      yaxis: { autorange: 'reversed', tickfont: { size: 10 }, gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
      margin: { l: 160, r: 24, t: 48, b: 80 },
      height: Math.max(400, items.length * 35 + 140)
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // Chart 4: Client time bars
  function renderKwClientTime() {
    var el = document.getElementById('chart-kw-client-time');
    if (!el || !_cachedRawSchemes) return;
    var scheme = getKwScheme(_cachedRawSchemes);
    if (!scheme) return;
    var configs = kwConfigMap(scheme);
    var t = themeColors();

    var items = [];
    (scheme.benchmarks || []).forEach(function (b) {
      if (!isPos(b.metrics.client_time_ms)) return;
      var c = configs[b.config_id];
      items.push({
        label: (KW_VARIANT_LABELS[b.variant] || b.variant).split(' (')[0] +
               '<br>' + (c ? c.num_entries_label + '×' + c.entry_size_label : b.config_id),
        value: b.metrics.client_time_ms,
        variant: b.variant,
        source_ref: b.source_ref,
        config: c
      });
    });

    var variantOrder = { OptimizedSealPIR: 0, MulPIR: 1, GentryRamzan: 2, ClientAidedGR: 3 };
    items.sort(function (a, b) {
      var va = variantOrder[a.variant] !== undefined ? variantOrder[a.variant] : 9;
      var vb = variantOrder[b.variant] !== undefined ? variantOrder[b.variant] : 9;
      if (va !== vb) return va - vb;
      return (a.config ? a.config.num_entries : 0) - (b.config ? b.config.num_entries : 0);
    });

    var traces = [{
      y: items.map(function (i) { return i.label; }),
      x: items.map(function (i) { return i.value; }),
      type: 'bar', orientation: 'h', showlegend: false,
      marker: {
        color: items.map(function (i) { return KW_VARIANT_COLORS[i.variant] || '#999'; }),
        line: { width: 1, color: items.map(function (i) { return KW_VARIANT_COLORS[i.variant] || '#999'; }) }
      },
      text: items.map(function (i) { return formatNum(i.value) + ' ms'; }),
      textposition: 'outside', cliponaxis: false,
      hovertext: items.map(function (i) {
        return i.label.replace('<br>', ' ') + '<br>Client: ' + formatNum(i.value) + ' ms<br>Source: ' + i.source_ref;
      }),
      hoverinfo: 'text'
    }];

    var layout = baseLayout('Client Computation Time', {
      xaxis: { title: { text: 'Client Time (ms)', standoff: 12 }, type: 'log', gridcolor: t.grid },
      yaxis: { autorange: 'reversed', tickfont: { size: 10 }, gridcolor: t.grid },
      margin: { l: 160, r: 70, t: 48, b: 48 },
      height: Math.max(350, items.length * 35 + 120)
    });
    // Variant color legend
    var seen = {};
    items.forEach(function (i) { seen[i.variant] = true; });
    var variantKeys = Object.keys(seen);
    if (variantKeys.length > 1) {
      var parts = variantKeys.map(function (v) {
        return '<span style="color:' + (KW_VARIANT_COLORS[v] || '#999') + '">\u25A0</span> ' + (KW_VARIANT_LABELS[v] || v).split(' (')[0];
      });
      layout.annotations = (layout.annotations || []).concat({
        text: parts.join(' &nbsp; '),
        xref: 'paper', yref: 'paper', x: 0.5, xanchor: 'center', y: 0, yanchor: 'top', yshift: -60,
        showarrow: false, font: { size: 11, color: t.muted }
      });
      layout.margin.b = 80;
    }
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // ── Extensions: DistributionalPIR Charts ────────────
  //
  // Sparse data: only 2 of 4 benchmarks have concrete metrics.

  var DIST_VARIANT_COLORS = {
    'DistPIR-SimplePIR': '#9467bd',
    'DistPIR-Respire': '#8c564b',
    'DistPIR-SCT': '#e377c2'
  };

  function getDistScheme(rawSchemes) {
    return rawSchemes.find(function (s) { return s.id === 'distributionalpir_2025'; });
  }

  // Chart 1: Available metrics (multi-metric horizontal bars)
  function renderDistMetrics() {
    var el = document.getElementById('chart-dist-metrics');
    if (!el || !_cachedRawSchemes) return;
    var scheme = getDistScheme(_cachedRawSchemes);
    if (!scheme) return;
    var configMap = {};
    (scheme.configs || []).forEach(function (c) { configMap[c.config_id] = c; });
    var t = themeColors();

    // Collect benchmarks with any concrete metric
    var items = [];
    (scheme.benchmarks || []).forEach(function (b) {
      var m = b.metrics || {};
      var hasData = isPos(m.server_time_ms) || isPos(m.response_size_kb) || isPos(m.client_storage_mb);
      if (!hasData) return;
      var c = configMap[b.config_id];
      items.push({
        label: b.variant + '<br>(' + (c ? c.num_entries_label + ' × ' + c.entry_size_label : b.config_id) + ')',
        server_time_ms: m.server_time_ms || null,
        response_size_kb: m.response_size_kb || null,
        client_storage_mb: m.client_storage_mb || null,
        variant: b.variant,
        config: c,
        source_ref: b.source_ref,
        footnotes: b.footnotes || [],
        data_tier: b.data_tier
      });
    });

    if (!items.length) {
      el.innerHTML = '<p class="chart-note">No concrete metrics available — only relative improvements reported in figures.</p>';
      return;
    }

    // Create one subplot per metric
    var metrics = [
      { key: 'server_time_ms', label: 'Server Time (ms)', color: '#e74c3c' },
      { key: 'response_size_kb', label: 'Response Size (KB)', color: '#3498db' },
      { key: 'client_storage_mb', label: 'Client Storage (MB)', color: '#2ecc71' }
    ];

    var traces = [];
    metrics.forEach(function (metric) {
      var hasAny = items.some(function (i) { return isPos(i[metric.key]); });
      if (!hasAny) return;
      traces.push({
        y: items.map(function (i) { return i.label; }),
        x: items.map(function (i) { return i[metric.key]; }),
        type: 'bar', orientation: 'h', name: metric.label,
        marker: { color: metric.color, opacity: 0.8 },
        text: items.map(function (i) {
          return isPos(i[metric.key]) ? formatNum(i[metric.key]) + ' ' + metric.label.split(' (')[1].replace(')', '') : '';
        }),
        textposition: 'outside', cliponaxis: false,
        hovertext: items.map(function (i) {
          if (!isPos(i[metric.key])) return '';
          return i.variant + ' (' + (i.config ? i.config.num_entries_label : '') + ')' +
            '<br>' + metric.label + ': ' + formatNum(i[metric.key]) +
            '<br>Tier: ' + TIER_LABELS[i.data_tier] +
            '<br>Source: ' + i.source_ref +
            (i.footnotes.length ? '<br><br>' + i.footnotes[0].substring(0, 120) + '...' : '');
        }),
        hoverinfo: 'text'
      });
    });

    var layout = baseLayout('DistributionalPIR — Reported Metrics', {
      barmode: 'group',
      xaxis: { type: 'log', gridcolor: t.grid },
      yaxis: { autorange: 'reversed', tickfont: { size: 10 }, gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
      margin: { l: 160, r: 80, t: 48, b: 80 },
      height: Math.max(350, items.length * 50 + 140)
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  // Chart 2: Comparison with underlying schemes
  function renderDistComparison() {
    var el = document.getElementById('chart-dist-comparison');
    if (!el || !_cachedRawSchemes) return;
    var distScheme = getDistScheme(_cachedRawSchemes);
    if (!distScheme) return;
    var t = themeColors();

    // Find underlying schemes for comparison

    // Build comparison data: for each metric, show dist variant vs underlying scheme
    // Focus on server_time_ms and response_size_kb which are the key value-adds
    var rows = [];

    // DistPIR-SCT vs YPIR (same DB class: ~5B 1-bit entries)
    var ypir = _cachedRawSchemes.find(function (s) { return s.id === 'ypir_2024'; });
    var distSCT = (distScheme.benchmarks || []).find(function (b) { return b.variant === 'DistPIR-SCT'; });

    if (ypir && distSCT) {
      // Find YPIR benchmark closest to SCT config (1-bit entries, large N)
      var ypirBench = null;
      (ypir.benchmarks || []).forEach(function (b) {
        var c = (ypir.configs || []).find(function (cc) { return cc.config_id === b.config_id; });
        if (c && c.entry_size_bytes <= 32) {
          if (!ypirBench || c.num_entries > ypirBench._num) {
            ypirBench = { metrics: b.metrics, source_ref: b.source_ref, _num: c.num_entries, config: c };
          }
        }
      });
      if (ypirBench) {
        rows.push({ label: 'YPIR (baseline)', server: ypirBench.metrics.server_time_ms, response: ypirBench.metrics.response_size_kb, color: '#3498db', source: ypirBench.source_ref });
        rows.push({ label: 'DistPIR-SCT', server: distSCT.metrics.server_time_ms, response: distSCT.metrics.response_size_kb, color: DIST_VARIANT_COLORS['DistPIR-SCT'], source: distSCT.source_ref });
      }
    }

    // DistPIR-SimplePIR (CrowdSurf) vs SimplePIR
    var simplePIR = _cachedRawSchemes.find(function (s) { return s.id === 'simplepir_2022'; });
    var distSP = (distScheme.benchmarks || []).find(function (b) { return b.variant === 'DistPIR-SimplePIR' && b.config_id === '38GB-CrowdSurf'; });

    if (simplePIR && distSP) {
      var spBench = null;
      (simplePIR.benchmarks || []).forEach(function (b) {
        if (b.variant === 'SimplePIR' || !b.variant || b.variant === 'default') {
          var c = (simplePIR.configs || []).find(function (cc) { return cc.config_id === b.config_id; });
          if (c) {
            var dbSize = c.num_entries * c.entry_size_bytes;
            if (!spBench || dbSize > spBench._dbSize) {
              spBench = { metrics: b.metrics, source_ref: b.source_ref, _dbSize: dbSize, config: c };
            }
          }
        }
      });
      if (spBench) {
        rows.push({ label: 'SimplePIR (baseline)', server: spBench.metrics.server_time_ms, response: spBench.metrics.response_size_kb, color: '#ff7f0e', source: spBench.source_ref });
        rows.push({ label: 'DistPIR-SimplePIR<br>(CrowdSurf, 38 GB)', server: distSP.metrics.server_time_ms, response: distSP.metrics.response_size_kb, color: DIST_VARIANT_COLORS['DistPIR-SimplePIR'], source: distSP.source_ref });
      }
    }

    if (!rows.length) {
      el.innerHTML = '<p class="chart-note">No comparable baseline data available.</p>';
      return;
    }

    var traces = [];
    // Server time bars
    var serverRows = rows.filter(function (r) { return isPos(r.server); });
    if (serverRows.length) {
      traces.push({
        y: serverRows.map(function (r) { return r.label; }),
        x: serverRows.map(function (r) { return r.server; }),
        type: 'bar', orientation: 'h', name: 'Server Time (ms)',
        marker: { color: serverRows.map(function (r) { return r.color; }), opacity: 0.85 },
        text: serverRows.map(function (r) { return formatNum(r.server) + ' ms'; }),
        textposition: 'outside', cliponaxis: false,
        hovertext: serverRows.map(function (r) {
          return r.label.replace('<br>', ' ') + '<br>Server: ' + formatNum(r.server) + ' ms<br>Source: ' + r.source;
        }),
        hoverinfo: 'text'
      });
    }

    // Response size bars
    var respRows = rows.filter(function (r) { return isPos(r.response); });
    if (respRows.length) {
      traces.push({
        y: respRows.map(function (r) { return r.label; }),
        x: respRows.map(function (r) { return r.response; }),
        type: 'bar', orientation: 'h', name: 'Response (KB)',
        marker: { color: respRows.map(function (r) { return r.color; }), opacity: 0.6 },
        text: respRows.map(function (r) { return formatNum(r.response) + ' KB'; }),
        textposition: 'outside', cliponaxis: false,
        hovertext: respRows.map(function (r) {
          return r.label.replace('<br>', ' ') + '<br>Response: ' + formatNum(r.response) + ' KB<br>Source: ' + r.source;
        }),
        hoverinfo: 'text'
      });
    }

    var layout = baseLayout('DistributionalPIR vs Underlying Schemes', {
      barmode: 'group',
      xaxis: { type: 'log', gridcolor: t.grid, title: { text: 'Value (log scale — ms or KB)', standoff: 12 } },
      yaxis: { autorange: 'reversed', tickfont: { size: 10 }, gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.2, x: 0.5, xanchor: 'center' },
      margin: { l: 160, r: 80, t: 48, b: 80 },
      height: Math.max(350, rows.length * 50 + 140)
    });
    Plotly.newPlot(el, traces, layout, plotConfig());
  }

  function renderExtensions() {
    renderKwCommServer();
    renderKwServerTime();
    renderKwCommBreakdown();
    renderKwClientTime();
    renderDistMetrics();
    renderDistComparison();
  }

  function renderCharts(data) {
    renderHeatmap(data);
    _buildChartRenderers(data);
    renderFilteredCharts();

    renderRadar(data);
    renderTimeline(data);
  }

  function init() {
    // Resolve data path: charts.js lives in reported/, data in data/
    var scriptEl = document.querySelector('script[src$="charts.js"]');
    var prefix = scriptEl ? scriptEl.getAttribute('src').replace('charts.js', '') : '';
    fetch(prefix + 'data/reported.json')
      .then(function (r) { return r.json(); })
      .then(function (raw) {
        // clear loading indicators
        var loaders = document.querySelectorAll('.chart-loading');
        loaders.forEach(function (el) { el.remove(); });

        // Cache raw scheme data for extension charts (need per-benchmark granularity)
        _cachedRawSchemes = (raw && raw.schemes) ? raw.schemes : (Array.isArray(raw) ? raw : []);

        // Transform v2 schema into flat plotable entities
        var entities = transformV2(raw);

        _cachedData = computeCompositeScores(entities);
        initDimensionTabs();
        renderCharts(_cachedData);
        renderExtensions();
        renderCatalog(_cachedData);

        // Reveal page after charts render, then jump to anchor instantly
        setTimeout(function () {
          var main = document.querySelector('.content.loading');
          if (main) main.classList.remove('loading');
          if (window.location.hash) {
            var target = document.getElementById(window.location.hash.slice(1));
            if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
          // Enable smooth scroll for subsequent nav clicks
          setTimeout(function () { document.documentElement.classList.add('smooth'); }, 100);
        }, 700);
      })
      .catch(function (err) {
        console.error('Failed to load PIR data:', err);
        var el = document.getElementById('chart-heatmap');
        if (el) el.innerHTML = '<p style="color:red;padding:20px">Failed to load data. Ensure reported/data/reported.json exists.</p>';
      });
  }

  // Re-render charts on theme change (dark ↔ light). Catalog filters and
  // sort state are preserved because renderCatalog isn't called again.
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (_cachedData) {
        renderCharts(_cachedData);
        renderExtensions();
      }
    });
  }

  // Debounced re-render on window resize. Without debouncing, Plotly's responsive
  // mode can trigger a height-feedback loop (resize → re-render → height change → resize).
  var _resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      if (_cachedData) { renderCharts(_cachedData); renderExtensions(); }
    }, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

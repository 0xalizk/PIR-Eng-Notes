/* ── PIR Engineering Notes — charts.js ────────────────── */
/* All Plotly chart rendering + data loading + composite scoring */
/* Data source: ../data/reported.json (v2 schema) */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  var GROUP_COLORS = { A: '#1f77b4', B: '#2ca02c', C: '#ff7f0e', D: '#d62728', X: '#7f7f7f' };
  var GROUP_NAMES = {
    A: 'FHE-Based', B: 'Stateless', C: 'Client-Indep. Preprocessing',
    D: 'Client-Dep. Preprocessing', X: 'Extensions'
  };
  var GROUP_SYMBOLS_3D = { A: 'circle', B: 'square', C: 'diamond', D: 'cross', X: 'x' };

  var DB_SIZE_TIERS = ['tiny', 'small', 'medium', 'large', '1-bit'];
  var DB_SIZE_LABELS = {
    tiny: '\u22641GB db', small: '1\u20138GB db', medium: '8\u201332GB db',
    large: '>32GB db', '1-bit': '1-bit entry'
  };
  var DB_SIZE_COLORS = {
    tiny: '#9b59b6', small: '#3498db', medium: '#e67e22',
    large: '#e74c3c', '1-bit': '#17becf'
  };
  var TIER_OPACITY = { 1: 1.0, 2: 0.8, 3: 0.55 };
  var TIER_LABELS = { 1: 'Exact', 2: 'Approx', 3: 'Asymp.' };
  var TIER_BADGE = { 1: '', 2: '\u2020', 3: '*' };

  // core metrics for composite scoring
  var CORE_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps'];
  // all display metrics
  var ALL_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps',
    'client_time_ms', 'offline_comm_mb', 'client_storage_mb'];
  var METRIC_LABELS = {
    query_size_kb: 'Query (KB)', response_size_kb: 'Response (KB)',
    server_time_ms: 'Server (ms)', throughput_gbps: 'Throughput (GB/s)',
    client_time_ms: 'Client (ms)', offline_comm_mb: 'Offline (MB)',
    client_storage_mb: 'Storage (MB)'
  };
  var METRIC_NAMES = {
    query_size_kb: 'Query', response_size_kb: 'Response',
    server_time_ms: 'Server', throughput_gbps: 'Throughput',
    client_time_ms: 'Client', offline_comm_mb: 'Offline',
    client_storage_mb: 'Storage'
  };
  var METRIC_UNITS = {
    query_size_kb: 'KB', response_size_kb: 'KB',
    server_time_ms: 'ms', throughput_gbps: 'GB/s',
    client_time_ms: 'ms', offline_comm_mb: 'MB',
    client_storage_mb: 'MB'
  };
  // lower is better for all except throughput
  var HIGHER_IS_BETTER = { throughput_gbps: true };

  var BASE_URL = 'https://github.com/0xalizk/PIR-Eng-Notes/blob/main/research/';

  function schemeUrl(s) {
    var path = (typeof s === 'object') ? s.notes_path : null;
    return path ? BASE_URL + path : '#';
  }

  // ── Helpers ────────────────────────────────────────────
  function getVal(s, metric) {
    return s.concrete ? s.concrete[metric] : null;
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
    return s._db_size_bytes || null;
  }

  function dbSizeLabel(s) {
    var bytes = dbSizeBytes(s);
    if (bytes === null) return null;
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

  function filterByDbSize(data, tier) {
    return data.filter(function (s) {
      return s.db_size_categories && s.db_size_categories.indexOf(tier) >= 0;
    }).map(function (s) {
      var tb = s._tierBenchmarks && s._tierBenchmarks[tier];
      if (!tb) return s;
      // Swap in tier-specific metrics
      var copy = {};
      Object.keys(s).forEach(function (k) { copy[k] = s[k]; });
      copy.concrete = tb.metrics;
      copy.data_tier = tb.data_tier;
      copy.source_ref = tb.source_ref;
      copy.estimation_meta = tb.estimation_meta;
      copy._db_size_bytes = tb._db_size_bytes;
      copy._entry_size_bytes = tb._config.entry_size_bytes;
      copy._entry_size_label = tb._config.entry_size_label;
      copy._num_entries = tb._config.num_entries;
      return copy;
    });
  }

  function plotConfig() {
    return { responsive: true, displayModeBar: false };
  }

  function formatNum(v) {
    if (v === null || v === undefined) return '\u2014';
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
    if (v >= 1) return v.toFixed(v < 10 ? 2 : 1);
    return v.toPrecision(3);
  }

  // ── Composite Scoring ──────────────────────────────────
  function computeCompositeScores(data) {
    // Step 1: collect values per core metric for percentile ranking
    var metricVals = {};
    CORE_METRICS.forEach(function (m) { metricVals[m] = []; });

    data.forEach(function (s) {
      CORE_METRICS.forEach(function (m) {
        var v = getVal(s, m);
        if (v !== null && v !== undefined) metricVals[m].push(v);
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
        if (v !== null && v !== undefined) {
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
        if (v !== null && v !== undefined) allMetricVals[m].push(v);
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
        if (v !== null && v !== undefined) {
          var idx = allMetricVals[m].indexOf(v);
          s._ranks[m] = allMetricVals[m].length > 1 ? idx / (allMetricVals[m].length - 1) : 0.5;
        } else {
          s._ranks[m] = null;
        }
      });
    });

    // Absolute normalization: log-scale min-max per metric (0 = best, 1 = worst)
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
        if (v !== null && v !== undefined && v > 0) {
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
  // Y-axis = scheme names (sorted best→worst top→bottom)
  // X-axis = 7 metrics
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
        row.push(rank !== null ? rank : NaN);
        var raw = getVal(s, m);
        tRow.push(raw !== null ? formatNum(raw) + TIER_BADGE[s.data_tier] : '');
        var lbl = METRIC_LABELS[m];
        var lblMatch = lbl.match(/^(.+?) \((.+)\)$/);
        if (raw === null || raw === undefined) {
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
    var schemes = sorted.map(function (s) { return s.display_name; });
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
      showscale: true,
      colorbar: {
        title: { text: 'Rank', font: { size: 11 } },
        tickvals: [0, 0.5, 1],
        ticktext: ['Best', 'Mid', 'Worst'],
        len: 0.4
      },
      zmin: 0, zmax: 1,
      xgap: 2, ygap: 1
    };

    var layout = baseLayout('Data Reported in the Paper<br><span style="font-size:11px;font-weight:normal;color:' + t.muted + '"><i>Click inside a column to sort by it</i></span>', {
      xaxis: {
        tickfont: { size: isMobile() ? 9 : 11 }, side: 'top',
        gridcolor: t.grid
      },
      yaxis: {
        tickfont: { size: isMobile() ? 8 : 10 }, autorange: true,
        gridcolor: t.grid
      },
      margin: { t: 100, r: isMobile() ? 20 : 80, b: 24, l: isMobile() ? 72 : 160 },
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
        var aMissing = va === null || va === undefined;
        var bMissing = vb === null || vb === undefined;
        if (aMissing && bMissing) return 0;
        if (aMissing) return -1; // nulls at bottom (index 0 in Plotly = visual bottom)
        if (bMissing) return 1;
        // reversed sort: worst at index 0 (bottom), best at top
        return HIGHER_IS_BETTER[metric] ? va - vb : vb - va;
      });

      var newSchemes = reSorted.map(function (s) { return s.display_name; });
      var nhd = buildHeatmapData(reSorted);

      Plotly.react(el, [{
        z: nhd.z, x: nhd.metricLabels, y: newSchemes,
        type: 'heatmap',
        colorscale: [[0, '#22c55e'], [0.5, '#eab308'], [1, '#ef4444']],
        text: nhd.text, texttemplate: '%{text}', textfont: { size: isMobile() ? 8 : 10 },
        hovertext: nhd.hoverText, hoverinfo: 'text',
        showscale: true,
        colorbar: { title: { text: 'Rank', font: { size: 11 } }, tickvals: [0, 0.5, 1], ticktext: ['Best', 'Mid', 'Worst'], len: 0.4 },
        zmin: 0, zmax: 1, xgap: 2, ygap: 1
      }], Object.assign({}, layout, { shapes: nhd.shapes }), plotConfig());
    });
  }

  // ── 2. Communication Scatter ──────────────────────────
  function renderCommunicationScatter(data) {
    var el = document.getElementById('chart-communication');
    if (!el) return;
    var t = themeColors();

    var traces = [];
    var groups = {};
    data.forEach(function (s) {
      var qk = getVal(s, 'query_size_kb');
      var rk = getVal(s, 'response_size_kb');
      if (qk === null || rk === null) return;
      if (!groups[s.group]) groups[s.group] = { x: [], y: [], text: [], names: [], marker: { color: [], opacity: [], size: [], symbol: [] } };
      var g = groups[s.group];
      g.x.push(qk);
      g.y.push(rk);
      g.names.push(s.display_name);
      g.text.push(s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Query: ' + formatNum(qk) + ' KB<br>Response: ' + formatNum(rk) + ' KB<br>Source: ' + (s.source_ref || 'N/A'));
      g.marker.color.push(GROUP_COLORS[s.group]);
      g.marker.opacity.push(TIER_OPACITY[s.data_tier]);
      var st = getVal(s, 'server_time_ms');
      g.marker.size.push(st ? Math.max(8, Math.min(30, Math.log10(st + 1) * 8)) : 10);
      g.marker.symbol.push(s.data_tier === 3 ? 'diamond' : s.data_tier === 2 ? 'square' : 'circle');
    });

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
        textposition: 'top right',
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
    var tierNames = { 1: 'T1 (Exact)', 2: 'T2 (Approx)', 3: 'T3 (Asymptotic)' };
    [1, 2, 3].forEach(function (tier) {
      traces.push({
        x: [null], y: [null],
        mode: 'markers',
        type: 'scatter',
        name: tierNames[tier],
        legendgroup: 'tiers',
        legendgrouptitle: { text: 'Data Tiers', font: { size: 11, color: t.muted } },
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

    var layout = baseLayout('Communication Design Space (Query vs Response)', {
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

  // ── 3a. Throughput Bars ───────────────────────────────
  function renderThroughputBars(data) {
    var el = document.getElementById('chart-throughput');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'throughput_gbps') !== null; });
    items.sort(function (a, b) { return getVal(b, 'throughput_gbps') - getVal(a, 'throughput_gbps'); });

    var traces = [];
    traces.push({
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'throughput_gbps'); }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'throughput_gbps')) + ' GB/s'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Throughput: ' + formatNum(getVal(s, 'throughput_gbps')) + ' GB/s<br>Source: ' + (s.source_ref || 'N/A');
      }),
      hoverinfo: 'text'
    });

    Plotly.newPlot(el, traces, baseLayout('Server Throughput (GB/s) — Higher is Better', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Throughput (GB/s)', standoff: 20 }, gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 80 },
      height: Math.max(350, items.length * 30 + 120),
      annotations: [{
        text: '<i>All Tier 1; no throughput reported in Tiers 2&amp;3</i>',
        xref: 'paper', yref: 'paper', x: 0, y: 0, yanchor: 'top', yshift: -60,
        showarrow: false, font: { size: 11, color: t.muted }
      }]
    }), plotConfig());
  }

  // ── 3b. Server Time Bars ──────────────────────────────
  function renderServerTimeBars(data) {
    var el = document.getElementById('chart-server-time');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'server_time_ms') !== null; });
    items.sort(function (a, b) { return getVal(a, 'server_time_ms') - getVal(b, 'server_time_ms'); });

    var traces = [];
    traces.push({
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'server_time_ms'); }),
      type: 'bar', orientation: 'h',
      showlegend: false,
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'server_time_ms')) + ' ms'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server Time: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Source: ' + (s.source_ref || 'N/A');
      }),
      hoverinfo: 'text'
    });

    Plotly.newPlot(el, traces, baseLayout('Server Time (ms) — Lower is Better', {
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: { text: 'Server Time (ms)', standoff: 20 }, type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 80 },
      height: Math.max(350, items.length * 26 + 120),
      annotations: [{
        text: '\u2020 approx &nbsp;&nbsp; * asymptotic',
        xref: 'paper', yref: 'paper', x: 0, y: 0, yanchor: 'top', yshift: -60,
        showarrow: false, font: { size: 11, color: t.muted }
      }]
    }), plotConfig());
  }

  // ── 4. Client Compute Bars ───────────────────────────────
  function renderClientCost(data) {
    var el = document.getElementById('chart-client-cost');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'client_time_ms') !== null; });
    items.sort(function (a, b) { return getVal(a, 'client_time_ms') - getVal(b, 'client_time_ms'); });

    Plotly.newPlot(el, [{
      y: items.map(function (s) { return (TIER_BADGE[s.data_tier] ? TIER_BADGE[s.data_tier] + ' ' : '') + s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'client_time_ms'); }),
      type: 'bar', orientation: 'h',
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'client_time_ms')) + ' ms'; }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms<br>Source: ' + (s.source_ref || 'N/A');
      }),
      hoverinfo: 'text'
    }], baseLayout('Client Computation Time (ms)', {
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: 'Client Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(300, items.length * 30 + 100)
    }), plotConfig());
  }

  // ── 5. Offline & Storage Bar Chart ───────────────────
  function renderOfflineStorage(data) {
    var el = document.getElementById('chart-offline-storage');
    if (!el) return;
    var t = themeColors();

    var HINT_COLOR = '#3b82f6';
    var STORAGE_COLOR = '#f59e0b';

    var items = data.filter(function (s) {
      return getVal(s, 'offline_comm_mb') !== null || getVal(s, 'client_storage_mb') !== null;
    });

    // sort by max of the two values (largest at top)
    items.sort(function (a, b) {
      var aMax = Math.max(getVal(a, 'offline_comm_mb') || 0, getVal(a, 'client_storage_mb') || 0);
      var bMax = Math.max(getVal(b, 'offline_comm_mb') || 0, getVal(b, 'client_storage_mb') || 0);
      return aMax - bMax;
    });

    var schemes = items.map(function (s) { return s.display_name; });
    var traces = [];

    // Offline comm bars
    traces.push({
      y: schemes,
      x: items.map(function (s) { return getVal(s, 'offline_comm_mb'); }),
      type: 'bar', orientation: 'h',
      name: 'Offline',
      marker: { color: HINT_COLOR, opacity: 0.85 },
      text: items.map(function (s) {
        var v = getVal(s, 'offline_comm_mb');
        return v !== null ? formatNum(v) + ' MB' : '';
      }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'offline_comm_mb');
        return v !== null ? s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Offline: ' + formatNum(v) + ' MB<br>Source: ' + (s.source_ref || 'N/A') : '';
      }),
      hoverinfo: 'text'
    });

    // Client storage bars
    traces.push({
      y: schemes,
      x: items.map(function (s) { return getVal(s, 'client_storage_mb'); }),
      type: 'bar', orientation: 'h',
      name: 'Client Storage',
      marker: { color: STORAGE_COLOR, opacity: 0.85 },
      text: items.map(function (s) {
        var v = getVal(s, 'client_storage_mb');
        return v !== null ? formatNum(v) + ' MB' : '';
      }),
      textposition: 'outside',
      cliponaxis: false,
      hovertext: items.map(function (s) {
        var v = getVal(s, 'client_storage_mb');
        return v !== null ? s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Client Storage: ' + formatNum(v) + ' MB<br>Source: ' + (s.source_ref || 'N/A') : '';
      }),
      hoverinfo: 'text'
    });

    Plotly.newPlot(el, traces, baseLayout('Offline & Client Storage', {
      barmode: 'group',
      xaxis: { title: 'Size (MB)', gridcolor: t.grid },
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      legend: { orientation: 'h', x: 0, y: -0.12, font: { size: 11 } },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 100 },
      height: Math.max(400, items.length * 40 + 160)
    }), plotConfig());
  }

  // ── 6a. Pareto Frontier ───────────────────────────────
  function renderPareto(data) {
    var el = document.getElementById('chart-pareto');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) {
      return getVal(s, 'query_size_kb') !== null && getVal(s, 'response_size_kb') !== null && getVal(s, 'server_time_ms') !== null;
    });

    // total communication
    items.forEach(function (s) {
      s._totalComm = getVal(s, 'query_size_kb') + getVal(s, 'response_size_kb');
    });

    // find Pareto-optimal: no other scheme has both lower comm AND lower server time
    var pareto = items.filter(function (s) {
      return !items.some(function (o) {
        return o !== s && o._totalComm <= s._totalComm && getVal(o, 'server_time_ms') <= getVal(s, 'server_time_ms') &&
          (o._totalComm < s._totalComm || getVal(o, 'server_time_ms') < getVal(s, 'server_time_ms'));
      });
    });
    pareto.sort(function (a, b) { return a._totalComm - b._totalComm; });

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
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: 'top center',
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
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A');
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
      name: 'Tier 1 (exact)',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'Tier 3 (from asymptotics)',
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

  // ── 6b. Pareto — Communication vs Client Storage ────
  function renderParetoCommStorage(data) {
    var el = document.getElementById('chart-pareto-comm-storage');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) {
      return getVal(s, 'query_size_kb') !== null && getVal(s, 'response_size_kb') !== null && getVal(s, 'client_storage_mb') !== null;
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
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: 'top center', cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Client Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A');
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
      name: 'Tier 1 (exact)',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'Tier 3 (from asymptotics)',
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

  // ── 6c. Pareto — Communication vs Client Time ──────
  function renderParetoCommClient(data) {
    var el = document.getElementById('chart-pareto-comm-client');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) {
      return getVal(s, 'query_size_kb') !== null && getVal(s, 'response_size_kb') !== null && getVal(s, 'client_time_ms') !== null;
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
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: 'top center', cliponaxis: false,
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A');
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
      name: 'Tier 1 (exact)',
      marker: { symbol: 'circle-open', size: 8, color: t.text, line: { width: 1.5, color: t.text } },
      hoverinfo: 'skip'
    });
    traces.push({
      x: [null], y: [null], mode: 'markers', type: 'scatter',
      name: 'Tier 3 (from asymptotics)',
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

  // ── 6d. 3D Scatter — Comm x Client Storage x Client Time ──
  function renderPareto3DComm(data) {
    var el = document.getElementById('chart-pareto-3d-comm');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) {
      return getVal(s, 'query_size_kb') !== null && getVal(s, 'response_size_kb') !== null &&
        getVal(s, 'client_storage_mb') !== null && getVal(s, 'client_time_ms') !== null;
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
        text: gItems.map(function (s) { return s.display_name; }),
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
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Comm: ' + formatNum(s._totalComm) + ' KB<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A');
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
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Comm: ' + formatNum(s._totalComm) + ' KB<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            '<br><b>Pareto-optimal \u2605</b><br>Source: ' + (s.source_ref || 'N/A');
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

  // ── 6e. 3D Scatter — Server Time x Client Storage x Client Time ──
  function renderPareto3DServer(data) {
    var el = document.getElementById('chart-pareto-3d-server');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) {
      return getVal(s, 'server_time_ms') !== null &&
        getVal(s, 'client_storage_mb') !== null && getVal(s, 'client_time_ms') !== null;
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
        text: gItems.map(function (s) { return s.display_name; }),
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
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal \u2605</b>' : '') + '<br>Source: ' + (s.source_ref || 'N/A');
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
          return s.display_name + (entrySizeLabel(s) ? ' (' + entrySizeLabel(s) + ' entries)' : '') + '<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Storage: ' + formatNum(getVal(s, 'client_storage_mb')) + ' MB<br>Client: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms' +
            '<br><b>Pareto-optimal \u2605</b><br>Source: ' + (s.source_ref || 'N/A');
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

  // ── 6f. Radar — Tabbed per DB-size tier, 2-per-row grid ──
  var _lastRadarTab = null;
  var _radarMode = 'relative'; // 'relative' | 'absolute'

  function renderRadar(data) {
    var tabsEl = document.getElementById('radar-tabs');
    var gridEl = document.getElementById('radar-grid');
    var allPanel = document.getElementById('radar-all-panel');
    var legendEl = document.getElementById('radar-tier-legend');
    var modeTabsEl = document.getElementById('radar-mode-tabs');
    if (!tabsEl || !gridEl) return;

    // build construction-type legend (once)
    if (legendEl && !legendEl.hasChildNodes()) {
      legendEl.className = 'construction-legend';
      Object.keys(GROUP_COLORS).forEach(function (g) {
        if (g === 'X') return; // excluded from radar per convention
        var span = document.createElement('span');
        span.className = 'construction-legend-item';
        var dot = document.createElement('span');
        dot.className = 'construction-dot';
        dot.style.background = GROUP_COLORS[g];
        span.appendChild(dot);
        span.appendChild(document.createTextNode(GROUP_NAMES[g]));
        legendEl.appendChild(span);
      });

      // tier line-style legend (separate row)
      var tierDiv = document.createElement('div');
      tierDiv.className = 'construction-legend';
      tierDiv.style.marginTop = '6px';
      [
        { label: 'Tier 1 (Exact)',   dash: '' },
        { label: 'Tier 2 (Approx.)', dash: '6,4' },
        { label: 'Tier 3 (Asymp.)',  dash: '2,3' }
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
        tierDiv.appendChild(item);
      });
      legendEl.parentNode.insertBefore(tierDiv, legendEl.nextSibling);
    }

    var radarMetrics = ALL_METRICS.filter(function (m) {
      return data.some(function (s) { return getVal(s, m) !== null; });
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
          return vals[m] !== null ? vals[m] : 1;
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
                ? 'Log-norm: ' + (s._absNorm[m] !== null ? (s._absNorm[m] * 100).toFixed(0) + '%' : 'N/A')
                : 'Rank: ' + (s._ranks[m] !== null ? (s._ranks[m] * 100).toFixed(0) + '%' : 'N/A');
              var valStr = raw !== null ? formatNum(raw) + ' ' + METRIC_UNITS[m] : 'N/A';
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
          if (vals[m] === null) {
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
    allBtn.addEventListener('click', function () { showAll(); });
    tabsEl.appendChild(allBtn);

    // Per DB-size tier tabs
    DB_SIZE_TIERS.forEach(function (tier) {
      var btn = document.createElement('button');
      btn.className = 'radar-tab' + (tier === '1-bit' ? ' onebit-tab' : '');
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

    // restore last tab or default to <= 1 GB
    if (_lastRadarTab === 'all') { showAll(); }
    else { drawTier(_lastRadarTab || 'tiny'); }
  }

  // ── 7. Timeline ───────────────────────────────────────
  function renderTimeline(data) {
    var el = document.getElementById('chart-timeline');
    if (!el) return;
    var t = themeColors();

    var withTput = data.filter(function (s) { return getVal(s, 'throughput_gbps') !== null && s.year >= 2020; });

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
      return { year: s.year, logY: Math.log10(s._throughput || 0.01), id: s.id };
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
            var comm = (s._query_kb || 100) + (s._response_kb || 100);
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
          if (va === null || va === undefined) return 1;
          if (vb === null || vb === undefined) return -1;
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
            if (va === null || va === undefined) return 1;
            if (vb === null || vb === undefined) return -1;
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
        pill.textContent = 'Tier ' + tier;
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
  var _activeDbTier = 'tiny';

  function renderFilteredCharts(data) {
    renderCommunicationScatter(data);
    renderThroughputBars(data);
    renderServerTimeBars(data);
    renderClientCost(data);
    renderOfflineStorage(data);
    renderPareto(data);
    renderParetoCommStorage(data);
    renderParetoCommClient(data);
    renderPareto3DComm(data);
    renderPareto3DServer(data);
  }

  function setActiveDbTier(tier) {
    _activeDbTier = tier;
    // Sync all tab UIs across all pages
    document.querySelectorAll('.db-size-tabs .db-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tier === tier);
    });
    if (_cachedData) {
      var filtered = filterByDbSize(_cachedData, tier);
      renderFilteredCharts(filtered);
    }
  }

  function initDbSizeTabs() {
    document.querySelectorAll('.db-size-tabs').forEach(function (container) {
      container.querySelectorAll('.db-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setActiveDbTier(btn.dataset.tier);
        });
      });
    });
  }

  // ── v2 Data Transformation ────────────────────────────
  function classifyDbTier(dbBytes, entrySizeBytes) {
    if (entrySizeBytes <= 0.125) return '1-bit';
    if (dbBytes <= 1e9) return 'tiny';
    if (dbBytes <= 8e9) return 'small';
    if (dbBytes <= 32e9) return 'medium';
    return 'large';
  }

  function variantDisplayName(schemeName, variant, isMultiVariant) {
    if (!isMultiVariant) return schemeName;
    if (variant === schemeName) return schemeName;
    if (variant.toLowerCase().indexOf(schemeName.toLowerCase()) === 0) return variant;
    return schemeName + ' (' + variant + ')';
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

        // Classify benchmarks by DB size tier; pick representative per tier
        var tierBenchmarks = {};
        var dbCategories = {};

        benches.forEach(function (b) {
          var config = configMap[b.config_id];
          if (!config) return;
          var dbBytes = config._db_size_bytes;
          var tier = classifyDbTier(dbBytes, config.entry_size_bytes);

          dbCategories[tier] = true;

          if (!tierBenchmarks[tier] || dbBytes > tierBenchmarks[tier]._db_size_bytes) {
            tierBenchmarks[tier] = {
              metrics: b.metrics,
              data_tier: b.data_tier,
              source_ref: b.source_ref,
              estimation_meta: b.estimation_meta,
              _db_size_bytes: dbBytes,
              _config: config
            };
          }
        });

        // Pick primary benchmark: largest db_size, prefer lower data_tier
        var primary = null;
        var primaryDbSize = -1;
        Object.keys(tierBenchmarks).forEach(function (tier) {
          var tb = tierBenchmarks[tier];
          if (tb._db_size_bytes > primaryDbSize ||
              (tb._db_size_bytes === primaryDbSize && tb.data_tier < (primary ? primary.data_tier : 4))) {
            primary = tb;
            primaryDbSize = tb._db_size_bytes;
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
          _tierBenchmarks: tierBenchmarks
        });
      });
    });

    return entities;
  }

  // ── Data Loading & Init ───────────────────────────────
  var _cachedData = null;

  function renderCharts(data) {
    renderHeatmap(data);
    var filtered = filterByDbSize(data, _activeDbTier);
    renderFilteredCharts(filtered);

    // Disable scroll-zoom on 3D plots while preserving page scroll
    ['chart-pareto-3d-comm', 'chart-pareto-3d-server'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('wheel', function (e) { e.stopPropagation(); }, true);
    });

    renderRadar(data);
    renderTimeline(data);
  }

  function init() {
    // Resolve data path: charts.js lives in reported/, data in data/
    var scriptEl = document.querySelector('script[src$="charts.js"]');
    var prefix = scriptEl ? scriptEl.getAttribute('src').replace('charts.js', '') : '';
    fetch(prefix + '../data/reported.json')
      .then(function (r) { return r.json(); })
      .then(function (raw) {
        // clear loading indicators
        var loaders = document.querySelectorAll('.chart-loading');
        loaders.forEach(function (el) { el.remove(); });

        // Transform v2 schema into flat plotable entities
        var entities = transformV2(raw);

        _cachedData = computeCompositeScores(entities);
        initDbSizeTabs();
        renderCharts(_cachedData);
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
        if (el) el.innerHTML = '<p style="color:red;padding:20px">Failed to load data. Ensure data/reported.json exists.</p>';
      });
  }

  // re-render charts on theme change (preserve catalog filters/sort)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (_cachedData) {
        renderCharts(_cachedData);
      }
    });
  }

  // debounced re-render on window resize / zoom to prevent Plotly height feedback loop
  var _resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      if (_cachedData) renderCharts(_cachedData);
    }, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

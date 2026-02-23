/* ── PIR Engineering Notes — charts.js ────────────────── */
/* All Plotly chart rendering + data loading + composite scoring */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  var GROUP_COLORS = { A: '#1f77b4', B: '#2ca02c', C: '#ff7f0e', D: '#d62728', X: '#7f7f7f' };
  var GROUP_NAMES = {
    A: 'FHE-Based', B: 'Stateless', C: 'Client-Indep. Preprocessing',
    D: 'Client-Dep. Preprocessing', X: 'Extensions'
  };
  var TIER_OPACITY = { 1: 1.0, 2: 0.8, 3: 0.55 };
  var TIER_LABELS = { 1: 'Exact', 2: 'Approx', 3: 'Asymp.' };
  var TIER_BADGE = { 1: '', 2: '\u2020', 3: '*' };

  // core metrics for composite scoring
  var CORE_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps'];
  // all display metrics
  var ALL_METRICS = ['query_size_kb', 'response_size_kb', 'server_time_ms', 'throughput_gbps',
    'client_time_ms', 'offline_hint_mb', 'client_storage_mb'];
  var METRIC_LABELS = {
    query_size_kb: 'Query (KB)', response_size_kb: 'Response (KB)',
    server_time_ms: 'Server (ms)', throughput_gbps: 'Throughput (GB/s)',
    client_time_ms: 'Client (ms)', offline_hint_mb: 'Offline (MB)',
    client_storage_mb: 'Storage (MB)'
  };
  // lower is better for all except throughput
  var HIGHER_IS_BETTER = { throughput_gbps: true };

  var SCHEME_LINKS = {
    xpir_2014: 'Group%20A%20-%20FHE%20Based%20PIR/xpir_2014/xpir_2014_notes.md',
    xpir_2016: 'Group%20A%20-%20FHE%20Based%20PIR/xpir_2016/xpir_2016_notes.md',
    sealpir_2018: 'Group%20A%20-%20FHE%20Based%20PIR/sealpir_2018/sealpir_2018_notes.md',
    mulpir_2019: 'Group%20A%20-%20FHE%20Based%20PIR/mulpir_2019/mulpir_2019_notes.md',
    onionpir_2021: 'Group%20A%20-%20FHE%20Based%20PIR/onionpir_2021/onionpir_2021_notes.md',
    addra_2021: 'Group%20A%20-%20FHE%20Based%20PIR/addra_2021/addra_2021_notes.md',
    cwpir_2022: 'Group%20A%20-%20FHE%20Based%20PIR/cwpir_2022/cwpir_2022_notes.md',
    spiral_2022: 'Group%20A%20-%20FHE%20Based%20PIR/spiral_2022/spiral_2022_notes.md',
    frodopir_2022: 'Group%20A%20-%20FHE%20Based%20PIR/frodopir_2022/frodopir_2022_notes.md',
    thorpir_2024: 'Group%20A%20-%20FHE%20Based%20PIR/thorpir_2024/thorpir_2024_notes.md',
    onionpirv2_2025: 'Group%20A%20-%20FHE%20Based%20PIR/onionpirv2_2025/onionpirv2_2025_notes.md',
    hintlesspir_2023: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/hintlesspir_2023/HintlessPIR_2023_notes.md',
    ypir_2024: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/ypir_2024/YPIR_2024_notes.md',
    respire_2024: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/respire_2024/Respire_2024_notes.md',
    whispir_2024: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/whispir_2024/WhisPIR_2024_notes.md',
    pirouette_2025: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/pirouette_2025/Pirouette_2025_notes.md',
    inspire_2025: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/inspire_2025/InsPIRe_2025_notes.md',
    npir_2026: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/npir_2026/NPIR_2026_notes.md',
    via_2025: 'Group%20B%20-%20Stateless%20Single%20Server%20PIR/via_2025/VIA_2025_notes.md',
    simplepir_2022: 'Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md',
    doublepir_2022: 'Group%20C%20-%20Client%20Independent%20Preprocessing/simplepir_doublepir_2022/SimplePIR_DoublePIR_2022_notes.md',
    verisimplepir_2024: 'Group%20C%20-%20Client%20Independent%20Preprocessing/verisimplepir_2024/VeriSimplePIR_2024_notes.md',
    barelydoublyefficient_2025: 'Group%20C%20-%20Client%20Independent%20Preprocessing/barelydoublyefficient_2025/BarelyDoublyEfficient_2025_notes.md',
    incrementalpir_2026: 'Group%20C%20-%20Client%20Independent%20Preprocessing/incrementalpir_2026/IncrementalPIR_2026_notes.md',
    ck20_2019: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/ck20_2019/CK20_2019_notes.md',
    incpir_2021: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/incpir_2021/IncPIR_2021_notes.md',
    piano_2023: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/piano_2023/Piano_2023_notes.md',
    treepir_2023: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/treepir_2023/TreePIR_2023_notes.md',
    rms24_2024: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/rms24_2024/RMS24_2024_notes.md',
    ishaishiwichs_2025: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/ishaishiwichs_2025/IshaiShiWichs_2025_notes.md',
    plinko_2024: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/plinko_2024/Plinko_2024_notes.md',
    singlepass_2024: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/singlepass_2024/SinglePass_2024_notes.md',
    wangren_2024: 'Group%20D%20-%20Client%20Dependent%20Preprocessing/wangren_2024/WangRen_2024_notes.md',
    keywordpir_2019: 'Group%20X%20-%20Extensions/keywordpir_2019/KeywordPIR_2019_notes.md',
    distributionalpir_2025: 'Group%20X%20-%20Extensions/distributionalpir_2025/DistributionalPIR_2025_notes.md'
  };

  var BASE_URL = 'https://github.com/0xalizk/PIR-Eng-Notes/blob/main/Schemes/';

  var IMPL_URLS = {
    addra_2021: 'https://github.com/ishtiyaque/FastPIR',
    cwpir_2022: 'https://github.com/RasoulAM/constant-weight-pir',
    distributionalpir_2025: 'https://github.com/ryanleh/crowdsurf',
    simplepir_2022: 'https://github.com/ahenzinger/simplepir',
    doublepir_2022: 'https://github.com/ahenzinger/simplepir',
    frodopir_2022: 'https://github.com/brave-experiments/frodo-pir',
    hintlesspir_2023: 'https://github.com/google/hintless_pir',
    inspire_2025: 'https://github.com/google/private-membership/tree/main/research/InsPIRe',
    npir_2026: 'https://github.com/llllinyl/npir',
    onionpirv2_2025: 'https://github.com/chenyue42/OnionPIRv2',
    pirouette_2025: 'https://github.com/KULeuven-COSIC/Pirouette',
    plinko_2024: 'https://github.com/keewoolee/rms24-plinko-spec',
    rms24_2024: 'https://github.com/keewoolee/rms24-plinko-spec',
    respire_2024: 'https://github.com/AMACB/respire',
    sealpir_2018: 'https://github.com/microsoft/SealPIR',
    spiral_2022: 'https://github.com/menonsamir/spiral',
    treepir_2023: 'https://github.com/alazzaretti/treePIR',
    xpir_2016: 'https://github.com/XPIR-team/XPIR',
    xpir_2014: 'https://github.com/XPIR-team/XPIR',
    piano_2023: 'https://github.com/wuwuz/Piano-PIR-new',
    ypir_2024: 'https://github.com/menonsamir/ypir'
  };

  function schemeUrl(id) {
    return SCHEME_LINKS[id] ? BASE_URL + SCHEME_LINKS[id] : '#';
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
      font: { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
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
  function barLeftMargin() { return isMobile() ? 110 : 140; }

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
        var hover = s.display_name + '<br>' + METRIC_LABELS[m] + ': ' +
          (raw !== null ? formatNum(raw) : 'N/A') +
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
      textfont: { size: 10 },
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

    var layout = baseLayout('PIR Scheme Rankings — Sorted Heatmap', {
      xaxis: {
        tickfont: { size: 11 }, side: 'top',
        gridcolor: t.grid
      },
      yaxis: {
        tickfont: { size: 10 }, autorange: true,
        gridcolor: t.grid
      },
      margin: { t: 100, r: 80, b: 24, l: 160 },
      shapes: hd.shapes,
      height: Math.max(500, sorted.length * 22 + 120),
      annotations: (hd.annotations || []).concat([{
        text: '<i>Click inside a column to sort by it</i>',
        xref: 'paper', yref: 'paper',
        x: 0.0, y: 1.08,
        showarrow: false,
        font: { size: 13, color: t.muted },
        xanchor: 'left'
      }])
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
        if (va === null && vb === null) return 0;
        if (va === null) return -1; // nulls at bottom (index 0 in reversed array)
        if (vb === null) return 1;
        // reversed sort: worst at index 0 (bottom), best at top
        return HIGHER_IS_BETTER[metric] ? va - vb : vb - va;
      });

      var newSchemes = reSorted.map(function (s) { return s.display_name; });
      var nhd = buildHeatmapData(reSorted);

      Plotly.react(el, [{
        z: nhd.z, x: nhd.metricLabels, y: newSchemes,
        type: 'heatmap',
        colorscale: [[0, '#22c55e'], [0.5, '#eab308'], [1, '#ef4444']],
        text: nhd.text, texttemplate: '%{text}', textfont: { size: 10 },
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
      g.text.push(s.display_name + '<br>Query: ' + formatNum(qk) + ' KB<br>Response: ' + formatNum(rk) + ' KB<br>Tier: ' + TIER_LABELS[s.data_tier]);
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
        textfont: { size: 9, color: t.muted },
        hovertext: groups[g].text,
        hoverinfo: 'text',
        marker: {
          color: groups[g].marker.color,
          opacity: groups[g].marker.opacity,
          size: groups[g].marker.size,
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
        tickvals: [0.01, 0.1, 1, 10, 100, 1000, 10000],
        ticktext: ['0.01 KB', '0.1 KB', '1 KB', '10 KB', '100 KB', '1 MB', '10 MB']
      },
      yaxis: {
        title: 'Response Size', type: 'log', gridcolor: t.grid,
        tickvals: [0.01, 0.1, 1, 10, 100, 1000, 10000],
        ticktext: ['0.01 KB', '0.1 KB', '1 KB', '10 KB', '100 KB', '1 MB', '10 MB']
      },
      legend: { orientation: 'h', x: 0, y: -0.2, traceorder: 'grouped', groupclick: 'toggleitem', font: { size: 11 } },
      height: isMobile() ? 500 : 715
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

    Plotly.newPlot(el, [{
      y: items.map(function (s) { return s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'throughput_gbps'); }),
      type: 'bar', orientation: 'h',
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'throughput_gbps')) + ' GB/s'; }),
      textposition: 'outside',
      hovertext: items.map(function (s) {
        return s.display_name + '<br>Throughput: ' + formatNum(getVal(s, 'throughput_gbps')) + ' GB/s<br>Group: ' + s.group + '<br>Tier: ' + TIER_LABELS[s.data_tier];
      }),
      hoverinfo: 'text'
    }], baseLayout('Server Throughput (GB/s) — Higher is Better', {
      yaxis: { autorange: 'reversed', tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: 'Throughput (GB/s)', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(350, items.length * 30 + 100)
    }), plotConfig());
  }

  // ── 3b. Server Time Bars ──────────────────────────────
  function renderServerTimeBars(data) {
    var el = document.getElementById('chart-server-time');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'server_time_ms') !== null; });
    items.sort(function (a, b) { return getVal(a, 'server_time_ms') - getVal(b, 'server_time_ms'); });

    Plotly.newPlot(el, [{
      y: items.map(function (s) { return s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'server_time_ms'); }),
      type: 'bar', orientation: 'h',
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'server_time_ms')) + ' ms'; }),
      textposition: 'outside',
      hovertext: items.map(function (s) {
        return s.display_name + '<br>Server Time: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms<br>Group: ' + s.group + '<br>Tier: ' + TIER_LABELS[s.data_tier];
      }),
      hoverinfo: 'text'
    }], baseLayout('Server Time (ms) — Lower is Better', {
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      xaxis: { title: 'Server Time (ms)', type: 'log', gridcolor: t.grid },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 48 },
      height: Math.max(350, items.length * 26 + 100)
    }), plotConfig());
  }

  // ── 4. Client Cost Bars ───────────────────────────────
  function renderClientCost(data) {
    var el = document.getElementById('chart-client-cost');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'client_time_ms') !== null; });
    items.sort(function (a, b) { return getVal(a, 'client_time_ms') - getVal(b, 'client_time_ms'); });

    Plotly.newPlot(el, [{
      y: items.map(function (s) { return s.display_name; }),
      x: items.map(function (s) { return getVal(s, 'client_time_ms'); }),
      type: 'bar', orientation: 'h',
      marker: {
        color: items.map(function (s) { return GROUP_COLORS[s.group]; }),
        opacity: items.map(function (s) { return TIER_OPACITY[s.data_tier]; })
      },
      text: items.map(function (s) { return formatNum(getVal(s, 'client_time_ms')) + ' ms'; }),
      textposition: 'outside',
      hovertext: items.map(function (s) {
        return s.display_name + '<br>Client Time: ' + formatNum(getVal(s, 'client_time_ms')) + ' ms<br>Group: ' + s.group;
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
      return getVal(s, 'offline_hint_mb') !== null || getVal(s, 'client_storage_mb') !== null;
    });

    // sort by max of the two values (largest at top)
    items.sort(function (a, b) {
      var aMax = Math.max(getVal(a, 'offline_hint_mb') || 0, getVal(a, 'client_storage_mb') || 0);
      var bMax = Math.max(getVal(b, 'offline_hint_mb') || 0, getVal(b, 'client_storage_mb') || 0);
      return aMax - bMax;
    });

    var schemes = items.map(function (s) { return s.display_name; });
    var traces = [];

    // Offline hint bars
    traces.push({
      y: schemes,
      x: items.map(function (s) { return getVal(s, 'offline_hint_mb'); }),
      type: 'bar', orientation: 'h',
      name: 'Offline Hint',
      marker: { color: HINT_COLOR, opacity: 0.85 },
      text: items.map(function (s) {
        var v = getVal(s, 'offline_hint_mb');
        return v !== null ? formatNum(v) + ' MB' : '';
      }),
      textposition: 'outside',
      hovertext: items.map(function (s) {
        var v = getVal(s, 'offline_hint_mb');
        return v !== null ? s.display_name + '<br>Offline Hint: ' + formatNum(v) + ' MB' : '';
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
      hovertext: items.map(function (s) {
        var v = getVal(s, 'client_storage_mb');
        return v !== null ? s.display_name + '<br>Client Storage: ' + formatNum(v) + ' MB' : '';
      }),
      hoverinfo: 'text'
    });

    Plotly.newPlot(el, traces, baseLayout('Offline Hints & Client Storage', {
      barmode: 'group',
      xaxis: { title: 'Size (MB)', gridcolor: t.grid },
      yaxis: { tickfont: { size: 11 }, gridcolor: t.grid },
      legend: { orientation: 'h', x: 0, y: -0.15, font: { size: 11 } },
      margin: { l: barLeftMargin(), r: 60, t: 48, b: 60 },
      height: Math.max(350, items.length * 40 + 120)
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

    // all points
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s._totalComm; }),
        y: gItems.map(function (s) { return getVal(s, 'server_time_ms'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: 'top center',
        textfont: { size: 9, color: t.muted },
        marker: {
          size: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 14 : 8; }),
          color: GROUP_COLORS[g],
          symbol: gItems.map(function (s) { return pareto.indexOf(s) >= 0 ? 'star' : (s.data_tier === 3 ? 'diamond' : 'circle'); }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return s.display_name + '<br>Total Comm: ' + formatNum(s._totalComm) + ' KB<br>Server: ' + formatNum(getVal(s, 'server_time_ms')) + ' ms' +
            (pareto.indexOf(s) >= 0 ? '<br><b>Pareto-optimal</b>' : '');
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

    Plotly.newPlot(el, traces, baseLayout('Pareto Frontier — Communication vs Server Time', {
      xaxis: { title: 'Total Communication (KB)', type: 'log', gridcolor: t.grid },
      yaxis: { title: 'Server Time (ms)', type: 'log', gridcolor: t.grid },
      legend: { orientation: 'h', y: -0.2 },
      height: 500
    }), plotConfig());
  }

  // ── 6b. Radar — Tabbed per-group, 3-per-row grid ─────
  var RADAR_GROUPS = [
    { key: 'A', label: 'FHE-Based' },
    { key: 'B', label: 'Stateless' },
    { key: 'C', label: 'Client-Indep. Preprocessing' },
    { key: 'D', label: 'Client-Dep. Preprocessing' }
  ];

  function renderRadar(data) {
    var tabsEl = document.getElementById('radar-tabs');
    var gridEl = document.getElementById('radar-grid');
    var allPanel = document.getElementById('radar-all-panel');
    if (!tabsEl || !gridEl) return;

    var radarMetrics = ALL_METRICS.filter(function (m) {
      return data.some(function (s) { return getVal(s, m) !== null; });
    });
    var theta = radarMetrics.map(function (m) { return METRIC_LABELS[m]; });
    theta.push(theta[0]);

    var activeTab = null;

    function showAll() {
      if (activeTab === 'all') return;
      activeTab = 'all';

      Array.from(tabsEl.children).forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.group === 'all');
      });

      gridEl.style.display = 'none';
      gridEl.innerHTML = '';
      if (allPanel) allPanel.style.display = '';
    }

    function drawGroup(groupKey) {
      if (activeTab === groupKey) return;
      activeTab = groupKey;

      // update tab active state
      Array.from(tabsEl.children).forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.group === groupKey);
      });

      // hide heatmap, show radar grid
      if (allPanel) allPanel.style.display = 'none';
      gridEl.style.display = '';

      // clear grid
      gridEl.innerHTML = '';

      var schemes = data.filter(function (s) { return s.group === groupKey; })
        .sort(function (a, b) { return a._composite - b._composite; });

      var t = themeColors();
      var color = GROUP_COLORS[groupKey];

      schemes.forEach(function (s) {
        var cell = document.createElement('div');
        cell.className = 'radar-cell';
        gridEl.appendChild(cell);

        var r = radarMetrics.map(function (m) {
          return s._ranks[m] !== null ? s._ranks[m] : 1;
        });
        r.push(r[0]);

        var trace = {
          type: 'scatterpolar', mode: 'lines+markers',
          r: r, theta: theta,
          name: s.display_name,
          marker: { size: 5, color: color },
          line: { color: color, width: 2 },
          fill: 'toself',
          fillcolor: color + '22',
          hovertext: radarMetrics.map(function (m) {
            var raw = getVal(s, m);
            return s.display_name + '<br>' + METRIC_LABELS[m] + ': ' + (raw !== null ? formatNum(raw) : 'N/A') +
              '<br>Rank: ' + (s._ranks[m] !== null ? (s._ranks[m] * 100).toFixed(0) + '%' : 'N/A');
          }),
          hoverinfo: 'text'
        };

        var layout = {
          polar: {
            radialaxis: {
              visible: true, range: [0, 1],
              tickvals: [0, 0.5, 1],
              ticktext: ['Best', 'Mid', 'Worst'],
              gridcolor: t.grid, linecolor: t.grid,
              tickfont: { color: t.muted, size: 9 }
            },
            angularaxis: {
              tickfont: { size: 10, color: t.text },
              gridcolor: t.grid, linecolor: t.grid
            },
            bgcolor: 'rgba(0,0,0,0)'
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: t.text, family: t.font.family, size: 11 },
          showlegend: false,
          margin: { t: 40, r: 30, b: 20, l: 30 },
          height: 320,
          title: {
            text: s.display_name,
            font: { size: 14, color: t.text },
            y: 0.97
          },
          annotations: [{
            text: TIER_LABELS[s.data_tier] + (s.has_implementation ? '' : ' (no impl)'),
            showarrow: false,
            xref: 'paper', yref: 'paper',
            x: 0.5, y: -0.02,
            font: { size: 10, color: t.muted }
          }]
        };

        Plotly.newPlot(cell, [trace], layout, plotConfig());
      });
    }

    // build tabs (clear first for theme re-render)
    tabsEl.innerHTML = '';

    // "All" tab (heatmap)
    var allBtn = document.createElement('button');
    allBtn.className = 'radar-tab';
    allBtn.dataset.group = 'all';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', function () { showAll(); });
    tabsEl.appendChild(allBtn);

    // Per-group tabs
    RADAR_GROUPS.forEach(function (g) {
      var btn = document.createElement('button');
      btn.className = 'radar-tab';
      btn.dataset.group = g.key;
      btn.innerHTML = '<span class="tab-dot" style="background:' + GROUP_COLORS[g.key] + '"></span>' + g.label;
      btn.addEventListener('click', function () { drawGroup(g.key); });
      tabsEl.appendChild(btn);
    });

    // default to FHE-Based
    drawGroup('A');
  }

  // ── 6c. Timeline ──────────────────────────────────────
  function renderTimeline(data) {
    var el = document.getElementById('chart-timeline');
    if (!el) return;
    var t = themeColors();

    var items = data.filter(function (s) { return getVal(s, 'throughput_gbps') !== null; });

    var traces = [];
    Object.keys(GROUP_COLORS).forEach(function (g) {
      var gItems = items.filter(function (s) { return s.group === g; });
      if (!gItems.length) return;
      traces.push({
        x: gItems.map(function (s) { return s.year; }),
        y: gItems.map(function (s) { return getVal(s, 'throughput_gbps'); }),
        mode: 'markers+text', type: 'scatter', name: GROUP_NAMES[g],
        text: gItems.map(function (s) { return s.display_name; }),
        textposition: 'top center',
        textfont: { size: 9, color: t.muted },
        marker: {
          color: GROUP_COLORS[g],
          size: gItems.map(function (s) {
            var comm = (getVal(s, 'query_size_kb') || 100) + (getVal(s, 'response_size_kb') || 100);
            return Math.max(10, Math.min(40, 50 / Math.log10(comm + 1)));
          }),
          opacity: gItems.map(function (s) { return TIER_OPACITY[s.data_tier]; }),
          line: { width: 1, color: t.text }
        },
        hovertext: gItems.map(function (s) {
          return s.display_name + ' (' + s.year + ')<br>Throughput: ' + formatNum(getVal(s, 'throughput_gbps')) + ' GB/s<br>Group: ' + s.group;
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
      legend: { orientation: 'h', y: -0.2 },
      height: isMobile() ? 380 : 495
    }), plotConfig());
  }

  // ── 7. Scheme Catalog Table ───────────────────────────
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
        var link = schemeUrl(s.id);
        tr.innerHTML =
          '<td><a href="' + link + '" target="_blank">' + s.display_name + '</a></td>' +
          '<td><span class="group-dot" style="background:' + GROUP_COLORS[s.group] + '"></span> ' + s.group + '</td>' +
          '<td>' + s.year + '</td>' +
          '<td class="num">' + formatNum(getVal(s, 'query_size_kb')) + '</td>' +
          '<td class="num">' + formatNum(getVal(s, 'response_size_kb')) + '</td>' +
          '<td class="num">' + formatNum(getVal(s, 'server_time_ms')) + '</td>' +
          '<td class="num">' + formatNum(getVal(s, 'throughput_gbps')) + '</td>' +
          '<td class="num">' + formatNum(getVal(s, 'client_time_ms')) + '</td>' +
          '<td>' + TIER_LABELS[s.data_tier] + '</td>' +
          '<td>' + (s.has_implementation ? (IMPL_URLS[s.id] ? '<a href="' + IMPL_URLS[s.id] + '" target="_blank">Yes</a>' : 'Yes') : 'No') + '</td>';
        el.appendChild(tr);
      });
    }

    // sortable headers
    var columns = [
      { key: 'display_name', label: 'Scheme' },
      { key: 'group', label: 'Group' },
      { key: 'year', label: 'Year' },
      { key: 'query_size_kb', label: 'Query KB', metric: true },
      { key: 'response_size_kb', label: 'Response KB', metric: true },
      { key: 'server_time_ms', label: 'Server ms', metric: true },
      { key: 'throughput_gbps', label: 'Throughput GB/s', metric: true },
      { key: 'client_time_ms', label: 'Client ms', metric: true },
      { key: 'data_tier', label: 'Tier' },
      { key: 'has_implementation', label: 'Impl?' }
    ];

    headerRow.innerHTML = '';
    columns.forEach(function (col) {
      var th = document.createElement('th');
      th.textContent = col.label;
      th.style.cursor = 'pointer';
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
      var implFilter = null; // null = all, true = yes, false = no

      function applyFilters() {
        var filtered = data.filter(function (s) {
          return activeGroups.has(s.group) && activeTiers.has(s.data_tier) &&
            (implFilter === null || s.has_implementation === implFilter);
        });
        if (sortCol) {
          var col = columns.filter(function (c) { return c.key === sortCol; })[0];
          filtered.sort(function (a, b) {
            var va = col && col.metric ? getVal(a, sortCol) : a[sortCol];
            var vb = col && col.metric ? getVal(b, sortCol) : b[sortCol];
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
      implPill.className = 'filter-pill';
      implPill.textContent = 'Has Impl';
      implPill.addEventListener('click', function () {
        if (implFilter === true) { implFilter = null; implPill.classList.remove('active'); }
        else { implFilter = true; implPill.classList.add('active'); }
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
        implFilter = true;
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
        implFilter = null;
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

  // ── Data Loading & Init ───────────────────────────────
  var _cachedData = null;

  function renderCharts(data) {
    renderHeatmap(data);
    renderCommunicationScatter(data);
    renderThroughputBars(data);
    renderServerTimeBars(data);
    renderClientCost(data);
    renderOfflineStorage(data);
    renderPareto(data);
    renderRadar(data);
    renderTimeline(data);
  }

  function init() {
    fetch('data/pir_data.json')
      .then(function (r) { return r.json(); })
      .then(function (raw) {
        // clear loading indicators
        var loaders = document.querySelectorAll('.chart-loading');
        loaders.forEach(function (el) { el.remove(); });
        _cachedData = computeCompositeScores(raw);
        renderCharts(_cachedData);
        renderCatalog(_cachedData);
      })
      .catch(function (err) {
        console.error('Failed to load PIR data:', err);
        var el = document.getElementById('chart-heatmap');
        if (el) el.innerHTML = '<p style="color:red;padding:20px">Failed to load data. Ensure docs/data/pir_data.json exists.</p>';
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ── db_config.js — Dynamic DB config table from reported.json (v2) ── */
(function () {
  'use strict';

  function fetchData() {
    return fetch('data/reported.json')
      .then(function (r) { return r.json(); })
      .then(function (raw) { return raw.schemes || raw; });
  }

  // Format "2^20" → "2<sup>20</sup>"
  function fmtPow(s) {
    if (!s) return '\u2014';
    return String(s).replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
  }

  // Compute human-readable DB size from num_entries * entry_size_bytes
  function fmtDbSize(numEntries, entrySizeBytes) {
    var bytes = numEntries * entrySizeBytes;
    if (bytes >= 1e12) return (bytes / 1e12).toFixed(1) + ' TB';
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(0) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(0) + ' KB';
    return bytes + ' B';
  }

  // Determine config type from benchmarks that reference it
  function buildConfigTypes(scheme) {
    var types = {}; // config_id -> best type
    (scheme.benchmarks || []).forEach(function (b) {
      var tier = b.data_tier;
      var type = tier === 1 ? 'benchmarked' : tier === 2 ? 'analytical' : 'estimated';
      // Keep the "best" type (benchmarked > analytical > estimated)
      var rank = { benchmarked: 3, analytical: 2, estimated: 1 };
      if (!types[b.config_id] || rank[type] > rank[types[b.config_id]]) {
        types[b.config_id] = type;
      }
    });
    return types;
  }

  // Build source link to PDF
  function buildSourceLink(scheme, bench) {
    if (!bench || !bench.source_ref) return '\u2014';
    var href = scheme.source_pdf
      ? 'https://github.com/0xalizk/PIR-Eng-Notes/blob/main/research/' + scheme.source_pdf
      : null;
    return href
      ? '<a href="' + href + '" target="_blank">' + bench.source_ref + '</a>'
      : bench.source_ref;
  }

  // Normalize a footnote by replacing numbers with '#' to detect similar patterns
  function fnPattern(text) {
    return text.replace(/[\d,]+(\.\d+)?/g, '#');
  }

  // Merge a group of similar footnotes into one concise summary
  function mergeSimilar(texts) {
    if (texts.length <= 1) return texts;
    // Group by pattern
    var groups = {};
    var order = [];
    texts.forEach(function (t) {
      var pat = fnPattern(t);
      if (!groups[pat]) { groups[pat] = []; order.push(pat); }
      groups[pat].push(t);
    });
    var merged = [];
    order.forEach(function (pat) {
      var g = groups[pat];
      if (g.length <= 1) { merged.push(g[0]); return; }
      // Find the longest common prefix (word-boundary)
      var prefix = g[0];
      for (var i = 1; i < g.length; i++) {
        while (g[i].indexOf(prefix) !== 0 && prefix.length > 0) {
          prefix = prefix.substring(0, prefix.lastIndexOf(' '));
        }
      }
      // If prefix covers most of the text, summarize the varying suffixes
      if (prefix.length > 20) {
        var suffixes = g.map(function (t) { return t.substring(prefix.length).replace(/^[,.:;\s]+/, ''); });
        // If suffixes are short, list them inline
        var allShort = suffixes.every(function (s) { return s.length < 60; });
        if (allShort) {
          merged.push(prefix.replace(/[,.:;\s]+$/, '') + ': ' + suffixes.join(' · '));
        } else {
          merged.push(g[0]); // fallback: keep first only
        }
      } else {
        // Weak common prefix — keep first and note count
        merged.push(g[0] + ' (and ' + (g.length - 1) + ' similar config' + (g.length > 2 ? 's' : '') + ')');
      }
    });
    return merged;
  }

  // Collect footnotes from all benchmarks across all schemes
  function collectFootnotes(data) {
    var labels = 'abcdefghijklmnopqrstuvwxyz';
    var footnotes = [];
    var schemeLabels = {}; // scheme.id -> [label, ...]
    var idx = 0;

    data.forEach(function (s) {
      // Gather unique footnotes for this scheme
      var seen = {};
      var rawTexts = [];
      (s.benchmarks || []).forEach(function (b) {
        (b.footnotes || []).forEach(function (text) {
          if (seen[text]) return;
          seen[text] = true;
          rawTexts.push(text);
        });
      });
      // Merge similar footnotes within this scheme
      var merged = mergeSimilar(rawTexts);
      var sLabels = [];
      merged.forEach(function (text) {
        var label = idx < labels.length ? labels[idx] : String(idx + 1);
        footnotes.push({ id: 'fn-' + label, label: label, text: text });
        sLabels.push(label);
        idx++;
      });
      if (sLabels.length) schemeLabels[s.id] = sLabels;
    });

    return { footnotes: footnotes, schemeLabels: schemeLabels };
  }

  function renderTable(data) {
    var tbody = document.getElementById('configs-body');
    if (!tbody) return;

    var fnData = collectFootnotes(data);
    var schemeNum = 0;

    data.forEach(function (s) {
      schemeNum++;
      var configs = s.configs || [];
      var rowCount = configs.length || 1;
      var labels = fnData.schemeLabels[s.id] || [];
      var configTypes = buildConfigTypes(s);

      // Find best source_ref per config from benchmarks
      var configSources = {};
      (s.benchmarks || []).forEach(function (b) {
        if (!configSources[b.config_id] && b.source_ref) {
          configSources[b.config_id] = b;
        }
      });

      // Footnote superscript links for this scheme
      var fnSups = labels.map(function (l) {
        return ' <a href="#fn-' + l + '"><sup>' + l + '</sup></a>';
      }).join('');

      configs.forEach(function (cfg, i) {
        var tr = document.createElement('tr');
        if (i === 0) tr.className = 'scheme-start';

        var cells = '';

        // Rowspan cells: #, Scheme, Group (only on first config row)
        if (i === 0) {
          var rs = rowCount > 1 ? ' rowspan="' + rowCount + '"' : '';
          cells += '<td' + rs + ' align="center" valign="middle">' + schemeNum + '</td>';
          cells += '<td' + rs + ' align="center" valign="middle">' + s.display_name + '</td>';
        }

        // Config cells
        cells += '<td>' + fmtPow(cfg.num_entries_label || String(cfg.num_entries)) + '</td>';
        cells += '<td>' + (cfg.entry_size_label || '\u2014') + '</td>';
        cells += '<td>' + fmtDbSize(cfg.num_entries, cfg.entry_size_bytes) + '</td>';

        var type = configTypes[cfg.config_id] || 'estimated';
        cells += '<td><span class="type-dot ' + type + '"></span></td>';

        // Source cell with footnote links
        var bench = configSources[cfg.config_id];
        var src = buildSourceLink(s, bench);
        if (i === 0 && fnSups) src += fnSups;
        cells += '<td>' + src + '</td>';

        tr.innerHTML = cells;
        tbody.appendChild(tr);
      });
    });

    // Render footnotes
    renderFootnotes(fnData.footnotes);
  }

  function renderFootnotes(footnotes) {
    var container = document.getElementById('footnotes');
    if (!container || !footnotes.length) return;

    footnotes.forEach(function (fn) {
      var p = document.createElement('p');
      p.id = fn.id;
      var html = fn.text.replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      p.innerHTML = '<sup>' + fn.label + '</sup> ' + html;
      container.appendChild(p);
    });
  }

  function init() {
    fetchData()
      .then(function (data) {
        renderTable(data);
      })
      .catch(function (err) {
        console.error('Failed to load PIR data:', err);
        var tbody = document.getElementById('configs-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="color:red;padding:20px">Failed to load data.</td></tr>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ── db_config.js — Dynamic DB config table from reported.json ── */
(function () {
  'use strict';

  function fetchData() {
    return fetch('data/reported.json')
      .then(function (r) { return r.json(); });
  }

  // Format "2^20" → "2<sup>20</sup>", "10^6" → "10<sup>6</sup>", "~1.68×10^9" → "~1.68×10<sup>9</sup>"
  function fmtPow(s) {
    if (!s) return '\u2014';
    return s.replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
  }

  function typeClass(t) {
    if (t === 'benchmarked') return 'benchmarked';
    if (t === 'analytical') return 'analytical';
    return 'estimated';
  }

  function buildSourceLink(scheme, cfg) {
    if (!cfg.source_ref || cfg.source_ref === '\u2014') return '\u2014';
    var href = scheme.source_pdf
      ? '../research/' + scheme.source_pdf
      : null;
    var text = cfg.source_ref;
    return href
      ? '<a href="' + href + '" target="_blank">' + text + '</a>'
      : text;
  }

  // Assign sequential footnote labels across all schemes
  function collectFootnotes(data) {
    var labels = 'abcdefghijklmnopqrstuvwxyz';
    var footnotes = []; // {id, label, text, schemeIds}
    var schemeLabels = {}; // scheme.id -> [label, ...]
    var idx = 0;

    data.forEach(function (s) {
      if (!s.footnotes || !s.footnotes.length) return;
      schemeLabels[s.id] = [];
      s.footnotes.forEach(function (text) {
        var label = idx < labels.length ? labels[idx] : String(idx + 1);
        footnotes.push({ id: 'fn-' + label, label: label, text: text });
        schemeLabels[s.id].push(label);
        idx++;
      });
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
          cells += '<td' + rs + ' align="center" valign="middle">' + s.group + '</td>';
        }

        // Config cells
        cells += '<td>' + fmtPow(cfg.num_entries) + '</td>';
        cells += '<td>' + (cfg.entry_size || '\u2014') + '</td>';
        cells += '<td>' + (cfg.db_size || '\u2014') + '</td>';
        cells += '<td><span class="type-dot ' + typeClass(cfg.type) + '"></span></td>';

        // Source cell with footnote links
        var src = buildSourceLink(s, cfg);
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
      // Convert ^N notation in footnote text to <sup>N</sup>
      var html = fn.text.replace(/(\d+)\^(\d+)/g, '$1<sup>$2</sup>');
      // Convert backtick-wrapped text to <code>
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
        if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="color:red;padding:20px">Failed to load data.</td></tr>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

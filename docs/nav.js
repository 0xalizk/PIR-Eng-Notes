/* ── Shared sidebar navigation ─────────────────────────── */
(function () {
  'use strict';

  // Detect base path: works on both GitHub Pages (/PIR-Eng-Notes/) and local dev (/)
  var BASE = '/PIR-Eng-Notes/';
  var knownDirs = ['reported/pareto/', 'reported/', 'replicated/', 'standardized/', 'misc/', 'db_config.html'];
  var p = location.pathname;
  for (var i = 0; i < knownDirs.length; i++) {
    var idx = p.indexOf(knownDirs[i]);
    if (idx !== -1) { BASE = p.slice(0, idx); break; }
  }
  // If none matched, we're on the landing page — strip trailing filename if any
  if (BASE === '/PIR-Eng-Notes/' && p.indexOf('/PIR-Eng-Notes/') === -1) {
    BASE = p.replace(/index\.html$/, '');
  }

  var NAV_SECTIONS = [
    {
      label: 'Reported',
      path: 'reported/',
      children: [
        { label: 'Overview', anchor: '#overview' },
        { label: 'Communication', anchor: '#communication' },
        { label: 'Server', anchor: '#server-perf' },
        { label: 'Client', anchor: '#client-cost' },
        { label: 'Offline & Storage', anchor: '#offline-storage' },
        { label: 'Pareto Frontiers', href: 'reported/pareto/', children: [
          { label: 'Comm × Server', anchor: '#pareto-comm-server' },
          { label: 'Comm × Client', anchor: '#pareto-comm-client' },
          { label: 'Comm × Storage', anchor: '#pareto-comm-storage' },
          { label: 'Comm × Storage × Client', anchor: '#pareto-3d-comm' },
          { label: 'Server × Storage × Client', anchor: '#pareto-3d-server' }
        ]}
      ]
    },
    {
      label: 'Replicated',
      path: 'replicated/',
      children: []
    },
    {
      label: 'Standardized',
      path: 'standardized/',
      children: []
    },
    {
      label: 'Misc',
      path: 'misc/',
      noHeader: true,
      children: [
        { label: 'Timeline', anchor: '#timeline' },
        { label: 'DB Configs', href: 'db_config.html' },
        { label: 'Scheme Catalog', anchor: '#catalog' },
        { label: 'References', anchor: '#references' }
      ]
    }
  ];

  // Detect which section we're in based on path (exact match on directory)
  var path = location.pathname.replace(BASE, '').replace(/index\.html$/, '');
  var activeSection = '';
  NAV_SECTIONS.forEach(function (sec) {
    if (path === sec.path) activeSection = sec.path;
  });

  // Build sidebar HTML
  var container = document.getElementById('sidebar-nav');
  if (!container) return;

  var html = '';

  NAV_SECTIONS.forEach(function (sec) {
    var isOnSecPage = sec.path === activeSection;
    // Also expand if we're on a child sub-page (e.g. reported/pareto/ under reported/)
    var isUnderSection = isOnSecPage || path.indexOf(sec.path) === 0;
    var hasChildren = sec.children.length > 0;
    var sectionUrl = BASE + sec.path;

    // "noHeader" sections render as divider + flat links (no collapsible header)
    if (sec.noHeader) {
      html += '<div class="divider"></div>';
      sec.children.forEach(function (child) {
        var childHref = child.href ? (BASE + child.href) : (isOnSecPage ? child.anchor : (sectionUrl + child.anchor));
        html += '<a href="' + childHref + '" class="nav-link nav-bottom-link">' + child.label + '</a>';
      });
      return;
    }

    html += '<div class="nav-section' + (isUnderSection ? ' active' : '') + '">';

    // Section header row
    html += '<div class="nav-section-header">';
    html += '<a href="' + sectionUrl + '" class="nav-section-link">' + sec.label + '</a>';
    html += '<button class="nav-arrow" aria-label="Toggle ' + sec.label + '">' +
      (isUnderSection ? '&#9662;' : '&#9656;') + '</button>';
    html += '</div>';

    // Submenu
    html += '<div class="nav-submenu' + (isUnderSection ? ' open' : '') + '">';
    if (hasChildren) {
      sec.children.forEach(function (child) {
        if (child.children) {
          // Item with its own sub-page (e.g. Pareto)
          var childPageUrl = BASE + child.href;
          var isOnChildPage = path.indexOf(child.href) === 0;
          var nestedAnchors = child.children.map(function (s) { return s.anchor; });
          var expandNested = isOnChildPage ||
            (isOnSecPage && nestedAnchors.indexOf(location.hash) !== -1);
          html += '<a href="' + childPageUrl + '" class="nav-link nav-has-nested">' + child.label + '</a>';
          html += '<div class="nav-nested-group' + (expandNested ? ' open' : '') + '">';
          child.children.forEach(function (sub) {
            var subHref = isOnChildPage ? sub.anchor : (childPageUrl + sub.anchor);
            html += '<a href="' + subHref + '" class="nav-link nav-nested">' + sub.label + '</a>';
          });
          html += '</div>';
        } else {
          // Regular anchor link within section page
          var childHref = isOnSecPage ? child.anchor : (sectionUrl + child.anchor);
          html += '<a href="' + childHref + '" class="nav-link">' + child.label + '</a>';
        }
      });
    } else {
      html += '<span class="nav-coming-soon">Coming soon..</span>';
    }
    html += '</div>';

    html += '</div>';
  });

  container.innerHTML = html;

  // Nested submenu toggle (e.g. Pareto sub-charts)
  container.querySelectorAll('.nav-has-nested').forEach(function (link) {
    link.addEventListener('click', function () {
      var group = this.nextElementSibling;
      if (group && group.classList.contains('nav-nested-group')) {
        group.classList.toggle('open');
      }
    });
  });

  // Arrow toggle behavior
  container.querySelectorAll('.nav-arrow').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var section = this.closest('.nav-section');
      var submenu = section.querySelector('.nav-submenu');
      var isOpen = submenu.classList.contains('open');
      submenu.classList.toggle('open');
      this.innerHTML = isOpen ? '&#9656;' : '&#9662;';
    });
  });
})();

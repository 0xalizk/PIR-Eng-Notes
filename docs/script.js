/* ── Scroll-spy via IntersectionObserver ──────────────── */
(function () {
  var navLinks = document.querySelectorAll('.sidebar nav a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  if (sections.length === 0) return;

  var current = null;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var s = sections.find(function (s) { return s.el === entry.target; });
      if (s) s._visible = entry.isIntersecting;
    });
    for (var i = 0; i < sections.length; i++) {
      if (sections[i]._visible) {
        if (current !== sections[i].id) {
          current = sections[i].id;
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          sections[i].link.classList.add('active');
        }
        return;
      }
    }
  }, { rootMargin: '-10% 0px -80% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s.el); });
})();

/* ── Smooth scroll for nav links ─────────────────────── */
document.querySelectorAll('.sidebar nav a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    var target = document.getElementById(this.getAttribute('href').slice(1));
    if (target) {
      e.preventDefault();
      history.pushState(null, '', this.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelector('.sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('open');
    }
  });
});

/* ── Mobile hamburger ────────────────────────────────── */
(function () {
  var btn = document.querySelector('.hamburger');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');

  btn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', function () {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
})();

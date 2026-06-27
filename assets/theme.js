// Injects the dark/light toggle and persists the visitor's choice.
// The initial theme is set by a tiny inline script in each page's <head>
// (before paint) to avoid a flash; this only handles the button + clicks.
(function () {
  var root = document.documentElement;
  var current = function () { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; };
  // A saved choice only holds for the current time phase; once the phase flips
  // (day<->night) the inline <head> script clears it and the time-based default
  // resumes. We stamp the phase here so that clearing logic has something to
  // compare against.
  var phase = function () { var h = new Date().getHours(); return h >= 7 && h < 19 ? 'day' : 'night'; };
  var save = function (t) {
    try { localStorage.setItem('theme', t); localStorage.setItem('themePhase', phase()); } catch (e) {}
  };

  // Optional ?theme=dark|light override (shareable links + previews).
  try {
    var q = new URLSearchParams(location.search).get('theme');
    if (q === 'dark' || q === 'light') {
      root.setAttribute('data-theme', q);
      save(q);
    }
  } catch (e) {}

  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';

  var meta = document.querySelector('meta[name="theme-color"]');
  function paint() {
    var dark = current() === 'dark';
    btn.textContent = dark ? '☀ light' : '☽ dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('aria-pressed', String(!dark));
    if (meta) meta.setAttribute('content', dark ? '#0b0c0a' : '#ffffff');
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    save(next);
    paint();
  });

  paint();
  document.body.appendChild(btn);
})();

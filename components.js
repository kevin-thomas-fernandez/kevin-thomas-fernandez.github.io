/* Site components: theme toggle, flip word swap, test campaign circuit board,
   orbit card stack. Plain JS, no build step. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------------- theme toggle ---------------- */
  (function () {
    var root = document.documentElement;
    var btn = document.getElementById('theme-toggle');
    function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
    function refresh() {
      if (!btn) return;
      var dark = current() === 'dark';
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Light mode' : 'Dark mode';
    }
    if (btn) {
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
        refresh();
      });
    }
    refresh();
  })();

  /* ---------------- flip word swap ---------------- */
  function FlipSwap(host) {
    var w1 = host.getAttribute('data-word1') || '';
    var w2 = host.getAttribute('data-word2') || '';
    var duration = parseInt(host.getAttribute('data-duration') || '420', 10);
    var stagger = parseInt(host.getAttribute('data-stagger') || '36', 10);
    var interval = parseInt(host.getAttribute('data-interval') || '3800', 10);

    // Keep the shared ending still and flip only the part that differs.
    var k = 0;
    while (k < w1.length && k < w2.length && w1[w1.length - 1 - k] === w2[w2.length - 1 - k]) k++;
    while (k > 0 && w1[w1.length - k] !== ' ') k--;
    var a = w1.slice(0, w1.length - k), b = w2.slice(0, w2.length - k), tail = w1.slice(w1.length - k);
    var n = Math.max(a.length, b.length);

    host.textContent = '';
    host.classList.add('flip-swap');
    host.setAttribute('role', 'text');
    host.setAttribute('aria-label', w1 + ', also ' + w2);
    host.tabIndex = 0;

    function makeRun(str, cls) {
      var run = el('span', 'flip-run ' + cls);
      run.setAttribute('aria-hidden', 'true');
      var cs = [];
      for (var i = 0; i < str.length; i++) {
        var c = el('span', 'flip-char', str[i] === ' ' ? '\u00a0' : str[i]);
        c.style.transitionDuration = duration + 'ms';
        c.style.transitionDelay = (i * stagger) + 'ms';
        run.appendChild(c); cs.push(c);
      }
      return run;
    }
    var stack = el('span', 'flip-stack');
    var runA = makeRun(a, 'flip-a'), runB = makeRun(b, 'flip-b');
    stack.appendChild(runA); stack.appendChild(runB);
    host.appendChild(stack);
    if (tail) { var t = el('span', 'flip-tail', tail); t.setAttribute('aria-hidden', 'true'); host.appendChild(t); }
    function fit(v) {
      var w = (v ? runB : runA).scrollWidth;
      stack.style.width = w + 'px';
    }
    setTimeout(function () { fit(false); }, 0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(flipped); });
    window.addEventListener('resize', function () { fit(flipped); });

    var flipped = false, timer = null;
    function set(v) {
      flipped = v;
      host.classList.toggle('is-flipped', v);
      fit(v);
    }
    function schedule() {
      clearTimeout(timer);
      if (reduce || !interval) return;
      timer = setTimeout(function () { set(!flipped); schedule(); }, interval);
    }
    host.addEventListener('mouseenter', function () { set(!flipped); schedule(); });
    host.addEventListener('focus', function () { set(!flipped); schedule(); });
    host.addEventListener('click', function () { set(!flipped); schedule(); });
    host.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!flipped); schedule(); } });
    schedule();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-word1][data-word2]'), FlipSwap);

  /* ---------------- test campaign circuit board ---------------- */
  var LOOP = [
    { t: 'Test card', d: 'Test requests turned into repeatable field execution' },
    { t: 'Field execution', d: 'Aircraft selection, dependencies and status reporting' },
    { t: 'Fault injection', d: 'Simulated failures, response checked against criteria' },
    { t: 'Telemetry review', d: 'Avionics and flight control data against baseline' },
    { t: 'Go or no go', d: 'Aircraft health, weather, airspace and configuration' },
    { t: 'Engineering feedback', d: 'Deviations reported for rapid iteration' }
  ];
  function wrapText(s, max) {
    var words = s.split(' '), lines = [], cur = '';
    words.forEach(function (w) {
      if ((cur + ' ' + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) lines.push(cur);
    return lines;
  }
  function chamfer(pts, c) {
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      var l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1, l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
      var cc = Math.min(c, l1 / 2, l2 / 2);
      var a = [p1[0] - (p1[0] - p0[0]) / l1 * cc, p1[1] - (p1[1] - p0[1]) / l1 * cc];
      var b = [p1[0] + (p2[0] - p1[0]) / l2 * cc, p1[1] + (p2[1] - p1[1]) / l2 * cc];
      d += ' L' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' L' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    }
    var last = pts[pts.length - 1];
    return d + ' L' + last[0] + ' ' + last[1];
  }
  function buildLoop(host) {
    var vertical = window.matchMedia('(max-width: 720px)').matches;
    var W, H, nodes = [], pts = [], wrapAt;
    var n = LOOP.length;
    if (!vertical) {
      W = 960; H = 300; wrapAt = 26;
      for (var i = 0; i < n; i++) nodes.push({ x: 80 + i * 160, y: i % 2 === 0 ? 120 : 196, lx: 80 + i * 160, anchor: 'middle', ty: 40 });
      for (i = 0; i < n; i++) {
        pts.push([nodes[i].x, nodes[i].y]);
        if (i < n - 1) { var mx = (nodes[i].x + nodes[i + 1].x) / 2; pts.push([mx, nodes[i].y]); pts.push([mx, nodes[i + 1].y]); }
      }
      pts.push([nodes[n - 1].x, 24]); pts.push([nodes[0].x, 24]); pts.push([nodes[0].x, nodes[0].y]);
    } else {
      W = 340; H = 60 + n * 112; wrapAt = 30;
      for (i = 0; i < n; i++) nodes.push({ x: i % 2 === 0 ? 56 : 92, y: 50 + i * 112, lx: 132, anchor: 'start', ty: -4 });
      for (i = 0; i < n; i++) {
        pts.push([nodes[i].x, nodes[i].y]);
        if (i < n - 1) { var my = (nodes[i].y + nodes[i + 1].y) / 2; pts.push([nodes[i].x, my]); pts.push([nodes[i + 1].x, my]); }
      }
      pts.push([14, nodes[n - 1].y]); pts.push([14, nodes[0].y]); pts.push([nodes[0].x, nodes[0].y]);
    }
    // distance along the polyline to each node, for the glow timing
    var cum = [0], total = 0;
    for (i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(total); }
    var nodeAt = nodes.map(function (nd) {
      for (var j = 0; j < pts.length; j++) if (pts[j][0] === nd.x && pts[j][1] === nd.y) return cum[j] / total;
      return 0;
    });
    // hand drawn feel: a slightly wobbly pencil line, no glow, no animation
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; }
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var q = 1; q < pts.length; q++) {
      var p0 = pts[q - 1], p1 = pts[q];
      var mx2 = (p0[0] + p1[0]) / 2 + rnd() * 5, my2 = (p0[1] + p1[1]) / 2 + rnd() * 5;
      d += ' Q' + mx2.toFixed(1) + ' ' + my2.toFixed(1) + ' ' + p1[0] + ' ' + p1[1];
    }
    var uid = 'tl' + Math.floor(Math.random() * 1e6);
    var s = '<svg class="tl-svg" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">';
    s += '<defs><filter id="' + uid + '" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter></defs>';
    s += '<g filter="url(#' + uid + ')">';
    s += '<path class="tl-trace" d="' + d + '"/>';
    nodes.forEach(function (nd, i) {
      s += '<g class="tl-nodeg"><title>' + LOOP[i].t + ': ' + LOOP[i].d + '</title>';
      s += '<rect class="tl-node" x="' + (nd.x - 20) + '" y="' + (nd.y - 20) + '" width="40" height="40"/>';
      s += '<text class="tl-num" x="' + nd.x + '" y="' + (nd.y + 5) + '" text-anchor="middle">' + (i + 1) + '</text>';
      var ty = vertical ? nd.y - 6 : nd.y + 40;
      s += '<text class="tl-title" x="' + nd.lx + '" y="' + ty + '" text-anchor="' + nd.anchor + '">' + LOOP[i].t + '</text>';
      wrapText(LOOP[i].d, wrapAt).forEach(function (ln, li) {
        s += '<text class="tl-desc" x="' + nd.lx + '" y="' + (ty + 15 + li * 13) + '" text-anchor="' + nd.anchor + '">' + ln + '</text>';
      });
      s += '</g>';
    });
    s += '</g></svg>';
    host.innerHTML = s;
  }
  var loopHost = document.getElementById('test-loop');
  if (loopHost) {
    buildLoop(loopHost);
    var mq = window.matchMedia('(max-width: 720px)');
    var onMq = function () { buildLoop(loopHost); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ---------------- orbit card stack ---------------- */
  function OrbitStack(host) {
    var cards = Array.prototype.slice.call(host.querySelectorAll('.orbit-card'));
    if (!cards.length) return;
    var active = Math.min(cards.length - 1, parseInt(host.getAttribute('data-active') || '1', 10));
    var fanned = false;
    var baseSpread = parseInt(host.getAttribute('data-spread') || '168', 10);
    var lift = parseInt(host.getAttribute('data-lift') || '34', 10);

    function layout() {
      var cw = cards[0].offsetWidth || 260;
      var avail = host.clientWidth - cw;
      var spread = cards.length > 1 ? Math.max(40, Math.min(baseSpread, avail / ((cards.length - 1) / 1.0) / 1)) : 0;
      // keep the whole fan inside the container
      var maxSide = Math.max(active, cards.length - 1 - active) || 1;
      spread = Math.min(spread, (avail / 2) / maxSide);
      cards.forEach(function (c, i) {
        var dlt = i - active, ad = Math.abs(dlt);
        var x = fanned ? dlt * spread : dlt * 9;
        var y = fanned ? (i === active ? -lift : 0) : ad * 5;
        var sc = fanned ? 1 : 1 - ad * 0.035;
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
        c.style.zIndex = String(100 - ad * 2 + (i === active ? 5 : 0));
        c.classList.toggle('is-active', i === active);
        c.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
      host.classList.toggle('is-fanned', fanned);
    }
    function setActive(i) { active = Math.max(0, Math.min(cards.length - 1, i)); layout(); }
    function fan(v) { fanned = v; layout(); }

    host.addEventListener('mouseenter', function () { fan(true); });
    host.addEventListener('mouseleave', function () { fan(false); });
    host.addEventListener('focusin', function () { fan(true); });
    host.addEventListener('focusout', function (e) { if (!host.contains(e.relatedTarget)) fan(false); });
    cards.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { if (fanned) setActive(i); });
      c.addEventListener('focus', function () { setActive(i); });
      c.addEventListener('click', function (e) {
        if (!fanned) { fan(true); return; }
        if (i !== active) { setActive(i); e.preventDefault(); }
      });
    });
    host.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive(active + 1); cards[active].focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(active - 1); cards[active].focus(); }
      if (e.key === 'Escape') { fan(false); }
    });
    window.addEventListener('resize', layout);
    document.addEventListener('pagechange', layout);
    layout();
    host._orbitLayout = layout;
  }
  Array.prototype.forEach.call(document.querySelectorAll('.orbit-stack'), OrbitStack);
  // sections are hidden until opened, so lay out again when a page is shown
  var origShow = window.showPage;
  if (typeof origShow === 'function') {
    window.showPage = function (id) {
      origShow.apply(this, arguments);
      Array.prototype.forEach.call(document.querySelectorAll('.orbit-stack'), function (h) { if (h._orbitLayout) h._orbitLayout(); });
    };
  }

  /* ---------------- drone that hovers across every page ---------------- */
  if (!document.querySelector('.site-drone')) {
    var dr = document.createElement('div');
    dr.className = 'site-drone';
    dr.setAttribute('aria-hidden', 'true');
    var di = document.createElement('img');
    di.src = './assets/Pictures%204_29_2026/Drone.png';
    di.alt = '';
    dr.appendChild(di);
    document.body.appendChild(dr);
  }
})();

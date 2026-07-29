/* =========================================================
   FLIGHT TEST CAMPAIGN - interactive 3D landing experience
   Scroll = progressing through a flight test campaign:
   planning -> pre-flight -> takeoff -> envelope expansion
   -> data collection -> post-flight review.
   Three.js r128. Degrades gracefully if WebGL/CDN missing.
   ========================================================= */
(function () {
  'use strict';

  var wrap = document.getElementById('campaign');
  if (!wrap) return;
  if (!window.THREE) { wrap.style.display = 'none'; return; }

  var sticky = wrap.querySelector('.campaign-sticky');
  var canvas = document.getElementById('campaign-canvas');

  /* ---------- helpers ---------- */
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ss(a, b, x) { // smoothstep
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  function pad(n, w) { n = Math.floor(Math.abs(n)).toString(); while (n.length < w) n = '0' + n; return n; }

  var renderer, scene, camera;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { wrap.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.background = null; // transparent - the site's blueprint grid shows through
  scene.fog = new THREE.Fog(0xf6f8fa, 80, 260);

  camera = new THREE.PerspectiveCamera(46, 2, 0.1, 600);

  /* ---------- lights ---------- */
  scene.add(new THREE.HemisphereLight(0xf4f8fc, 0x9aa7b4, 0.95));
  var sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(60, 120, 40);
  scene.add(sun);

  /* ---------- materials ---------- */
  var M = {
    ground: new THREE.MeshLambertMaterial({ color: 0xe4eaf0 }),
    runway: new THREE.MeshLambertMaterial({ color: 0x707a86 }),
    marking: new THREE.MeshLambertMaterial({ color: 0xf2f5f8 }),
    pad: new THREE.MeshLambertMaterial({ color: 0x8892a0 }),
    hangar: new THREE.MeshLambertMaterial({ color: 0xd4dce4 }),
    hangarRoof: new THREE.MeshLambertMaterial({ color: 0xb9c3cd }),
    accent: new THREE.MeshLambertMaterial({ color: 0xff4f00 }),
    body: new THREE.MeshLambertMaterial({ color: 0xf4f6f8 }),
    bodyDark: new THREE.MeshLambertMaterial({ color: 0x2a323c }),
    prop: new THREE.MeshLambertMaterial({ color: 0x1c232b, transparent: true }),
    propDisk: new THREE.MeshLambertMaterial({ color: 0x1c232b, transparent: true, opacity: 0.16, depthWrite: false })
  };

  /* ---------- world ---------- */
  // No 3D ground or grid: the world sits directly on the site's
  // blueprint-grid background so the block reads as part of the page.

  var runway = new THREE.Mesh(new THREE.PlaneGeometry(260, 13), M.runway);
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(0, 0.02, 0);
  scene.add(runway);
  for (var d = -120; d <= 120; d += 12) {
    var dash = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.5), M.marking);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(d, 0.04, 0);
    scene.add(dash);
  }
  // landing pad (post-flight)
  var padMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), M.pad);
  padMesh.rotation.x = -Math.PI / 2;
  padMesh.position.set(100, 0.03, 0);
  scene.add(padMesh);
  var padRing = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.4, 40), M.accent);
  padRing.rotation.x = -Math.PI / 2;
  padRing.position.set(100, 0.05, 0);
  scene.add(padRing);

  // hangar near apron
  var hangar = new THREE.Group();
  var shell = new THREE.Mesh(new THREE.BoxGeometry(30, 11, 20), M.hangar);
  shell.position.y = 5.5;
  hangar.add(shell);
  var roof = new THREE.Mesh(new THREE.BoxGeometry(31.5, 1.1, 21.5), M.hangarRoof);
  roof.position.y = 11.3;
  hangar.add(roof);
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(30.2, 1.4, 0.35), M.accent);
  stripe.position.set(0, 8.4, 10.15);
  hangar.add(stripe);
  hangar.position.set(-78, 0, -26);
  scene.add(hangar);

  // test corridor gates
  var gates = [];
  function makeGate(x, y, z, ry) {
    var g = new THREE.Group();
    var geo = new THREE.EdgesGeometry(new THREE.PlaneGeometry(16, 10));
    var line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xff4f00, transparent: true, opacity: 0.55 }));
    g.add(line);
    var tick = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.1), M.accent);
    tick.position.set(0, 5.6, 0);
    g.add(tick);
    g.position.set(x, y, z);
    g.rotation.y = ry;
    scene.add(g);
    gates.push(g);
  }
  makeGate(-6, 20, 4, Math.PI / 2 + 0.15);
  makeGate(14, 23, 12, Math.PI / 2 - 0.2);
  makeGate(32, 26, 2, Math.PI / 2 + 0.25);
  makeGate(48, 24, -10, Math.PI / 2 - 0.1);
  makeGate(62, 22, -4, Math.PI / 2 + 0.1);

  // clouds
  function cloudTexture() {
    var cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    var ctx = cv.getContext('2d');
    var g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(cv);
  }
  var cloudMat = new THREE.SpriteMaterial({ map: cloudTexture(), transparent: true, opacity: 0.85, depthWrite: false });
  var clouds = [];
  for (var ci = 0; ci < 16; ci++) {
    var s = new THREE.Sprite(cloudMat.clone());
    var sc = 26 + Math.random() * 42;
    s.scale.set(sc, sc * 0.42, 1);
    s.position.set(-140 + Math.random() * 300, 26 + Math.random() * 22, -70 + Math.random() * 140);
    s.material.opacity = 0.35 + Math.random() * 0.35;
    s.userData.v = 0.015 + Math.random() * 0.03;
    scene.add(s);
    clouds.push(s);
  }

  /* ---------- aircraft (stylized lift+cruise test article) ---------- */
  var ac = new THREE.Group();
  var props = [];

  function buildAircraft() {
    var fus = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4.6, 14), M.body);
    body.rotation.z = Math.PI / 2;
    fus.add(body);
    var nose = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), M.body);
    nose.position.x = 2.3; fus.add(nose);
    var tailCone = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), M.body);
    tailCone.position.x = -2.3; fus.add(tailCone);
    var canopy = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), M.bodyDark);
    canopy.scale.set(1.5, 0.7, 0.9);
    canopy.position.set(1.15, 0.42, 0); fus.add(canopy);
    ac.add(fus);

    var wing = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.14, 9.6), M.body);
    wing.position.set(0.2, 0.32, 0); ac.add(wing);
    var wtipL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.5), M.accent);
    wtipL.position.set(0.2, 0.36, 4.8); ac.add(wtipL);
    var wtipR = wtipL.clone(); wtipR.position.z = -4.8; ac.add(wtipR);

    var hstab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 3.4), M.body);
    hstab.position.set(-2.7, 0.75, 0); ac.add(hstab);
    var fin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.35, 0.12), M.body);
    fin.position.set(-2.7, 0.45, 0); ac.add(fin);

    // twin booms with lift rotors
    [-2.6, 2.6].forEach(function (bz) {
      var boom = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 5.4, 8), M.bodyDark);
      boom.rotation.z = Math.PI / 2;
      boom.position.set(-0.2, 0.32, bz);
      ac.add(boom);
      [-2.2, 2.2].forEach(function (bx) {
        var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 8), M.bodyDark);
        hub.position.set(bx - 0.2, 0.55, bz);
        ac.add(hub);
        var blades = new THREE.Group();
        var b1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.16), M.prop);
        var b2 = b1.clone(); b2.rotation.y = Math.PI / 2;
        blades.add(b1); blades.add(b2);
        blades.position.set(bx - 0.2, 0.72, bz);
        var disk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.02, 22), M.propDisk);
        disk.position.copy(blades.position);
        ac.add(disk);
        ac.add(blades);
        props.push({ spin: blades, disk: disk, axis: 'y' });
      });
    });

    // pusher prop
    var ph = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), M.bodyDark);
    ph.rotation.z = Math.PI / 2;
    ph.position.set(-2.95, 0, 0); ac.add(ph);
    var pblades = new THREE.Group();
    var pb1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.9, 0.15), M.prop);
    var pb2 = pb1.clone(); pb2.rotation.x = Math.PI / 2;
    pblades.add(pb1); pblades.add(pb2);
    pblades.position.set(-3.2, 0, 0);
    var pdisk = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.02, 22), M.propDisk);
    pdisk.rotation.z = Math.PI / 2;
    pdisk.position.copy(pblades.position);
    ac.add(pdisk); ac.add(pblades);
    props.push({ spin: pblades, disk: pdisk, axis: 'x' });

    // skids
    [-0.5, 0.5].forEach(function (sz) {
      var skid = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.09, 0.12), M.bodyDark);
      skid.position.set(0.3, -0.85, sz * 1.4);
      ac.add(skid);
      var legF = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), M.bodyDark);
      legF.position.set(1.1, -0.5, sz * 1.4); ac.add(legF);
      var legB = legF.clone(); legB.position.x = -0.6; ac.add(legB);
    });

    ac.scale.setScalar(1.35);
    scene.add(ac);
  }
  buildAircraft();

  /* ---------- flight trail ---------- */
  var TRAIL_N = 140;
  var trailPos = new Float32Array(TRAIL_N * 3);
  var trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  var trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xff4f00, transparent: true, opacity: 0.5 }));
  trail.frustumCulled = false;
  scene.add(trail);
  var trailPts = [];

  /* ---------- aircraft state along the campaign ---------- */
  var GY = 1.15; // gear height
  function acState(p) {
    var st = { x: -70, y: GY, z: 0, yaw: 0, roll: 0, pitch: 0, prop: 0 };
    st.prop = ss(0.28, 0.34, p);
    if (p < 0.34) return st;
    // vertical lift
    if (p < 0.42) {
      var t = ss(0.34, 0.42, p);
      st.y = lerp(GY, 11, t);
      st.prop = 1;
      return st;
    }
    // transition + climb-out
    if (p < 0.52) {
      var t2 = (p - 0.42) / 0.10;
      st.x = lerp(-70, -14, t2 * t2 * (3 - 2 * t2));
      st.y = lerp(11, 21, ss(0, 1, t2));
      st.pitch = -0.10 * ss(0.1, 0.6, t2) * (1 - ss(0.75, 1, t2));
      st.prop = 1;
      return st;
    }
    // envelope expansion - banked corridor run
    if (p < 0.70) {
      var t3 = (p - 0.52) / 0.18;
      st.x = lerp(-14, 60, t3);
      st.z = 13 * Math.sin(t3 * Math.PI * 1.6);
      st.y = 21 + 4.5 * Math.sin(t3 * Math.PI * 2.2);
      var dz = 13 * Math.cos(t3 * Math.PI * 1.6) * Math.PI * 1.6;
      var dx = 74;
      st.yaw = Math.atan2(-dz, dx) * -1;
      st.roll = clamp(-dz * 0.011, -0.5, 0.5);
      st.prop = 1;
      return st;
    }
    // data collection - steady instrumented run
    if (p < 0.86) {
      var t4 = (p - 0.70) / 0.16;
      st.x = lerp(60, 88, t4);
      st.z = 13 * Math.sin(Math.PI * 1.6) * (1 - t4);
      st.y = lerp(21 + 4.5 * Math.sin(Math.PI * 2.2), 25, ss(0, 0.5, t4));
      st.roll = lerp(clamp(-13 * Math.cos(Math.PI * 1.6) * Math.PI * 1.6 * 0.011, -0.5, 0.5), 0, ss(0, 0.4, t4));
      st.prop = 1;
      return st;
    }
    // approach + landing on pad
    if (p < 0.95) {
      var t5 = (p - 0.86) / 0.09;
      st.x = lerp(88, 100, ss(0, 1, t5));
      st.y = lerp(25, GY, t5 * t5);
      st.prop = 1;
      return st;
    }
    st.x = 100; st.y = GY;
    st.prop = 1 - ss(0.95, 1.0, p);
    return st;
  }

  /* ---------- camera choreography ---------- */
  var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
  function camState(p, acs) {
    var pos = new THREE.Vector3(), tgt = new THREE.Vector3();
    var acp = V(acs.x, acs.y, acs.z);
    // absolute keys (planning / pre-flight)
    var k = [
      { p: 0.00, pos: V(-10, 165, 55), tgt: V(5, 0, 0) },
      { p: 0.16, pos: V(-96, 8, 27), tgt: V(-70, 2.5, 0) },
      { p: 0.34, pos: V(-85, 3.6, 13), tgt: V(-70, 2.8, 0) }
    ];
    function absAt(pp) {
      for (var i = 0; i < k.length - 1; i++) {
        if (pp <= k[i + 1].p) {
          var t = ss(k[i].p, k[i + 1].p, pp);
          return {
            pos: k[i].pos.clone().lerp(k[i + 1].pos, t),
            tgt: k[i].tgt.clone().lerp(k[i + 1].tgt, t)
          };
        }
      }
      return { pos: k[2].pos.clone(), tgt: k[2].tgt.clone() };
    }
    // relative offsets during flight
    var ok = [
      { p: 0.34, off: V(-17, 5, 13) },
      { p: 0.52, off: V(-19, 6, -15) },
      { p: 0.70, off: V(19, 8, 17) },
      { p: 0.86, off: V(24, 7, -13) },
      { p: 0.95, off: V(16, 3.2, 19) },
      { p: 1.00, off: V(19, 6.5, 26) }
    ];
    function relAt(pp) {
      var off = ok[ok.length - 1].off.clone();
      for (var i = 0; i < ok.length - 1; i++) {
        if (pp <= ok[i + 1].p) {
          off = ok[i].off.clone().lerp(ok[i + 1].off, ss(ok[i].p, ok[i + 1].p, pp));
          break;
        }
      }
      return { pos: acp.clone().add(off), tgt: acp.clone().add(V(3, 0.5, 0)) };
    }
    if (p <= 0.32) { var a = absAt(p); pos.copy(a.pos); tgt.copy(a.tgt); }
    else if (p >= 0.38) { var r = relAt(p); pos.copy(r.pos); tgt.copy(r.tgt); }
    else {
      var b = ss(0.32, 0.38, p);
      var a2 = absAt(p), r2 = relAt(p);
      pos.copy(a2.pos).lerp(r2.pos, b);
      tgt.copy(a2.tgt).lerp(r2.tgt, b);
    }
    return { pos: pos, tgt: tgt };
  }

  /* ---------- phases / HUD ---------- */
  var PHASES = [
    { at: 0.00, name: 'Mission Planning', copy: 'Objectives defined. Test cards written. Corridors cleared. Every campaign starts as questions on paper - mine started as a kid in Bengaluru who wanted to build machines.' },
    { at: 0.16, name: 'Pre-Flight', copy: 'Aircraft on the apron, systems green, range hot. Mechanical engineering taught me how machines are built. Aerospace taught me why they fly.' },
    { at: 0.34, name: 'Takeoff', copy: 'Rotors up. Wheels light. The envelope opens the moment the skids leave the ground - this is the part I fell in love with.' },
    { at: 0.52, name: 'Envelope Expansion', copy: 'Through the corridor gates, one test point at a time. Speed, bank, load - I work at the edges, from supercooled droplets to crash-risk models.' },
    { at: 0.70, name: 'Data Collection', copy: 'Every second streams home. Engineering is turning telemetry into decisions - data first, opinions second.' },
    { at: 0.86, name: 'Post-Flight Review', copy: 'Skids down. Data reduced, findings logged, next card queued.' }
  ];
  var elPhaseNum = document.getElementById('hud-phase-num');
  var elPhaseName = document.getElementById('hud-phase-name');
  var elPhaseCopy = document.getElementById('hud-phase-copy');
  var elTele = document.getElementById('hud-telemetry');
  var elFill = document.getElementById('hud-timeline-fill');
  var elClock = document.getElementById('hud-clock');
  var elCue = document.getElementById('hud-scrollcue');
  var elStory = document.getElementById('campaign-story');
  var phaseEl = wrap.querySelector('.hud-phase');
  var curPhase = -1;

  function phaseIndex(p) {
    var idx = 0;
    for (var i = 0; i < PHASES.length; i++) if (p >= PHASES[i].at) idx = i;
    return idx;
  }

  function updateHUD(p, acs, dt) {
    var pi = phaseIndex(p);
    if (pi !== curPhase) {
      curPhase = pi;
      elPhaseNum.textContent = 'PHASE ' + pad(pi + 1, 2) + ' / 06';
      elPhaseName.textContent = PHASES[pi].name;
      elPhaseCopy.textContent = PHASES[pi].copy;
      phaseEl.classList.remove('phase-in');
      void phaseEl.offsetWidth; // restart animation
      phaseEl.classList.add('phase-in');
    }
    // final beat: the engineer steps forward
    var sv = ss(0.90, 0.965, p);
    if (elStory) {
      elStory.style.opacity = sv.toFixed(3);
      if (sv > 0.55) elStory.classList.add('story-live');
      else elStory.classList.remove('story-live');
    }
    phaseEl.style.opacity = (1 - sv).toFixed(3);
    elTele.style.opacity = (1 - sv).toFixed(3);

    var alt = Math.max(0, (acs.y - GY) * 14.2);
    var spd = 0;
    if (p > 0.42) spd = lerp(0, 62, ss(0.42, 0.55, p));
    if (p > 0.70) spd = lerp(62, 48, ss(0.70, 0.80, p));
    if (p > 0.86) spd = lerp(48, 0, ss(0.86, 0.97, p));
    var noise = Math.sin(perf * 2.1) * 0.4;
    var rows = [
      ['ALT', (alt + (alt > 1 ? noise : 0)).toFixed(1) + ' M AGL'],
      ['GS', Math.max(0, spd + (spd > 1 ? noise : 0)).toFixed(1) + ' KT'],
      ['HDG', pad((90 + acs.yaw * 57.3 + 360) % 360, 3) + '°'],
      ['ESC', acs.prop > 0.05 ? (92 + noise * 3).toFixed(0) + ' %' : 'IDLE'],
      ['BAT', (100 - p * 34).toFixed(0) + ' %'],
      ['LINK', p > 0.05 ? 'LOCK 400HZ' : 'STANDBY'],
      ['GPS', '38°39′N 121°46′W']
    ];
    var html = '';
    for (var i = 0; i < rows.length; i++) {
      html += '<div class="tl-row"><span>' + rows[i][0] + '</span><span>' + rows[i][1] + '</span></div>';
    }
    elTele.innerHTML = html;
    elFill.style.width = (p * 100).toFixed(2) + '%';
    var secs = p * 48 * 60;
    elClock.textContent = 'T+' + pad(secs / 3600, 2) + ':' + pad((secs / 60) % 60, 2) + ':' + pad(secs % 60, 2);
    elCue.style.opacity = p < 0.02 ? 1 : 0;
  }

  /* ---------- scroll ---------- */
  var progress = 0;
  function readScroll() {
    var rect = wrap.getBoundingClientRect();
    var total = wrap.offsetHeight - sticky.offsetHeight;
    progress = clamp(-rect.top / Math.max(1, total), 0, 1);
  }
  window.addEventListener('scroll', readScroll, { passive: true });

  /* ---------- resize ---------- */
  function resize() {
    var w = sticky.clientWidth, h = sticky.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  /* ---------- loop ---------- */
  var perf = 0, last = 0, propAngle = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!sticky.offsetParent) return; // section hidden (other page active)
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now; perf = now / 1000;
    if (canvas.width !== sticky.clientWidth * renderer.getPixelRatio()) resize();
    readScroll();

    var p = progress;
    var acs = acState(p);
    ac.position.set(acs.x, acs.y, acs.z);
    ac.rotation.set(0, acs.yaw, 0);
    ac.rotateZ(acs.pitch);
    ac.rotateX(acs.roll);

    propAngle += dt * (4 + 55 * acs.prop);
    for (var i = 0; i < props.length; i++) {
      if (props[i].axis === 'y') props[i].spin.rotation.y = propAngle * (i % 2 ? 1 : -1);
      else props[i].spin.rotation.x = propAngle;
      props[i].disk.material.opacity = 0.16 * ss(0.5, 1, acs.prop);
      props[i].spin.children.forEach(function (b) { b.material.opacity = lerp(1, 0.35, ss(0.5, 1, acs.prop)); });
    }

    // trail
    if (acs.y > GY + 1.5) {
      trailPts.push([acs.x - 2.2, acs.y, acs.z]);
      if (trailPts.length > TRAIL_N) trailPts.shift();
    } else if (p < 0.3) {
      trailPts.length = 0;
    }
    for (var t = 0; t < TRAIL_N; t++) {
      var src = trailPts[Math.min(t, Math.max(0, trailPts.length - 1))] || [acs.x, acs.y, acs.z];
      trailPos[t * 3] = src[0]; trailPos[t * 3 + 1] = src[1]; trailPos[t * 3 + 2] = src[2];
    }
    trailGeo.attributes.position.needsUpdate = true;
    trail.material.opacity = 0.5 * ss(0.36, 0.45, p) * (1 - ss(0.9, 0.98, p));

    // clouds drift
    for (var c = 0; c < clouds.length; c++) {
      clouds[c].position.x += clouds[c].userData.v;
      if (clouds[c].position.x > 170) clouds[c].position.x = -160;
    }
    // gates glow near aircraft
    for (var gi = 0; gi < gates.length; gi++) {
      var dist = Math.abs(gates[gi].position.x - acs.x);
      gates[gi].children[0].material.opacity = clamp(0.75 - dist * 0.012, 0.15, 0.75);
    }

    var cs = camState(p, acs);
    camera.position.copy(cs.pos);
    camera.lookAt(cs.tgt);

    updateHUD(p, acs, dt);
    renderer.render(scene, camera);
  }
  resize();
  readScroll();
  requestAnimationFrame(frame);
})();

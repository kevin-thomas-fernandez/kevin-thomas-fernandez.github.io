/* Photo lists (Highlights and the Zipline case study).
   Everyone sees the photos. The edit tools only appear when the site is run
   locally with start-site.bat, and they save into your own folder. */
(function () {
  'use strict';

  var api = { available: false };
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var probe = (isLocal && location.protocol.indexOf('http') === 0)
    ? fetch('/api/ping', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })
    : Promise.resolve(null);
  api.ready = probe.then(function (j) {
    api.available = !!(j && j.ok);
    document.documentElement.classList.toggle('can-edit', api.available);
    return api.available;
  });

  function post(url, body, headers) {
    return fetch(url, { method: 'POST', headers: headers || { 'Content-Type': 'application/json' }, body: body })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  api.save = function (name, items) { return post('/api/save?name=' + encodeURIComponent(name), JSON.stringify(items)); };
  api.upload = function (folder, file) {
    return post('/api/upload?folder=' + encodeURIComponent(folder), file,
      { 'X-Filename': encodeURIComponent(file.name), 'Content-Type': 'application/octet-stream' });
  };
  window.PhotoEditor = api;

  function isVideo(src) { return /\.(mp4|webm|mov|m4v)$/i.test(src); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }


  /* Photos that sit next to the bullet they belong to.
     slots[k] is the element placed after bullet k. Each photo has an "at" number
     (0 based bullet index). In edit mode a photo can be moved to another bullet. */
  api.mountInline = function (toolbarHost, slots, opts) {
    var items = (window[opts.global] || []).map(function (x) { return Object.assign({}, x); });
    var last = slots.length - 1;
    var editing = false;
    function slotOf(it) { var a = typeof it.at === 'number' ? it.at : last; return Math.max(0, Math.min(last, a)); }

    var bar = el('div', 'pe-toolbar'); bar.hidden = true;
    var toggle = el('button', 'pe-btn', 'Edit photos'); toggle.type = 'button';
    var add = el('label', 'pe-btn pe-add', 'Add photos');
    var file = el('input'); file.type = 'file'; file.multiple = true; file.hidden = true;
    file.accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
    add.appendChild(file);
    var status = el('span', 'pe-status');
    var note = el('span', 'pe-note', 'Each photo can sit under any bullet. Pick the bullet number under the photo.');
    bar.appendChild(toggle); bar.appendChild(add); bar.appendChild(status); bar.appendChild(note);
    toolbarHost.appendChild(bar);
    function say(m, bad) { status.textContent = m; status.className = 'pe-status' + (bad ? ' bad' : ''); }
    function persist() {
      say('Saving...');
      return api.save(opts.name, items).then(function () {
        window[opts.global] = items.map(function (x) { return Object.assign({}, x); });
        say('Saved to your folder');
      }).catch(function () { say('Could not save. Is start-site.bat still running?', true); });
    }

    function render() {
      slots.forEach(function (holder, k) {
        holder.innerHTML = '';
        var mine = items.filter(function (it) { return slotOf(it) === k; });
        holder.style.display = mine.length ? '' : 'none';
        if (!mine.length) return;
        var body = el('div', 'details-gallery' + (mine.length === 1 ? ' single' : ''));
        body.classList.toggle('pe-editing', editing);
        mine.forEach(function (it) {
          var fig = el('figure');
          var media;
          if (it.type === 'video' || isVideo(it.src)) {
            media = el('video'); media.controls = true; media.preload = 'metadata'; media.muted = true; media.playsInline = true; media.src = it.src;
          } else {
            media = el('img'); media.src = it.src; media.alt = it.caption; media.loading = 'lazy';
            media.addEventListener('click', function () { if (!editing && window.openImageModal) window.openImageModal(it.src); });
          }
          var cap = el('figcaption', '', it.caption);
          if (editing) {
            cap.contentEditable = 'true';
            cap.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); cap.blur(); } });
            cap.addEventListener('blur', function () {
              var v = cap.textContent.replace(/\s+/g, ' ').trim();
              if (v !== it.caption) { it.caption = v; persist(); }
            });
          }
          fig.appendChild(media); fig.appendChild(cap);
          if (editing) {
            var ctl = el('div', 'pe-ctl');
            var lab = el('span', 'pe-note', 'Under bullet ');
            var sel = el('select', 'pe-mini');
            for (var b = 0; b <= last; b++) { var o = el('option', '', String(b + 1)); o.value = b; if (b === slotOf(it)) o.selected = true; sel.appendChild(o); }
            sel.addEventListener('change', function () { it.at = parseInt(sel.value, 10); render(); persist(); });
            var rm = el('button', 'pe-mini pe-danger', 'Remove'); rm.type = 'button';
            rm.addEventListener('click', function () { items.splice(items.indexOf(it), 1); render(); persist(); });
            ctl.appendChild(lab); ctl.appendChild(sel); ctl.appendChild(rm);
            fig.appendChild(ctl);
          }
          body.appendChild(fig);
        });
        holder.appendChild(body);
      });
    }
    toggle.addEventListener('click', function () {
      editing = !editing;
      toggle.textContent = editing ? 'Done' : 'Edit photos';
      add.style.display = editing ? '' : 'none';
      note.style.display = editing ? '' : 'none';
      say(editing ? 'Click a caption to edit it' : '');
      render();
    });
    file.addEventListener('change', function () {
      var list = Array.prototype.slice.call(file.files); file.value = '';
      var chain = Promise.resolve();
      list.forEach(function (f) {
        chain = chain.then(function () {
          say('Uploading ' + f.name + '...');
          return api.upload(opts.name, f).then(function (res) {
            var entry = { src: res.src, caption: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), at: last };
            if (isVideo(f.name)) entry.type = 'video';
            items.push(entry); render();
          });
        });
      });
      chain.then(persist).catch(function (e) { say('Upload failed: ' + (e && e.message ? e.message : 'error'), true); });
    });
    add.style.display = 'none'; note.style.display = 'none';
    render();
    api.ready.then(function (ok) { if (ok) bar.hidden = false; });
  };

  /* opts: { name, global, variant: 'grid' | 'gallery', addAt: 'start' | 'end' } */
  api.mount = function (host, opts) {
    var items = (window[opts.global] || []).map(function (x) { return Object.assign({}, x); });
    var editing = false;
    var isGrid = opts.variant === 'grid';

    var wrap = host;
    var body;
    if (isGrid) {
      body = host; // host already carries the grid class
    } else {
      body = el('div', 'details-gallery');
      host.appendChild(body);
    }

    var bar = el('div', 'pe-toolbar');
    bar.hidden = true;
    var toggle = el('button', 'pe-btn', 'Edit photos');
    toggle.type = 'button';
    var add = el('label', 'pe-btn pe-add', 'Add photos');
    var file = el('input');
    file.type = 'file'; file.multiple = true; file.hidden = true;
    file.accept = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
    add.appendChild(file);
    var status = el('span', 'pe-status');
    var note = el('span', 'pe-note', 'Removing a photo hides it from the site. The file stays in your assets folder.');
    bar.appendChild(toggle); bar.appendChild(add); bar.appendChild(status); bar.appendChild(note);
    if (isGrid) host.parentNode.insertBefore(bar, host); else host.insertBefore(bar, body);

    function say(msg, bad) { status.textContent = msg; status.className = 'pe-status' + (bad ? ' bad' : ''); }

    function persist() {
      say('Saving...');
      return api.save(opts.name, items).then(function () {
        window[opts.global] = items.map(function (x) { return Object.assign({}, x); });
        say('Saved to your folder');
      }).catch(function () { say('Could not save. Is start-site.bat still running?', true); });
    }

    function move(i, d) {
      var j = i + d;
      if (j < 0 || j >= items.length) return;
      var t = items[i]; items[i] = items[j]; items[j] = t;
      render(); persist();
    }

    function render() {
      body.innerHTML = '';
      body.classList.toggle('pe-editing', editing);
      items.forEach(function (it, i) {
        var video = it.type === 'video' || isVideo(it.src);
        var cell = el(isGrid ? 'div' : 'figure', isGrid ? 'highlights-grid-item' : '');
        var media;
        if (video) {
          media = el('video');
          media.controls = true; media.preload = 'metadata'; media.muted = true; media.playsInline = true;
          media.title = it.caption; media.src = it.src;
        } else {
          media = el('img');
          media.src = it.src; media.alt = it.caption; media.title = it.caption;
          if (!isGrid) media.loading = 'lazy';
          media.addEventListener('click', function () { if (!editing && window.openImageModal) window.openImageModal(it.src); });
        }
        var cap = el(isGrid ? 'p' : 'figcaption', isGrid ? 'highlights-caption' : '', it.caption);
        if (editing) {
          cap.contentEditable = 'true';
          cap.spellcheck = true;
          cap.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); cap.blur(); } });
          cap.addEventListener('blur', function () {
            var v = cap.textContent.replace(/\s+/g, ' ').trim();
            if (v !== it.caption) { it.caption = v; persist(); }
          });
        }
        cell.appendChild(media); cell.appendChild(cap);
        if (editing) {
          var ctl = el('div', 'pe-ctl');
          [['Up', -1], ['Down', 1]].forEach(function (a) {
            var b = el('button', 'pe-mini', a[0]); b.type = 'button';
            b.addEventListener('click', function () { move(i, a[1]); });
            ctl.appendChild(b);
          });
          var rm = el('button', 'pe-mini pe-danger', 'Remove'); rm.type = 'button';
          rm.addEventListener('click', function () { items.splice(i, 1); render(); persist(); });
          ctl.appendChild(rm);
          cell.appendChild(ctl);
        }
        body.appendChild(cell);
      });
      if (!items.length) body.appendChild(el('p', 'pe-empty', editing ? 'No photos yet. Use Add photos.' : ''));
    }

    toggle.addEventListener('click', function () {
      editing = !editing;
      toggle.textContent = editing ? 'Done' : 'Edit photos';
      add.style.display = editing ? '' : 'none';
      note.style.display = editing ? '' : 'none';
      say(editing ? 'Click a caption to edit it' : '');
      render();
    });

    file.addEventListener('change', function () {
      var list = Array.prototype.slice.call(file.files);
      file.value = '';
      var chain = Promise.resolve();
      list.forEach(function (f) {
        chain = chain.then(function () {
          say('Uploading ' + f.name + '...');
          return api.upload(opts.name, f).then(function (res) {
            var entry = { src: res.src, caption: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') };
            if (isVideo(f.name)) entry.type = 'video';
            if (opts.addAt === 'end') items.push(entry); else items.unshift(entry);
            render();
          });
        });
      });
      chain.then(persist).catch(function (e) { say('Upload failed: ' + (e && e.message ? e.message : 'error'), true); });
    });

    add.style.display = 'none';
    note.style.display = 'none';
    render();
    api.ready.then(function (ok) { if (ok) bar.hidden = false; });
    return { render: render };
  };
})();

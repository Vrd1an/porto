/*
 * experience.js - "Edukasi & Pengalaman": pinned text + 3D vertical photo carousel.
 *
 * While you scroll through this section the text panel (left) stays pinned and only the photos (right)
 * move: a vertical 3D carousel, the current photo in front and the others tilted back above and below.
 * When the last photo has passed, the pinned stage is released and the page scrolls on as usual.
 * The page's own scroll position drives everything (no scroll hijacking); the motion is smoothed.
 *   - the text panel follows the photo in front (category, year, title, subtitle, text, "Foto 2/3");
 *   - photos are shown whole (never cropped, portrait or landscape) in front of a blurred copy of themselves;
 *   - an experience without photos gets one coloured title card, so the carousel always works
 *     (remove such an experience from STAGES if you do not want that card);
 *   - drag the carousel with the mouse (it eases out after release and settles on a photo); click a photo:
 *     large view with arrows, thumbnails, keyboard; click a side photo: jump to it;
 *   - the pills under the text jump to an experience. "Reduce motion" users get a plain list instead.
 *
 * HOW TO EDIT: only the STAGES list below.
 *   category - small coloured tag (Edukasi, Organisasi, Kegiatan, KKN, Magang, Proyek; any text works)
 *   year, title, subtitle, text - what the panel says
 *   photos   - [] for none; otherwise paths of files in assets/timeline/, e.g.
 *                photos: ['assets/timeline/kkn-1.jpg', 'assets/timeline/kkn-2.jpg']
 *              or with captions: photos: [{ src: 'assets/timeline/kkn-1.jpg', caption: 'Penyerahan alat' }]
 *   Add or remove objects freely: the length of the scroll follows the number of photos.
 */
(function () {
  'use strict';

  var host = document.getElementById('jr');
  if (!host) return;

  /* ============================== EDIT HERE ============================== */
  var STAGES = [
    {
      category: 'Kegiatan',
      year: '2023',
      title: 'Panitia Sosialisasi Fakultas',
      subtitle: 'Pembimbing mahasiswa baru',
      text: 'Menjadi panitia sosialisasi fakultas sekaligus pembimbing bagi mahasiswa baru: mendampingi mereka mengenal kampus dan lingkungan fakultas.',
      photos: ['assets/timeline/2023-sosialisasi-1.jpg', 'assets/timeline/2023-sosialisasi-2.jpg'],
    },
    {
      category: 'Proyek',
      year: '2025',
      title: 'Demo Aplikasi LMS',
      subtitle: 'SMA Negeri 2 Cianjur',
      text: 'Mendemonstrasikan aplikasi LMS untuk SMA Negeri 2 Cianjur langsung di sekolah. Aplikasinya juga ada di bagian Portofolio Proyek.',
      photos: ['assets/timeline/2025-demo-lms-1.jpg', 'assets/timeline/2025-demo-lms-2.jpg'],
    },
    {
      category: 'Organisasi',
      year: '2026',
      title: 'Volunteer KSR PMI Unit Unsur',
      subtitle: 'Palang Merah Indonesia',
      text: 'Menjadi volunteer di organisasi KSR PMI Unit Unsur.',
      photos: ['assets/timeline/2026-ksr-pmi-1.jpg', 'assets/timeline/2026-ksr-pmi-2.jpg'],
    },
    {
      category: 'Edukasi',
      year: '2026',
      title: 'Skripsi',
      subtitle: 'S1 Teknik Informatika • Universitas Suryakancana',
      text: 'Menyelesaikan skripsi: sistem informasi geografis berbasis web untuk klasifikasi kelayakan lokasi TPS di Kabupaten Cianjur dengan algoritma C4.5, dibangun bersama Dinas Lingkungan Hidup Kabupaten Cianjur.',
      photos: ['assets/timeline/2026-skripsi-1.jpg', 'assets/timeline/2026-skripsi-2.jpg'],
    },
  ];
  var HUES = { Edukasi: '#6366f1', Organisasi: '#10b981', Kegiatan: '#f59e0b', KKN: '#f97316', Magang: '#ec4899', Proyek: '#06b6d4' };
  /* ======================================================================= */

  var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var norm = function (p) { return typeof p === 'string' ? { src: p, caption: '' } : p; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var hueOf = function (s) { return HUES[s.category] || '#8b5cf6'; };

  /* ------------------------------------------------------------ slides: one per photo (or one title card) */
  var slides = [], firstSlide = [];
  STAGES.forEach(function (s, e) {
    var list = (s.photos || []).map(norm);
    firstSlide[e] = slides.length;
    if (!list.length) slides.push({ e: e, card: true });
    else list.forEach(function (p, j) { slides.push({ e: e, j: j, n: list.length, p: p }); });
  });
  var N = slides.length;

  function cardHtml(st) {
    return '<div class="xs-ph"><span>' + esc(st.category) + '</span><b>' + esc(st.year) + '</b><i>' + esc(st.title) + '</i></div>';
  }
  function slideHtml(s, i) {
    var st = STAGES[s.e];
    var inner = s.card
      ? cardHtml(st)
      : '<img class="xs-bg" draggable="false" alt="" aria-hidden="true" src="' + esc(s.p.src) + '">' + // blurred backdrop, fills the frame
        '<img class="xs-fg" draggable="false" loading="lazy" alt="' + esc(s.p.caption || 'Dokumentasi ' + st.title + ' ' + (s.j + 1)) + '" src="' + esc(s.p.src) + '">' + // the whole photo, never cropped
        (s.p.caption ? '<figcaption>' + esc(s.p.caption) + '</figcaption>' : '');
    var label = s.card ? st.category + ': ' + st.title + ' (belum ada foto)' : 'Foto ' + (s.j + 1) + ' dari ' + s.n + ' — ' + st.title;
    return '<figure class="xs-slide" tabindex="0" role="button" data-i="' + i + '" style="--hue:' + hueOf(st) + '" aria-label="' + esc(label) + '">' + inner + '</figure>';
  }

  /* ------------------------------------------------------------ markup */
  if (REDUCED) {
    host.innerHTML = '<div class="xs-plain">' + STAGES.map(function (s, e) {
      var figs = slides.map(function (sl, i) { return sl.e === e && !sl.card ? slideHtml(sl, i) : ''; }).join('');
      return '<article style="--hue:' + hueOf(s) + '"><div class="xs-meta"><span class="xs-cat">' + esc(s.category) + '</span><span class="xs-year">' + esc(s.year) +
        '</span></div><h3>' + esc(s.title) + '</h3><p class="xs-sub">' + esc(s.subtitle || '') + '</p><p class="xs-text">' + esc(s.text) + '</p>' +
        (figs ? '<div class="xs-grid">' + figs + '</div>' : '') + '</article>';
    }).join('') + '</div>';
  } else {
    host.innerHTML =
      '<div class="xs" id="xs"><div class="xs-stage" id="xst"><div class="xs-info"><div class="xs-body" id="xsb" aria-live="polite">' +
      '<div class="xs-meta"><span class="xs-cat" id="xsc"></span><span class="xs-year" id="xsy"></span></div>' +
      '<h3 id="xsh"></h3><p class="xs-sub" id="xss"></p><p class="xs-text" id="xsx"></p><p class="xs-count" id="xsn"></p></div>' +
      '<ol class="xs-steps" id="xsl">' + STAGES.map(function (s, e) {
        return '<li><button type="button" data-e="' + e + '" style="--hue:' + hueOf(s) + '">' + pad(e + 1) + ' ' + esc(s.category) + '</button></li>';
      }).join('') + '</ol></div>' +
      '<div class="xs-3d"><div class="xs-track">' + slides.map(slideHtml).join('') + '</div><span class="xs-hint" id="xsint">Scroll atau geser ↕</span></div></div></div>';
  }

  /* ------------------------------------------------------------ pinned stage + 3D carousel */
  var els = [].slice.call(host.querySelectorAll('.xs-slide'));
  var curExp = -1, curSlide = -1, p = 0, raf = null, navH = 65, stageH = 560, step = 400, h3 = 560, slideH = 300;
  var xs = $('xs'), stage = $('xst'), body = $('xsb');

  function setInfo(idx) {
    var s = slides[idx], st = STAGES[s.e];
    if (s.e !== curExp) {
      curExp = s.e;
      body.classList.remove('in');
      void body.offsetWidth; // restart the entrance animation
      $('xsc').textContent = st.category;
      $('xsy').textContent = st.year;
      $('xsh').textContent = st.title;
      $('xss').textContent = st.subtitle || '';
      $('xss').hidden = !st.subtitle;
      $('xsx').textContent = st.text;
      body.classList.add('in');
      stage.style.setProperty('--hue', hueOf(st));
      [].forEach.call($('xsl').querySelectorAll('button'), function (b) { b.classList.toggle('on', +b.dataset.e === curExp); });
    }
    $('xsn').textContent = pad(s.e + 1) + ' / ' + pad(STAGES.length) + (s.card ? ' · belum ada foto' : ' · Foto ' + (s.j + 1) + '/' + s.n);
  }

  function render(pp) {
    var spread = Math.min(h3 * 0.29, 200), i, off, a;
    for (i = 0; i < N; i++) {
      off = i - pp;
      a = Math.abs(off);
      var op = a > 2.6 ? 0 : 1 - Math.min(0.85, a * 0.45);
      // fade out photos that reach the top/bottom edge of the stage, so none is ever cut off
      var over = Math.abs(off * spread) + slideH * 0.5 * (1 - Math.min(a, 3) * 0.07) - h3 / 2;
      op *= clamp(1 - over / (slideH * 0.25), 0, 1);
      var el = els[i];
      el.style.transform = 'translate(-50%,-50%) translate3d(0,' + (off * spread).toFixed(1) + 'px,' + (-Math.min(a, 3) * 150).toFixed(1) + 'px) rotateX(' +
        clamp(-off * 26, -70, 70).toFixed(1) + 'deg) scale(' + (1 - Math.min(a, 3) * 0.07).toFixed(3) + ')';
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = String(100 - Math.round(a * 10));
      el.style.pointerEvents = op < 0.05 ? 'none' : 'auto';
      el.classList.toggle('cur', a < 0.5);
    }
    var idx = clamp(Math.round(pp), 0, N - 1);
    if (idx !== curSlide) { curSlide = idx; setInfo(idx); }
    $('xsint').style.opacity = pp > 0.15 ? 0 : 1;
  }

  function measure() {
    var nav = document.querySelector('nav'), vh = window.innerHeight;
    navH = (nav && nav.offsetHeight) || 65;
    stageH = Math.max(420, vh - navH - 24);
    step = Math.max(340, Math.round(vh * 0.5)); // scroll distance per photo
    stage.style.top = navH + 12 + 'px';
    stage.style.height = stageH + 'px';
    xs.style.height = (N - 1) * step + stageH + 'px'; // the stage stays pinned for (N-1)*step px of scrolling
    h3 = host.querySelector('.xs-3d').clientHeight || stageH; // height of the carousel area
    slideH = (els[0] && els[0].offsetHeight) || 300;
  }
  function target() {
    return clamp((navH + 12 - xs.getBoundingClientRect().top) / step, 0, N - 1);
  }
  function tick() { // eases the displayed position towards the scroll position; stops when settled
    raf = null;
    var t = target();
    p += (t - p) * 0.14;
    if (Math.abs(t - p) < 0.001) p = t;
    render(p);
    if (p !== t) raf = requestAnimationFrame(tick);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  function scrollToSlide(i) {
    var top = xs.getBoundingClientRect().top + window.scrollY - (navH + 12) + i * step + 1;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  if (!REDUCED) {
    measure();
    p = target();
    render(p);
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', function () { measure(); kick(); });
    $('xsl').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) scrollToSlide(firstSlide[+b.dataset.e]);
    });
  }

  /* ---- drag the carousel with the mouse ----
   * The carousel position comes from the page scroll, so dragging simply scrolls the page, kept inside the
   * pinned range. Touch is skipped: a finger already scrolls the page natively. */
  if (!REDUCED) {
    var area = host.querySelector('.xs-3d'), moved = false, vel = 0, gliding = false, dragged = 0, lastMove = { y: 0, t: 0 };
    var scrollRange = function () {
      var y0 = xs.getBoundingClientRect().top + window.scrollY - (navH + 12);
      return [y0, y0 + (N - 1) * step];
    };
    var moveBy = function (dy) {
      var r = scrollRange(), y = window.scrollY, ny = y + dy;
      if (y >= r[0] - 5 && y <= r[1] + 5) ny = clamp(ny, r[0], r[1]); // stay inside while pinned
      window.scrollTo({ top: ny, behavior: 'instant' });
    };
    var glide = function () { // momentum after release, then settle on a photo
      if (!gliding) return;
      if (Math.abs(vel) < 0.04) {
        gliding = false;
        // a drag of ~30% of a photo is enough to move on to the next one (in the direction of the drag)
        var pp = clamp(target(), 0, N - 1);
        var k = dragged > 0 ? Math.ceil(pp - 0.3) : dragged < 0 ? Math.floor(pp + 0.3) : Math.round(pp);
        scrollToSlide(clamp(k, 0, N - 1));
        return;
      }
      moveBy(vel * 16);
      vel *= 0.93;
      requestAnimationFrame(glide);
    };
    area.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      gliding = false;
      moved = false;
      vel = 0;
      dragged = 0;
      var startY = e.clientY, ratio = step / Math.min(h3 * 0.29, 200); // scroll px per px of cursor movement
      lastMove = { y: startY, t: performance.now() };
      function onMove(ev) {
        if (!moved && Math.abs(ev.clientY - startY) < 4) return; // small movements are still a click
        if (!moved) area.classList.add('drag');
        moved = true;
        var now = performance.now(), dy = ev.clientY - lastMove.y;
        moveBy(-dy * ratio);
        dragged += -dy;
        vel = vel * 0.6 + ((-dy * ratio) / Math.max(1, now - lastMove.t)) * 0.4;
        lastMove = { y: ev.clientY, t: now };
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        area.classList.remove('drag');
        if (!moved) return;
        if (performance.now() - lastMove.t > 80) vel = 0; // held still before releasing
        gliding = true;
        requestAnimationFrame(glide);
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
    host.addEventListener('click', function (e) { // the click that ends a drag must not open a photo
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
    ['wheel', 'keydown'].forEach(function (name) {
      addEventListener(name, function () { gliding = false; }, { passive: true }); // the user takes over again
    });
  }

  host.addEventListener('error', function (e) { // wrong path: show the title card instead of a broken image
    if (e.target.tagName !== 'IMG') return;
    var fig = e.target.closest('.xs-slide');
    if (!fig) return;
    console.warn('experience: foto tidak ditemukan ->', e.target.getAttribute('src'));
    var s = slides[+fig.dataset.i];
    s.broken = true;
    fig.innerHTML = cardHtml(STAGES[s.e]);
  }, true);

  function activate(fig) {
    var i = +fig.dataset.i, s = slides[i];
    if (REDUCED || (fig.classList.contains('cur') && !s.card && !s.broken)) {
      if (!s.card && !s.broken) openLightbox(i, fig);
    } else scrollToSlide(i);
  }
  host.addEventListener('click', function (e) {
    var fig = e.target.closest('.xs-slide');
    if (fig) activate(fig);
  });
  host.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var fig = e.target.closest('.xs-slide');
    if (fig) { e.preventDefault(); activate(fig); }
  });

  /* ------------------------------------------------------------ lightbox (large photo view) */
  var dlg = document.createElement('div');
  dlg.id = 'tm';
  dlg.hidden = true;
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.setAttribute('aria-labelledby', 'tmh');
  dlg.innerHTML =
    '<div class="pmp wide" id="tmp"><div class="pmi" id="tmi"><img id="tmg" alt="">' +
    '<button type="button" class="gb gp" id="tmprev" aria-label="Foto sebelumnya">‹</button>' +
    '<button type="button" class="gb gn" id="tmnext" aria-label="Foto berikutnya">›</button><span class="gc" id="tmc"></span></div>' +
    '<p class="gcap" id="tmcap"></p><div class="gt" id="tmt"></div>' +
    '<span class="k" id="tmk"></span><h3 id="tmh"></h3><p class="tsub" id="tms"></p>' +
    '<div class="pmb"><button type="button" class="btn p" id="tmx">Tutup</button></div></div>';
  document.body.appendChild(dlg);

  var cur = 0, photos = [], idx = 0, opener = null;

  function showPhoto(k) {
    idx = (k + photos.length) % photos.length;
    var ph = photos[idx];
    $('tmg').src = ph.src;
    $('tmg').alt = ph.caption || 'Foto ' + STAGES[cur].title + ' ' + (idx + 1);
    $('tmcap').textContent = ph.caption || '';
    $('tmcap').hidden = !ph.caption;
    $('tmc').textContent = idx + 1 + ' / ' + photos.length;
    [].forEach.call($('tmt').children, function (b, j) { b.classList.toggle('on', j === idx); });
  }

  function openLightbox(i, from) { // i = index of the clicked slide; shows all photos of its experience
    var sl = slides[i], s = STAGES[sl.e], multi;
    cur = sl.e;
    opener = from;
    photos = slides.filter(function (x) { return x.e === sl.e && !x.card && !x.broken; }).map(function (x) { return x.p; });
    multi = photos.length > 1;
    $('tmk').textContent = s.category + ' · ' + s.year;
    $('tmh').textContent = s.title;
    $('tms').textContent = s.subtitle || '';
    $('tms').hidden = !s.subtitle;
    $('tmt').hidden = !multi;
    ['tmprev', 'tmnext', 'tmc'].forEach(function (id) { $(id).hidden = !multi; });
    $('tmt').innerHTML = multi
      ? photos.map(function (p, k) { return '<button type="button" aria-label="Foto ' + (k + 1) + '"><img alt="" src="' + esc(p.src) + '"></button>'; }).join('')
      : '';
    showPhoto(Math.max(0, photos.indexOf(sl.p)));
    dlg.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('tmx').focus();
  }

  function closeLightbox() {
    dlg.hidden = true;
    document.documentElement.style.overflow = '';
    if (opener && opener.isConnected) opener.focus();
  }

  $('tmprev').onclick = function () { showPhoto(idx - 1); };
  $('tmnext').onclick = function () { showPhoto(idx + 1); };
  $('tmt').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) showPhoto([].indexOf.call($('tmt').children, b));
  });
  $('tmx').onclick = closeLightbox;
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (dlg.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (photos.length > 1 && e.key === 'ArrowLeft') showPhoto(idx - 1);
    else if (photos.length > 1 && e.key === 'ArrowRight') showPhoto(idx + 1);
  });
})();

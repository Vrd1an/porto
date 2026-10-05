/*
 * intro.js - page-load intro.
 * 1. The ID card falls in (card3d), then after ~2.6 s a circular wave starts at the top centre.
 * 2. The wave is drawn on a canvas (ring + dust) and distorts the whole page through the
 *    SVG filter #wv (a spherical "bulge" displacement map), shaking the ID card as it passes.
 * 3. Every element is revealed when the wave reaches it; the card glides to its place.
 * Everything is cleaned up by finish(); a timer guarantees the page is never left hidden.
 */
(function () {
  var H = document.documentElement;
  if (!H.classList.contains('js-intro')) return;
  var done = false,
    started = false;
  var els = [].slice.call(
    document.querySelectorAll(
      'nav,nav .lg,nav .ls a,nav .btn,main .k,main h1,main h2,main h3,main p,main .btn,main .tag,main .c,main .stats>div,main dt,main dd,footer span,footer a',
    ),
  );
  els.forEach(function (e) {
    e.classList.add('rv');
  });
  H.classList.add('rv-ready');
  scrollTo(0, 0);
  // Removes the intro state so the page behaves normally.
  function finish() {
    if (done) return;
    done = true;
    H.classList.remove('js-intro');
    els.forEach(function (e) {
      e.classList.remove('rv');
    });
  }
  var pg = document.getElementById('pg'),
    wvi = document.getElementById('wvi'),
    wvd = document.getElementById('wvd'),
    kicked = false;
  (function () {
    var N = 768,
      c = document.createElement('canvas');
    c.width = c.height = N;
    var x = c.getContext('2d'),
      im = x.createImageData(N, N);
    for (var j = 0; j < N; j++)
      for (var i = 0; i < N; i++) {
        var dx = (i + 0.5 - N / 2) / (N / 2),
          dy = (j + 0.5 - N / 2) / (N / 2),
          ro = Math.hypot(dx, dy),
          hh = ro < 1 ? (ro * (1 - ro * ro)) / 0.3849 : 0,
          k = (j * N + i) * 4,
          ux = ro ? dx / ro : 0,
          uy = ro ? dy / ro : 0;
        im.data[k] = 128 - 127 * ux * hh;
        im.data[k + 1] = 128 - 127 * uy * hh;
        im.data[k + 2] = 128;
        im.data[k + 3] = 255;
      }
    x.putImageData(im, 0, 0);
    var u = c.toDataURL();
    if (wvi) {
      wvi.setAttribute('href', u);
      wvi.setAttributeNS('http://www.w3.org/1999/xlink', 'href', u);
    }
  })();
  // Moves/scales the bulge map so its rim follows the wave ring; also kicks the ID card.
  function bulge(r, ox, maxD) {
    if (!pg || !wvi) return;
    pg.classList.add('wv');
    var R = Math.max(r, 2),
      q = r / maxD,
      s = q < 0.55 ? 1 : q >= 1.1 ? 0 : 0.5 * (1 + Math.cos((Math.PI * (q - 0.55)) / 0.55));
    wvi.setAttribute('x', ox - R);
    wvi.setAttribute('y', -R);
    wvi.setAttribute('width', 2 * R);
    wvi.setAttribute('height', 2 * R);
    wvd.setAttribute('scale', (0.477 * R * s).toFixed(1));
    if (!kicked && window.cardPos) {
      var cp = window.cardPos();
      if (Math.hypot(cp.x - ox, cp.y) <= r) {
        kicked = true;
        var sg = cp.x >= ox ? 1 : -1;
        window.cardKick(sg, 1);
        setTimeout(function () {
          window.cardKick(-sg, 0.6);
        }, 300);
      }
    }
  }
  // Switches the page distortion off again.
  function bulgeOff() {
    if (pg) pg.classList.remove('wv');
    if (wvd) wvd.setAttribute('scale', '0');
  }
  // Draws the expanding ring + dust and drives the page bulge every frame.
  function wave(ox, sp, maxD) {
    var W = innerWidth,
      Hh = innerHeight,
      c = document.createElement('canvas'),
      dpr = Math.min(devicePixelRatio || 1, 2);
    c.style.cssText =
      'position:fixed;left:0;top:0;width:100%;height:100%;z-index:70;pointer-events:none';
    c.width = W * dpr;
    c.height = Hh * dpr;
    document.body.appendChild(c);
    var x = c.getContext('2d'),
      col = (getComputedStyle(H).getPropertyValue('--ac') || '#4f46e5').trim(),
      ps = [],
      t0 = performance.now(),
      last = t0;
    (function f(n) {
      var t = n - t0,
        dt = Math.min(n - last, 50),
        r = sp * t;
      last = n;
      bulge(r, ox, maxD);
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, W, Hh);
      var fade = Math.max(0, Math.min(1, (maxD + 260 - r) / 260));
      x.strokeStyle = col;
      for (var k = 1; k <= 4; k++) {
        x.globalAlpha = 0.05 * fade;
        x.lineWidth = k * 28;
        x.beginPath();
        x.arc(ox, 0, Math.max(r - k * 14, 0), 0, Math.PI);
        x.stroke();
      }
      x.globalAlpha = 0.22 * fade;
      x.strokeStyle = '#000';
      x.lineWidth = 6;
      x.beginPath();
      x.arc(ox, 0, r + 6, 0, Math.PI);
      x.stroke();
      x.strokeStyle = col;
      x.globalAlpha = 0.9 * fade;
      x.lineWidth = 2.5;
      x.shadowColor = col;
      x.shadowBlur = 16;
      x.beginPath();
      x.arc(ox, 0, r, 0, Math.PI);
      x.stroke();
      x.shadowBlur = 0;
      if (r < maxD)
        for (var i = 0; i < 16; i++) {
          var d = 20 + Math.random() * 170;
          ps.push({
            a: Math.random() * Math.PI,
            rad: r + d,
            s: 0.7 + Math.random() * 2,
            v: 0.12 + Math.random() * 0.25,
            o: Math.random() < 0.5,
          });
        }
      for (var j = ps.length - 1; j >= 0; j--) {
        var p = ps[j];
        p.rad -= p.v * dt;
        var dd = p.rad - r;
        if (dd <= 0) {
          ps.splice(j, 1);
          continue;
        }
        p.a += (Math.random() - 0.5) * 0.003;
        x.fillStyle = p.o ? '#fff' : col;
        x.globalAlpha = Math.min(1, (1 - dd / 190) * 1.2) * fade;
        x.fillRect(ox + Math.cos(p.a) * p.rad, Math.sin(p.a) * p.rad, p.s, p.s);
      }
      if (r < maxD + 300) requestAnimationFrame(f);
      else {
        c.remove();
        bulgeOff();
      }
    })(t0);
  }
  // Starts everything: card glide, per-element reveal delays and the wave.
  function reveal() {
    if (started) return;
    started = true;
    var W = innerWidth,
      Hh = innerHeight,
      ox = W / 2,
      maxD = Math.hypot(W / 2, Hh),
      dur = 2300,
      sp = maxD / dur;
    if (window.cardGlide) window.cardGlide(1800);
    els.forEach(function (el) {
      var b = el.getBoundingClientRect(),
        vx = b.left + b.width / 2 - ox,
        vy = b.top + b.height / 2,
        hh = Math.hypot(vx, vy) || 1,
        d = Math.min(hh, maxD * 1.02);
      el.style.animationDelay = d / sp + 'ms';
      el.style.setProperty('--dx', (vx / hh) * 22 + 'px');
      el.style.setProperty('--dy', (vy / hh) * 22 + 'px');
      el.classList.add('in');
    });
    wave(ox, sp, maxD);
    setTimeout(finish, dur + 1400);
  }
  window.addEventListener('cardready', function () {
    setTimeout(reveal, 2600);
  });
  setTimeout(function () {
    reveal();
  }, 7000);
  setTimeout(finish, 12000);
})();

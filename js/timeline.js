/*
 * timeline.js - "sacred timeline" journey, drawn on two canvases (glow + core).
 * - ST: the six stages (text only; x positions are computed from the screen width).
 * - build(): generates the fractal branches for the current width (re-run on resize).
 * - frame(): draws one frame; idle animation = flicker, travelling pulses, dust, node rings.
 * Colours follow the light/dark theme. Stops drawing while off screen.
 */
(function () {
  var host = document.getElementById('jr');
  if (!host) return;
  var H = 540,
    MY = 270,
    seed = 21,
    RM = matchMedia('(prefers-reduced-motion:reduce)').matches,
    W = 980,
    P = [],
    nodes = [],
    nt = [],
    M = [],
    PU = [],
    WD = [0.7, 1, 1.4, 2, 3];
  function R() {
    seed = (seed + 0x6d2b79f5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function my(x) {
    return MY + 12 * Math.sin(x / 90) + 5 * Math.sin(x / 29 + 1);
  }
  var ST = [
    {
      t: 'SD',
      y: '[Tahun – Tahun]',
      p: '[Nama SD] — fondasi belajar dan rasa ingin tahu pertama.',
    },
    { t: 'SMP', y: '[Tahun – Tahun]', p: '[Nama SMP] — mulai menemukan hal yang menarik minat.' },
    {
      t: 'SMA / SMK',
      y: '[Tahun – Tahun]',
      p: '[Nama sekolah] — memilih arah, mengenal teknologi.',
    },
    { t: 'Kuliah', y: '2022 – sekarang', p: 'S1 Teknik Informatika, Universitas Suryakancana.' },
    {
      t: 'Tugas Akhir',
      y: '2025 – 2026',
      p: 'SIG web kelayakan TPS Kab. Cianjur (C4.5, Laravel, QGIS).',
    },
    { t: 'Sekarang', y: '2026', p: 'Web Designer: antarmuka rapi, responsif, siap dikembangkan.' },
  ];
  // One lightning branch: a smooth random walk, optionally steered to a target, with sub-branches.
  function vein(x, y, a, len, dep, tx, ty, t0, col) {
    var pts = [[x, y]],
      n = Math.max(4, Math.round(len / 7)),
      cv = 0,
      o = { pts: pts, dep: dep, t0: t0, sp: 330, n: n, len: n * 7, col: col, fl: 0 };
    P.push(o);
    for (var i = 0; i < n; i++) {
      if (tx != null) {
        var da = Math.atan2(ty - y, tx - x) - a;
        a += Math.atan2(Math.sin(da), Math.cos(da)) * 0.1;
      }
      cv += (R() - 0.5) * 0.16;
      cv *= 0.88;
      a += cv + (R() - 0.5) * 0.12;
      x += Math.cos(a) * 7;
      y += Math.sin(a) * 7;
      pts.push([x, y]);
      if (dep > 0 && i > 1 && R() < 0.09 + dep * 0.03)
        vein(
          x,
          y,
          a + (R() < 0.5 ? -1 : 1) * (0.45 + R() * 0.8),
          len * (0.3 + R() * 0.3),
          dep - 1,
          null,
          null,
          t0 + (i * 7) / 330,
          dep < 3 && R() < 0.12 ? 1 : col,
        );
    }
    return o;
  }
  host.innerHTML =
    '<div class="tlw"><div class="tlc" id="tlc"><div id="hz"></div><canvas id="tlg" class="tlk"></canvas><canvas id="tlk" class="tlk"></canvas><div id="tcs"></div><span class="tle" id="tl1">MULAI</span><span class="tle" id="tl2">SEKARANG</span></div></div><p class="mut tlh">← geser untuk melihat seluruh timeline →</p>';
  var tc = document.getElementById('tlc'),
    tw = host.querySelector('.tlw'),
    cg = document.getElementById('tlg'),
    ck = document.getElementById('tlk'),
    hint = host.querySelector('.tlh'),
    l1 = document.getElementById('tl1'),
    l2 = document.getElementById('tl2'),
    dpr = Math.min(devicePixelRatio || 1, 2),
    g = cg.getContext('2d'),
    k = ck.getContext('2d');
  // (Re)generate all geometry for the current screen width.
  function build() {
    var vw = document.documentElement.clientWidth;
    W = Math.max(720, vw);
    host.style.marginLeft = '0px';
    host.style.width = 'auto';
    host.style.marginLeft = -host.getBoundingClientRect().left + 'px';
    host.style.width = vw + 'px';
    tw.style.overflowX = vw < 720 ? 'auto' : 'visible';
    tw.style.height = H + 'px';
    tc.style.width = W + 'px';
    tc.style.height = H + 'px';
    [cg, ck].forEach(function (c) {
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.width = W + 'px';
      c.style.height = H + 'px';
    });
    hint.style.display = vw < 720 ? 'block' : 'none';
    l1.style.cssText = 'left:16px;top:' + (MY + 14) + 'px';
    l2.style.cssText = 'right:16px;top:' + (MY + 14) + 'px';
    seed = 21;
    P = [];
    nodes = [];
    nt = [];
    var mp = [];
    for (var x = 0; x <= W; x += 6) mp.push([x, my(x)]);
    if (mp[mp.length - 1][0] < W) mp.push([W, my(W)]);
    P.push({
      pts: mp,
      dep: 4,
      t0: 0,
      sp: 560,
      n: mp.length - 1,
      len: (mp.length - 1) * 6,
      col: 0,
      fl: 0,
      main: 1,
    });
    var pad = 28,
      gap = (W - 2 * pad) / 6;
    ST.forEach(function (s, i) {
      var up = i % 2 === 0,
        ax = pad + (i + 0.5) * gap,
        ay = my(ax),
        ex = ax + ((i % 3) - 1) * 22,
        ey = up ? MY - 120 : MY + 120,
        d0 = ax / 560 + 0.05;
      s.x = ax;
      var o = vein(
        ax,
        ay,
        ((up ? -1 : 1) * Math.PI) / 2 + (R() - 0.5) * 0.5,
        150,
        4,
        ex,
        ey,
        d0,
        0,
      );
      nodes.push(o.pts[o.pts.length - 1]);
      nt.push(d0 + o.len / 330);
    });
    for (var q = 0, nq = Math.round(W / 49); q < nq; q++) {
      var sx = 20 + R() * (W - 40),
        up = R() < 0.5;
      vein(
        sx,
        my(sx),
        ((up ? -1 : 1) * Math.PI) / 2 + (R() - 0.5) * 1.3,
        36 + R() * 54,
        2,
        null,
        null,
        sx / 560,
        R() < 0.15 ? 1 : 0,
      );
    }
    M = [];
    for (var m = 0; m < 55; m++)
      M.push({
        x: R() * W,
        y: R() * H,
        vx: (R() - 0.5) * 8,
        vy: -(2 + R() * 8),
        r: 0.6 + R() * 1.4,
        ph: R() * 6.28,
      });
    PU = [];
    for (var u = 0; u < 14; u++) PU.push({ o: null, s: 0, v: 0, w: R() * 3 });
    var live = tc.classList.contains('play');
    document.getElementById('tcs').innerHTML = ST.map(function (s, i) {
      var n = nodes[i],
        l = Math.max(8, Math.min(W - 184, n[0] - 88));
      return (
        '<div class="tc" style="left:' +
        l +
        'px;' +
        (i % 2 === 0 ? 'bottom:' + (H - n[1] + 16) : 'top:' + (n[1] + 16)) +
        'px;--d:' +
        (live ? 0 : (nt[i] + 0.15).toFixed(2)) +
        's"><small>' +
        s.y +
        '</small><b>' +
        s.t +
        '</b><p>' +
        s.p +
        '</p></div>'
      );
    }).join('');
  }
  // Stroke a branch, only the part already "grown" at time T.
  function path(c, o, T, jit, w, col) {
    var p = Math.min(1, ((T - o.t0) * o.sp) / o.len);
    if (p <= 0) return;
    var km = p * o.n,
      ki = Math.floor(km),
      fr = km - ki,
      pt = o.pts,
      i,
      q;
    c.beginPath();
    for (i = 0; i <= ki && i < pt.length; i++) {
      q = pt[i];
      var jx = jit ? Math.sin(T * 9 + i * 1.3 + o.n) * jit : 0,
        jy = jit ? Math.cos(T * 8 + i * 1.9 + o.t0 * 7) * jit : 0;
      if (i) c.lineTo(q[0] + jx, q[1] + jy);
      else c.moveTo(q[0] + jx, q[1] + jy);
    }
    if (fr > 0 && ki + 1 < pt.length) {
      var a = pt[ki],
        b = pt[ki + 1];
      c.lineTo(a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr);
    }
    c.lineWidth = w;
    c.strokeStyle = col;
    c.stroke();
  }
  // Soft glowing dot.
  function orb(c, x, y, r, a, col) {
    var gr = c.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(' + col + ',' + a + ')');
    gr.addColorStop(1, 'rgba(' + col + ',0)');
    c.fillStyle = gr;
    c.beginPath();
    c.arc(x, y, r, 0, 6.2832);
    c.fill();
  }
  // Draw one frame (T = seconds since start, dt = seconds since last frame).
  function frame(T, dt, still) {
    var dk = document.documentElement.getAttribute('data-theme') === 'dark',
      GA = dk ? 1 : 0.7,
      MA = dk ? 1 : 0.55,
      GC = dk ? ['#2c7bff', '#8a5cff'] : ['#4a6cff', '#9b6bff'],
      MC = dk ? ['#5aa8ff', '#b08cff'] : ['#3d5bf0', '#8250f0'],
      KC = dk ? ['#eaf6ff', '#f0e8ff'] : ['#1f36c9', '#5b21b6'],
      NG = dk ? '110,190,255' : '90,120,255',
      NK = dk ? '255,255,255' : '30,50,210',
      HC = dk ? '140,200,255' : '110,140,255',
      PC = dk ? '200,232,255' : '60,90,235';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    k.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    k.clearRect(0, 0, W, H);
    g.globalCompositeOperation = k.globalCompositeOperation = dk ? 'lighter' : 'source-over';
    var br = still ? 1 : 0.86 + 0.14 * Math.sin(T * 1.7) + 0.05 * Math.sin(T * 5.3),
      i,
      o,
      f;
    if (!still && R() < 0.05) {
      o = P[(R() * P.length) | 0];
      o.fl = 1;
    }
    for (i = 0; i < P.length; i++) {
      o = P[i];
      f = o.fl;
      var w = WD[o.dep],
        pu = o.col;
      g.globalAlpha = Math.min(1, (0.15 + f * 0.45) * br * (o.main ? 1.3 : 1) * GA);
      path(g, o, T, 0, w * 7 + 4, GC[pu]);
      g.globalAlpha = Math.min(1, (0.4 + f * 0.4) * br * MA);
      path(g, o, T, 0, w * 2.6 + 1, MC[pu]);
      k.globalAlpha = (dk ? 0.78 : 0.92) + f * 0.08;
      path(k, o, T, still ? 0 : 0.55, w + f * 1.3, KC[pu]);
      o.fl *= 0.93;
    }
    for (i = 0; i < nodes.length; i++) {
      if (T < nt[i]) continue;
      var n = nodes[i],
        s = Math.min(1, (T - nt[i]) * 3),
        pl = 0.5 + 0.5 * Math.sin(T * 2.2 + i);
      k.globalAlpha = s;
      orb(k, n[0], n[1], 24 + 8 * pl, 0.8, NG);
      orb(k, n[0], n[1], 6, 1, NK);
      if (!still) {
        var rr = (T * 16 + i * 9) % 30;
        k.globalAlpha = (1 - rr / 30) * 0.7;
        k.strokeStyle = dk ? '#8fd0ff' : '#5b7bff';
        k.lineWidth = 1.2;
        k.beginPath();
        k.arc(n[0], n[1], 6 + rr, 0, 6.2832);
        k.stroke();
      }
      var ax = ST[i].x,
        ay = my(ax);
      k.globalAlpha = s * (0.55 + 0.25 * Math.sin(T * 3 + i));
      orb(k, ax, ay, 18, 0.7, HC);
    }
    if (still) return;
    for (i = 0; i < PU.length; i++) {
      var pu2 = PU[i];
      if (!pu2.o) {
        if (T < pu2.w) continue;
        for (var tr = 0; tr < 12; tr++) {
          var c = P[(R() * P.length) | 0];
          if (!c.main && c.dep >= 1 && T > c.t0 + c.len / c.sp + 0.1) {
            pu2.o = c;
            pu2.s = 0;
            pu2.v = 140 + R() * 160;
            break;
          }
        }
        if (!pu2.o) continue;
      }
      pu2.s += pu2.v * dt;
      o = pu2.o;
      if (pu2.s >= o.len) {
        pu2.o = null;
        pu2.w = T + R() * 2.5;
        continue;
      }
      var idx = pu2.s / 7,
        j = Math.floor(idx),
        fr = idx - j,
        a = o.pts[j],
        b = o.pts[Math.min(j + 1, o.pts.length - 1)];
      k.globalAlpha = 1;
      orb(k, a[0] + (b[0] - a[0]) * fr, a[1] + (b[1] - a[1]) * fr, 11, 0.95, PC);
    }
    for (i = 0; i < M.length; i++) {
      var d = M[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < -5) {
        d.y = H + 5;
        d.x = R() * W;
      }
      if (d.x < -5) d.x = W + 5;
      if (d.x > W + 5) d.x = -5;
      k.globalAlpha = 0.2 + 0.25 * Math.sin(T * 2 + d.ph);
      k.fillStyle = dk ? '#9fd4ff' : '#6d8cff';
      k.beginPath();
      k.arc(d.x, d.y, d.r, 0, 6.2832);
      k.fill();
    }
  }
  var T0 = null,
    last = 0,
    vis = false,
    started = false;
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis || document.hidden) return;
    if (T0 === null) {
      T0 = now;
      last = now;
      tc.classList.add('play');
    }
    var T = (now - T0) / 1000,
      dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    frame(T, dt, false);
  }
  function begin() {
    if (started) return;
    started = true;
    if (RM) {
      tc.classList.add('play');
      frame(1e3, 0, true);
      new MutationObserver(function () {
        frame(1e3, 0, true);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    } else requestAnimationFrame(loop);
  }
  build();
  var rt;
  function rb() {
    clearTimeout(rt);
    rt = setTimeout(function () {
      build();
      if (RM && started) frame(1e3, 0, true);
    }, 150);
  }
  if (window.ResizeObserver) new ResizeObserver(rb).observe(document.documentElement);
  else addEventListener('resize', rb);
  if ('IntersectionObserver' in window)
    new IntersectionObserver(
      function (a) {
        vis = a[0].isIntersecting;
        if (vis) begin();
      },
      { threshold: 0.15 },
    ).observe(tw);
  else {
    vis = true;
    begin();
  }
})();

/*
 * nav-lens.js - the liquid-glass lens that slides between navbar buttons.
 * - map(): builds the displacement map used by the SVG filter #lgf (a convex bulge); the filter splits the
 *   red/green/blue channels slightly, which gives the chromatic glitch fringes of the glass.
 * - go(): moves the lens with a stretch/squash animation; spy(): follows the scroll position.
 * - the lens can also be dragged by hand: it follows the cursor, then settles on the nearest button.
 * Refraction needs a Chromium browser; other browsers fall back to a plain blurred glass.
 */
(function () {
  var ls = document.querySelector('nav .ls');
  if (!ls) return;
  var links = [].slice.call(ls.querySelectorAll('a')),
    ids = links.map(function (a) {
      return a.getAttribute('href').slice(1);
    }),
    ind = document.createElement('span'),
    fe = document.getElementById('lgm'),
    cur = -1,
    g = null,
    lock = 0,
    ua = navigator.userAgent;
  ind.className = 'lens';
  ls.appendChild(ind);
  if (/Chrome|Chromium|Edg/.test(ua) && !/Firefox/.test(ua))
    ind.style.backdropFilter = 'url(#lgf) blur(.4px) saturate(1.7) brightness(1.08)';

  // Displacement map for the lens: a convex bulge. The middle is enlarged and the sides bend strongly, like a
  // glass ball. The SVG filter #lgf (index.html) bends the red, green and blue channels by slightly different
  // amounts, which gives the chromatic "glitch" fringes.
  function map(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var x = c.getContext('2d'),
      im = x.createImageData(w, h),
      r = 14;
    for (var j = 0; j < h; j++)
      for (var i = 0; i < w; i++) {
        var px = i + 0.5 - w / 2,
          py = j + 0.5 - h / 2,
          u = px / (w / 2),
          v = py / (h / 2),
          qx = Math.abs(px) - (w / 2 - r),
          qy = Math.abs(py) - (h / 2 - r),
          d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r,
          ro = Math.min(1, Math.pow(Math.pow(Math.abs(u), 3) + Math.pow(Math.abs(v), 3), 1 / 3)),
          gg = d < 0 ? 0.14 + 0.26 * ro + 0.6 * ro * ro * ro : 0,
          k = (j * w + i) * 4;
        im.data[k] = 128 - 127 * u * gg;
        im.data[k + 1] = 128 - 127 * v * gg;
        im.data[k + 2] = 128;
        im.data[k + 3] = 255;
      }
    x.putImageData(im, 0, 0);
    var uu = c.toDataURL();
    fe.setAttribute('width', w);
    fe.setAttribute('height', h);
    fe.setAttribute('href', uu);
    fe.setAttributeNS('http://www.w3.org/1999/xlink', 'href', uu);
  }
  // Lens rectangle around link i (a little larger than the link).
  function box(i) {
    var a = links[i];
    return {
      x: a.offsetLeft - 7,
      y: a.offsetTop - 4,
      w: a.offsetWidth + 14,
      h: a.offsetHeight + 8,
    };
  }
  // Move the lens to link i; animate = stretch from the old to the new position.
  function go(i, anim) {
    var b = box(i);
    if (!b.w) return;
    links.forEach(function (a, k) {
      a.classList.toggle('on', k === i);
    });
    map(Math.round(b.w), Math.round(b.h));
    ind.style.width = b.w + 'px';
    ind.style.height = b.h + 'px';
    ind.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)';
    if (
      anim &&
      g &&
      cur !== i &&
      ind.animate &&
      !matchMedia('(prefers-reduced-motion:reduce)').matches
    ) {
      var span = Math.abs(b.x - g.x) + Math.max(g.w, b.w);
      ind.animate(
        [
          { transform: 'translate(' + g.x + 'px,' + g.y + 'px) scale(' + g.w / b.w + ',1)' },
          {
            transform:
              'translate(' + Math.min(g.x, b.x) + 'px,' + g.y + 'px) scale(' + span / b.w + ',.88)',
            offset: 0.45,
          },
          { transform: 'translate(' + b.x + 'px,' + b.y + 'px) scale(1,1)' },
        ],
        { duration: 720, easing: 'cubic-bezier(.3,.9,.4,1)' },
      );
    }
    cur = i;
    g = b;
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function () {
      lock = Date.now() + 1100;
      go(i, true);
    });
  });
  // Slide the lens by hand: press on the buttons and drag; on release it settles on the nearest button
  // and the page scrolls to that section (the lens stretches while it moves, like liquid).
  var suppressUntil = 0;
  function nearest(cx) {
    var best = 0,
      bd = Infinity;
    links.forEach(function (a, i) {
      var b = box(i),
        d = Math.abs(b.x + b.w / 2 - cx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }
  ls.addEventListener('dragstart', function (e) {
    e.preventDefault(); // links must not start a native drag
  });
  ls.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || !g) return;
    var startX = e.clientX,
      start = { x: g.x, y: g.y, w: g.w, h: g.h },
      x = start.x,
      started = false;
    var first = box(0),
      last = box(links.length - 1);
    var minX = first.x,
      maxX = last.x + last.w - start.w;
    function move(ev) {
      var dx = ev.clientX - startX;
      if (!started) {
        if (Math.abs(dx) < 4) return; // small movements are still a click
        started = true;
        lock = Date.now() + 60000; // keep the scroll spy away while dragging
        ls.classList.add('sliding');
        if (ind.getAnimations)
          ind.getAnimations().forEach(function (an) {
            an.cancel();
          });
      }
      var nx = Math.min(maxX, Math.max(minX, start.x + dx)),
        v = nx - x;
      x = nx;
      ind.style.transform =
        'translate(' + x + 'px,' + start.y + 'px) scale(' +
        (1 + Math.min(0.28, Math.abs(v) / 40)) + ',' + (1 - Math.min(0.12, Math.abs(v) / 90)) + ')';
      var idx = nearest(x + start.w / 2);
      links.forEach(function (a, k) {
        a.classList.toggle('on', k === idx);
      });
    }
    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      ls.classList.remove('sliding');
      if (!started) return;
      var idx = nearest(x + start.w / 2);
      g = { x: x, y: start.y, w: start.w, h: start.h }; // animate from where the lens was released
      cur = -2;
      links[idx].click(); // go() + scroll to the section
      suppressUntil = performance.now() + 60; // ...and ignore the click that the browser sends after a drag
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  });
  ls.addEventListener(
    'click',
    function (e) {
      if (performance.now() < suppressUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );
  // Scroll spy: highlight the link of the section currently in view.
  function spy() {
    if (Date.now() < lock) return;
    var y = innerHeight * 0.35,
      k = 0;
    ids.forEach(function (id, n) {
      var e = document.getElementById(id);
      if (e && e.getBoundingClientRect().top <= y) k = n;
    });
    if (k !== cur) go(k, true);
  }
  addEventListener('scroll', spy, { passive: true });
  function init() {
    g = null;
    cur = -1;
    go(0, false);
    spy();
  }
  addEventListener('resize', function () {
    var c = cur < 0 ? 0 : cur;
    g = null;
    go(c, false);
  });
  addEventListener('load', init);
  document.fonts && document.fonts.ready.then(init);
  init();
})();

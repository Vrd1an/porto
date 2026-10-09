/*
 * nav-glass.js - liquid-glass distortion for the navbar itself.
 * Builds an edge-refraction map sized to the navbar and feeds it to the SVG filter #nvf,
 * so content scrolling underneath bends near the navbar edges. Rebuilt when the width changes.
 */
(function () {
  var nav = document.querySelector('nav'),
    fe = document.getElementById('nvm'),
    ua = navigator.userAgent;
  if (!nav || !fe) return;
  if (/Chrome|Chromium|Edg/.test(ua) && !/Firefox/.test(ua))
    nav.style.backdropFilter = 'url(#nvf) blur(2px) saturate(1.3) brightness(1.05)';
  var last = '';
  // Edge-refraction map for the navbar (neutral in the middle, strong at top/bottom edges).
  function map() {
    var w = nav.offsetWidth,
      h = nav.offsetHeight;
    if (!w || !h || w + 'x' + h === last) return;
    last = w + 'x' + h;
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var x = c.getContext('2d'),
      im = x.createImageData(w, h),
      band = 26;
    for (var j = 0; j < h; j++)
      for (var i = 0; i < w; i++) {
        var px = i + 0.5 - w / 2,
          py = j + 0.5 - h / 2,
          ex = w / 2 - Math.abs(px),
          ey = h / 2 - Math.abs(py),
          t = Math.pow(Math.max(0, 1 - Math.min(ex, ey) / band), 1.8),
          nx = 0,
          ny = 0;
        if (ey < ex) ny = py < 0 ? -1 : 1;
        else nx = px < 0 ? -1 : 1;
        var k = (j * w + i) * 4;
        im.data[k] = 128 - 127 * nx * t;
        im.data[k + 1] = 128 - 127 * ny * t;
        im.data[k + 2] = 128;
        im.data[k + 3] = 255;
      }
    x.putImageData(im, 0, 0);
    var u = c.toDataURL();
    fe.setAttribute('width', w);
    fe.setAttribute('height', h);
    fe.setAttribute('href', u);
    fe.setAttributeNS('http://www.w3.org/1999/xlink', 'href', u);
  }
  map();
  addEventListener('resize', function () {
    requestAnimationFrame(map);
  });
  if (document.fonts) document.fonts.ready.then(map);
})();

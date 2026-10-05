/*
 * projects.js - project cards, hover overlays and the "To be continued" dialog.
 * Edit the PJ list below: a = click action ('tbc' = dialog, 'visit' = open this page in a new tab),
 * c = hover glow colour ('g' green, 'r' red), h = hover text, img = screenshot (see assets-data.js).
 */
(function () {
  var g = document.getElementById('pj');
  if (!g) return;
  var PROJ = window.__PROJ || {};
  var PJ = [
    {
      cat: 'Skripsi • DLH Cianjur',
      t: 'SIG Kelayakan TPS Kab. Cianjur',
      d: 'Sistem informasi geografis berbasis web untuk mengklasifikasi kelayakan lokasi TPS dengan algoritma C4.5.',
      tg: ['Laravel', 'MySQL', 'QGIS'],
      c: 'g',
      a: 'tbc',
      h: 'To be continued',
      img: PROJ.sig,
      why: 'Proyek ini masih dalam tahap pengembangan dan pengujian, dan dibangun bersama Dinas Lingkungan Hidup Kabupaten Cianjur. Demo publik dan dokumentasi lengkapnya belum dapat ditampilkan, dan akan dirilis setelah proyek selesai.',
    },
    {
      cat: 'Web Design',
      t: 'Portfolio Web Designer',
      d: 'Landing page portofolio dengan kartu ID 3D interaktif, intro animasi, dan navbar liquid glass.',
      tg: ['HTML & CSS', 'Three.js', 'Liquid Glass'],
      c: 'g',
      a: 'visit',
      h: 'Click to visit',
      img: PROJ.portfolio,
    },
    {
      cat: 'Sedang dikerjakan',
      t: 'Absensi Siswa',
      d: 'Aplikasi absensi siswa yang masih dalam tahap pengerjaan.',
      tg: ['Work in Progress'],
      c: 'r',
      a: '',
      h: 'WIP',
      img: null,
      wip: 1,
    },
  ];
  g.innerHTML = PJ.map(function (p, i) {
    var im = p.img
      ? '<img alt="Screenshot ' + p.t + '" src="data:image/jpeg;base64,' + p.img + '">'
      : '<span class="ph' +
        (p.wip ? ' wip' : '') +
        '">' +
        (p.wip ? 'WIP' : 'Screenshot proyek') +
        '</span>';
    return (
      '<div class="c pj ' +
      p.c +
      (p.a ? ' a' : '') +
      '" data-i="' +
      i +
      '"' +
      (p.a ? ' role="button" tabindex="0" aria-label="' + p.t + ' — ' + p.h + '"' : '') +
      '><span class="pjs">' +
      im +
      '<span class="pjo">' +
      p.h +
      '</span></span><span class="k">' +
      p.cat +
      '</span><h3>' +
      p.t +
      '</h3><p>' +
      p.d +
      '</p><div class="tags">' +
      p.tg
        .map(function (x) {
          return '<span class="tag">' + x + '</span>';
        })
        .join('') +
      '</div></div>'
    );
  }).join('');
  var m = document.createElement('div');
  m.id = 'pm';
  m.hidden = true;
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.setAttribute('aria-labelledby', 'pmt');
  m.innerHTML =
    '<div class="pmp"><h3 id="pmt">To be continued</h3><p id="pmd"></p><button type="button" class="btn p" id="pmx">Mengerti</button></div>';
  document.body.appendChild(m);
  var from = null;
  function open(i, el) {
    from = el;
    document.getElementById('pmd').textContent = PJ[i].why;
    m.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    document.getElementById('pmx').focus();
  }
  function close() {
    m.hidden = true;
    document.documentElement.style.overflow = '';
    if (from) from.focus();
  }
  // Click / Enter on a card: open the dialog or visit this page in a new tab.
  function act(el) {
    var p = PJ[+el.dataset.i];
    if (p.a === 'tbc') open(+el.dataset.i, el);
    else if (p.a === 'visit') window.open(location.href, '_blank', 'noopener');
  }
  g.addEventListener('click', function (e) {
    var c = e.target.closest('.pj.a');
    if (c) act(c);
  });
  g.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var c = e.target.closest('.pj.a');
    if (c) {
      e.preventDefault();
      act(c);
    }
  });
  document.getElementById('pmx').onclick = close;
  m.addEventListener('click', function (e) {
    if (e.target === m) close();
  });
  document.addEventListener('keydown', function (e) {
    if (!m.hidden && e.key === 'Escape') close();
  });
})();

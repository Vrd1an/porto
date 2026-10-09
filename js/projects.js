/*
 * projects.js - project cards, hover overlay and the preview dialog.
 * Every card opens a dialog on click: a large screenshot (if the project has one) plus text.
 * Edit the PROJECTS list below:
 *   glow   - hover glow colour ('g' green, 'r' red)      hover  - text over the image on hover
 *   image  - one screenshot (base64, see js/assets-data.js) or null for a text-only dialog
 *   images - [first, second, ...] several screenshots: the dialog gets arrows, a counter and thumbnails,
 *            the card shows the first one with a "N foto" badge
 *   dialog - { kicker, heading, text, visit } ; visit: true adds a "Click to visit" button
 *            that opens this portfolio page in a new tab
 */
(function () {
  'use strict';

  var grid = document.getElementById('pj');
  if (!grid) return;
  var IMAGES = window.__PROJ || {};

  var PROJECTS = [
    {
      category: 'Aplikasi Sekolah • SMAN 2 Cianjur',
      title: 'LMS SMA Negeri 2 Cianjur',
      description:
        'Aplikasi Learning Management System untuk SMA Negeri 2 Cianjur, dengan halaman login terpisah untuk guru &amp; admin dan siswa.',
      tags: ['LMS', 'Web App'],
      glow: 'g',
      hover: 'To be continued',
      images: [IMAGES['lms-guru'], IMAGES['lms-siswa']],
      dialog: {
        kicker: 'LMS SMA Negeri 2 Cianjur',
        heading: 'To be continued',
        text: 'Aplikasi ini masih dalam tahap pengembangan dan pengujian untuk SMA Negeri 2 Cianjur. Demo publik dan dokumentasi lengkapnya belum dapat ditampilkan, dan akan dirilis setelah proyek selesai.',
      },
    },
    {
      category: 'Skripsi • DLH Cianjur',
      title: 'SIG Kelayakan TPS Kab. Cianjur',
      description:
        'Sistem informasi geografis berbasis web untuk mengklasifikasi kelayakan lokasi TPS dengan algoritma C4.5.',
      tags: ['Laravel', 'MySQL', 'QGIS'],
      glow: 'g',
      hover: 'To be continued',
      image: IMAGES.sig,
      dialog: {
        kicker: 'SIG Kelayakan TPS Kab. Cianjur',
        heading: 'To be continued',
        text: 'Proyek ini masih dalam tahap pengembangan dan pengujian, dan dibangun bersama Dinas Lingkungan Hidup Kabupaten Cianjur. Demo publik dan dokumentasi lengkapnya belum dapat ditampilkan, dan akan dirilis setelah proyek selesai.',
      },
    },
    {
      category: 'Web Design',
      title: 'Portfolio Web Designer',
      description:
        'Landing page portofolio dengan kartu ID 3D interaktif, intro animasi, dan navbar liquid glass.',
      tags: ['HTML & CSS', 'Three.js', 'Liquid Glass'],
      glow: 'g',
      hover: 'Click to visit',
      image: IMAGES.portfolio,
      dialog: {
        kicker: 'Web Design',
        heading: 'Portfolio Web Designer',
        text: 'Landing page portofolio dengan kartu ID 3D interaktif, intro animasi, dan navbar liquid glass.',
        visit: true,
      },
    },
    {
      category: 'Sedang dikerjakan',
      title: 'Absensi Siswa',
      description: 'Aplikasi absensi siswa yang masih dalam tahap pengerjaan.',
      tags: ['Work in Progress'],
      glow: 'r',
      hover: 'WIP',
      image: null,
      dialog: {
        kicker: 'Sedang dikerjakan',
        heading: 'WIP',
        text: 'Aplikasi absensi siswa ini masih dalam tahap pengerjaan, sehingga belum ada screenshot yang bisa ditampilkan.',
      },
    },
  ];

  function imagesOf(p) { // a project has `images` (several) or `image` (one) or nothing
    return (p.images || (p.image ? [p.image] : [])).filter(Boolean);
  }

  function card(p, i) {
    var shots = imagesOf(p);
    var thumb = shots.length
      ? '<img alt="Screenshot ' + p.title + '" src="data:image/jpeg;base64,' + shots[0] + '">' +
        (shots.length > 1 ? '<span class="pjn">' + shots.length + ' foto</span>' : '')
      : '<span class="ph wip">WIP</span>';
    var tags = p.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
    return (
      '<div class="c pj a ' + p.glow + '" data-i="' + i + '" role="button" tabindex="0"' +
      ' aria-label="' + p.title + ' — buka pratinjau">' +
      '<span class="pjs">' + thumb + '<span class="pjo">' + p.hover + '</span></span>' +
      '<span class="k">' + p.category + '</span><h3>' + p.title + '</h3>' +
      '<p>' + p.description + '</p><div class="tags">' + tags + '</div></div>'
    );
  }
  grid.innerHTML = PROJECTS.map(card).join('');
  grid.classList.remove('g2', 'g3');
  grid.classList.add(PROJECTS.length % 3 === 1 ? 'g2' : 'g3'); // 4 cards: two rows of two instead of 3 + 1

  /* ---- Preview dialog (one element, refilled for each project) ---- */
  var dlg = document.createElement('div');
  dlg.id = 'pm';
  dlg.hidden = true;
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.setAttribute('aria-labelledby', 'pmt');
  dlg.innerHTML =
    '<div class="pmp" id="pmp"><div class="pmi" id="pmi"><img id="pmg" alt="">' +
    '<button type="button" class="gb gp" id="pmprev" aria-label="Foto sebelumnya">‹</button>' +
    '<button type="button" class="gb gn" id="pmnext" aria-label="Foto berikutnya">›</button><span class="gc" id="pmc"></span></div>' +
    '<div class="gt" id="pmth"></div><span class="k" id="pmk"></span>' +
    '<h3 id="pmt"></h3><p id="pmd"></p>' +
    '<div class="pmb"><button type="button" class="btn p" id="pma">Click to visit</button>' +
    '<button type="button" class="btn" id="pmx">Tutup</button></div></div>';
  document.body.appendChild(dlg);

  var $ = function (id) { return document.getElementById(id); };
  var opener = null;

  var shots = [], shot = 0;

  function showShot(k) {
    shot = (k + shots.length) % shots.length;
    $('pmg').src = 'data:image/jpeg;base64,' + shots[shot];
    $('pmc').textContent = shot + 1 + ' / ' + shots.length;
    [].forEach.call($('pmth').children, function (b, j) { b.classList.toggle('on', j === shot); });
  }

  function open(i, el) {
    var p = PROJECTS[i], multi;
    opener = el;
    shots = imagesOf(p);
    multi = shots.length > 1;
    $('pmi').hidden = !shots.length;
    $('pmp').classList.toggle('wide', shots.length > 0);
    ['pmprev', 'pmnext', 'pmc'].forEach(function (id) { $(id).hidden = !multi; });
    $('pmth').hidden = !multi;
    $('pmth').innerHTML = multi
      ? shots.map(function (s, k) {
          return '<button type="button" aria-label="Foto ' + (k + 1) + '"><img alt="" src="data:image/jpeg;base64,' + s + '"></button>';
        }).join('')
      : '';
    if (shots.length) { $('pmg').alt = 'Pratinjau ' + p.title; showShot(0); }
    $('pmk').textContent = p.dialog.kicker;
    $('pmt').textContent = p.dialog.heading;
    $('pmd').textContent = p.dialog.text;
    $('pma').hidden = !p.dialog.visit;
    dlg.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    $('pmx').focus();
  }

  function close() {
    dlg.hidden = true;
    document.documentElement.style.overflow = '';
    if (opener) opener.focus();
  }

  grid.addEventListener('click', function (e) {
    var el = e.target.closest('.pj');
    if (el) open(+el.dataset.i, el);
  });
  grid.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest('.pj');
    if (!el) return;
    e.preventDefault();
    open(+el.dataset.i, el);
  });
  $('pma').onclick = function () { window.open(location.href, '_blank', 'noopener'); };
  $('pmx').onclick = close;
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  $('pmprev').onclick = function () { showShot(shot - 1); };
  $('pmnext').onclick = function () { showShot(shot + 1); };
  $('pmth').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) showShot([].indexOf.call($('pmth').children, b));
  });
  document.addEventListener('keydown', function (e) {
    if (dlg.hidden) return;
    if (e.key === 'Escape') close();
    else if (shots.length > 1 && e.key === 'ArrowLeft') showShot(shot - 1);
    else if (shots.length > 1 && e.key === 'ArrowRight') showShot(shot + 1);
  });
})();

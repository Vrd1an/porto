/*
 * projects.js - project cards, hover overlay and the preview dialog.
 * Every card opens a dialog on click: a large screenshot (if the project has one) plus text.
 * Edit the PROJECTS list below:
 *   glow   - hover glow colour ('g' green, 'r' red)      hover  - text over the image on hover
 *   image  - screenshot (base64, see js/assets-data.js) or null for a text-only dialog
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

  function card(p, i) {
    var thumb = p.image
      ? '<img alt="Screenshot ' + p.title + '" src="data:image/jpeg;base64,' + p.image + '">'
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

  /* ---- Preview dialog (one element, refilled for each project) ---- */
  var dlg = document.createElement('div');
  dlg.id = 'pm';
  dlg.hidden = true;
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.setAttribute('aria-labelledby', 'pmt');
  dlg.innerHTML =
    '<div class="pmp" id="pmp"><div class="pmi" id="pmi"></div><span class="k" id="pmk"></span>' +
    '<h3 id="pmt"></h3><p id="pmd"></p>' +
    '<div class="pmb"><button type="button" class="btn p" id="pma">Click to visit</button>' +
    '<button type="button" class="btn" id="pmx">Tutup</button></div></div>';
  document.body.appendChild(dlg);

  var $ = function (id) { return document.getElementById(id); };
  var opener = null;

  function open(i, el) {
    var p = PROJECTS[i];
    opener = el;
    $('pmi').innerHTML = p.image
      ? '<img alt="Pratinjau ' + p.title + '" src="data:image/jpeg;base64,' + p.image + '">'
      : '';
    $('pmi').hidden = !p.image;
    $('pmp').classList.toggle('wide', !!p.image);
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
  document.addEventListener('keydown', function (e) {
    if (!dlg.hidden && e.key === 'Escape') close();
  });
})();

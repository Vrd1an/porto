/*
 * app.js - static content, theme toggle, email copy, ID-card photo upload.
 * Change the text of the page here (services, skills, tools) and the e-mail.
 */
(function () {
  'use strict';

  var CONFIG = {
    email: 'emailkamu@contoh.com', // copied by the "Salin Email" button
  };

  var CONTENT = {
    services: [
      ['Web Design', 'Merancang tampilan halaman yang bersih, konsisten, dan sesuai identitas brand.'],
      ['UI/UX Design', 'Riset alur pengguna, wireframe, dan prototipe sebelum masuk ke visual akhir.'],
      ['Responsive Layout', 'Tata letak yang nyaman di ponsel, tablet, dan desktop.'],
      ['Handoff ke Developer', 'Design system, aset, dan spesifikasi yang siap diimplementasikan.'],
    ],
    hardSkills: ['Web Design', 'UI/UX Design', 'Wireframing & Prototyping', 'Design System', 'Responsive Design', 'Tipografi & Warna'],
    tools: ['Figma', 'HTML & CSS', 'JavaScript', 'Laravel', 'Canva', 'Git & GitHub'],
  };

  function $(id) {
    return document.getElementById(id);
  }

  function tagsHtml(list) {
    return list.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('');
  }

  function renderContent() {
    $('svc').innerHTML = CONTENT.services
      .map(function (s) { return '<div class="c"><h3>' + s[0] + '</h3><p>' + s[1] + '</p></div>'; })
      .join('');
    $('hs').innerHTML = tagsHtml(CONTENT.hardSkills);
    $('tl').innerHTML = tagsHtml(CONTENT.tools);
  }

  /* Light/dark theme: starts from the OS setting, toggled by the navbar button. */
  function setupTheme() {
    var root = document.documentElement;
    var dark = matchMedia('(prefers-color-scheme: dark)').matches;
    function apply() {
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      $('th').textContent = dark ? 'Mode Terang' : 'Mode Gelap';
    }
    apply();
    $('th').onclick = function () {
      dark = !dark;
      apply();
    };
  }

  function setupEmailCopy() {
    var btn = $('cp');
    btn.onclick = function () {
      try { navigator.clipboard.writeText(CONFIG.email); } catch (e) {}
      btn.textContent = 'Tersalin';
      setTimeout(function () { btn.textContent = 'Salin Email'; }, 1500);
    };
  }

  /* "Ganti foto" button: reads the chosen image and hands it to the 3D card (card3d.src.js). */
  function setupPhotoUpload() {
    $('pb').onclick = function () { $('fi').click(); };
    $('fi').onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        if (window.setPhoto) window.setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    };
  }

  renderContent();
  setupTheme();
  setupEmailCopy();
  setupPhotoUpload();
})();

# Portofolio Ferdian — Web Designer

Landing page portofolio: kartu ID 3D interaktif, intro gelombang/bulge, navbar liquid glass,
sertifikat PDF dengan pratinjau, dan timeline "sacred timeline".

## Menjalankan
Buka `index.html` langsung di browser (aset sudah tertanam di `js/assets-data.js`),
atau pakai Live Server / hosting statis. Efek liquid glass dan bulge butuh browser Chromium
(Chrome, Edge, Brave); di browser lain halaman tetap jalan dengan tampilan yang lebih sederhana.

## Struktur
```
index.html            struktur halaman + urutan pemuatan skrip
css/style.css         seluruh gaya (diberi judul bagian)
js/boot.js            status intro sebelum halaman tampil
js/app.js             teks layanan/skill/tools, tema gelap-terang, salin email, ganti foto
js/certificates.js    kartu sertifikat + dialog pratinjau + tombol unduh
js/projects.js        kartu proyek, efek hover, dialog "To be continued"
js/timeline.js        timeline kanvas (cabang petir, animasi idle)
js/nav-lens.js        lensa liquid glass yang berpindah antar tombol navbar
js/nav-glass.js       distorsi liquid glass pada navbar saat scroll
js/intro.js           intro: gelombang, bulge halaman, reveal elemen
js/card3d.src.js      kartu ID 3D (sumber) -> js/card3d.bundle.js (hasil build)
js/assets-data.js     DIHASILKAN oleh tools/build_assets.py (jangan diedit manual)
assets/               berkas asli: model 3D, sertifikat (PDF + JPG), screenshot proyek
tools/                build_assets.py, build_single.py
```

## Mengubah isi
- **Teks halaman**: `index.html` (hero, About, Biodata) dan `js/app.js` (layanan, skill, tools). Email: `CONFIG.email` di `js/app.js`.
- **Proyek**: daftar `PJ` di `js/projects.js` (judul, tag, aksi klik, warna hover, teks hover).
- **Timeline**: daftar `ST` di `js/timeline.js` (teks tiap tahap; yang masih `[kurung]` perlu diisi).
- **Sertifikat / screenshot baru**:
  1. Taruh PDF di `assets/certificates/` beserta pratinjau JPG halaman 1 dengan nama yang sama
     (`pdftoppm -jpeg -scale-to-x 1100 -scale-to-y -1 -singlefile file.pdf file`).
  2. Tambahkan baris di `CERTIFICATES` pada `tools/build_assets.py` (judul, penerbit, tahun, nama berkas unduhan).
  3. Jalankan `python3 tools/build_assets.py`.

## Build
```
npm install
npm run build:card     # js/card3d.src.js -> js/card3d.bundle.js
npm run build:assets   # js/assets-data.js dari folder assets/
npm run build:single   # dist/portfolio.html (satu berkas, semua tertanam)
```

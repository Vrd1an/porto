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
js/experience.js      Edukasi & Pengalaman: teks menempel, foto berputar 3D vertikal saat scroll
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
- **Proyek**: daftar `PROJECTS` di `js/projects.js` (judul, tag, warna hover, teks hover, isi dialog; `image: null` = dialog hanya teks; `images: [..]` = beberapa screenshot dengan panah dan thumbnail).
- **Pengalaman (teks menempel + foto 3D)**: daftar `STAGES` di `js/experience.js`. Satu objek = satu pengalaman
  (`category`, `year`, `title`, `subtitle`, `text`, `photos`). Selama bagian ini di-scroll, teks tetap di tempat dan
  foto berputar seperti carousel vertikal 3D; setelah foto terakhir, scroll halaman berlanjut seperti biasa.
  Panjang scroll mengikuti jumlah foto. Pengalaman tanpa foto otomatis mendapat satu kartu judul berwarna (hapus objek itu dari `STAGES` kalau tidak diinginkan).
  Foto ditampilkan utuh (tidak dipotong, potret maupun lanskap) di depan salinan buramnya.
  Warna tiap kategori ada di `HUES` (kategori baru otomatis berwarna ungu).
  Foto: taruh file di `assets/timeline/`, lalu daftarkan path-nya:
  ```js
  photos: ['assets/timeline/kkn-1.jpg']                                  // 1 foto
  photos: ['assets/timeline/kkn-1.jpg', 'assets/timeline/kkn-2.jpg']     // beberapa foto: tiap foto satu "slide"
  photos: [{ src: 'assets/timeline/kkn-1.jpg', caption: 'Penyerahan alat' }] // dengan keterangan
  photos: []                                                             // tanpa foto = satu kartu judul
  ```
  Klik foto yang di depan untuk tampilan besar (panah, thumbnail, keyboard ← → Esc); klik foto di samping untuk melompat ke sana.
  Path salah tidak merusak halaman: slide itu menjadi kartu judul dan peringatan muncul di console browser.
  Pengguna "reduce motion" melihat daftar biasa tanpa efek 3D.
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

# Muh. Faudzan Irfan — Portfolio

Portofolio frontend dengan Next.js App Router dan REST API Express, keduanya menggunakan JavaScript. Profil, proyek, keahlian, testimoni, sosial, CV, dan pesan kontak disimpan di SQLite melalui Prisma dan dikelola dari `/admin`.

## Menjalankan secara lokal

Gunakan Node.js 22.12 atau lebih baru dan npm. Jalankan backend dan frontend di terminal terpisah.

```bash
cd backend
npm install
npm run dev
```

Startup pertama membuat `backend/.env` dengan secret dan password acak, menjalankan migration, lalu mengisi konten contoh. Kredensial admin ada pada `ADMIN_EMAIL` dan `ADMIN_PASSWORD` dalam file tersebut.

```bash
cd frontend
npm install
npm run dev
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:4000

Untuk menentukan kredensial awal sendiri, salin `backend/.env.example` menjadi `.env` sebelum menjalankan backend. Isi `JWT_SECRET` minimal 48 karakter acak dan `ADMIN_PASSWORD` minimal 16 karakter. Frontend memakai default lokal; salin `frontend/.env.example` menjadi `.env.local` bila perlu mengubah alamat layanan.

`npm run setup` pada backend menyiapkan database dan seed. `npm run seed` dapat dijalankan kembali setelah setup: konten dan akun yang sudah ada tidak ditimpa. Mengubah password pada `.env` tidak mengubah password akun yang sudah tersimpan.

## Mengelola konten

Login di `/admin`, kemudian pilih Proyek, Keahlian, Testimoni, Profil saya, Media sosial, atau Pesan masuk. Pada layar kecil, navigasi tersedia melalui pilihan **Buka bagian**.

Form menyediakan upload gambar, pratinjau, tombol simpan, serta peringatan saat meninggalkan perubahan yang belum disimpan. Proyek baru mendapatkan slug dari judul; mengubah judul proyek lama tidak mengubah alamatnya. Testimoni hanya tampil publik setelah berstatus `published`. URL CV, demo, dan repository dapat diisi melalui admin; tombolnya muncul ketika URL tersedia.

Pesan kontak tersimpan di inbox, dapat ditandai sudah dibaca atau dihapus. Pengiriman email otomatis belum tersedia.

## Konfigurasi

| Aplikasi | Variabel | Kegunaan |
| --- | --- | --- |
| Backend | `DATABASE_URL` | SQLite; `file:./dev.db` relatif ke direktori Prisma |
| Backend | `PORT` | Port API, default `4000` |
| Backend | `FRONTEND_URL` | Origin frontend untuk CORS dan pemeriksaan mutasi, tanpa slash akhir |
| Backend | `PUBLIC_API_URL` | URL publik API |
| Backend | `JWT_SECRET` | Secret JWT, minimal 48 karakter |
| Backend | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Kredensial seed pertama |
| Backend | `NODE_ENV` | `development`, `test`, atau `production` |
| Backend | `TRUST_PROXY` | Jumlah proxy tepercaya di depan Express, default `0` |
| Frontend | `API_URL` | URL API yang dijangkau server Next.js |
| Frontend | `NEXT_PUBLIC_API_URL` | URL API yang dijangkau browser |
| Frontend | `NEXT_PUBLIC_SITE_URL` | URL website untuk metadata dan sitemap |

Nilai `NEXT_PUBLIC_*` masuk ke build frontend. Build ulang setelah mengubahnya. Jangan commit `.env`, database, atau upload pengguna; ketiganya dikecualikan melalui `.gitignore`.

## Struktur

```text
backend/
  prisma/             Model, migration, dan seed
  scripts/            Setup environment lokal
  src/controllers/    Auth dan endpoint publik
  src/middleware/     Cookie, autentikasi, Origin, dan error
  src/routes/         Endpoint admin
  src/services/       Prisma client dan schema Zod
  tests/              Pengujian API
frontend/
  public/samples/     Ilustrasi proyek contoh
  src/app/            Halaman, metadata, sitemap, dan state
  src/components/     UI publik dan admin
  src/lib/            Klien API dan definisi form admin
  tests/              Pengujian helper admin
```

## API

Semua endpoint berikut menggunakan prefix `/api`. Mutasi memerlukan header `Origin` yang cocok dengan `FRONTEND_URL`; endpoint admin memerlukan cookie sesi.

| Metode | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/portfolio` | Konten publik dan testimoni published |
| GET | `/projects/:slug` | Detail proyek |
| POST | `/contact` | Mengirim pesan |
| POST | `/auth/login`, `/auth/logout` | Memulai atau mengakhiri sesi |
| GET | `/auth/me` | Memeriksa sesi |
| GET | `/admin/dashboard` | Ringkasan konten dan pesan |
| GET, PUT | `/admin/profile` | Membaca atau mengubah profil |
| GET, POST | `/admin/{projects,skills,testimonials,socials}` | Daftar atau tambah konten |
| PUT, DELETE | `/admin/{projects,skills,testimonials,socials}/:id` | Ubah atau hapus konten |
| GET | `/admin/messages` | Maksimal 500 pesan terbaru |
| PATCH, DELETE | `/admin/messages/:id` | Status baca atau hapus pesan |
| POST | `/admin/uploads` | Multipart dengan field `image` |

## Desain dan konten contoh

Tema editorial hangat memakai warna kertas, tinta, dan merah bata. Fraunces memberi karakter pada judul, Source Sans 3 menjaga form dan teks tetap mudah dibaca. Font disajikan lokal dari Fontsource. Token warna, ukuran, spasi, dan radius berada di `frontend/src/app/globals.css`. Layout menyesuaikan ponsel hingga desktop, menyediakan fokus keyboard, dan menghormati `prefers-reduced-motion`.

Nama pemilik adalah Muh. Faudzan Irfan. Deskripsi, lokasi, ketersediaan, dan pengalaman pada seed masih berupa contoh yang perlu disesuaikan. Warung Harian adalah konsep website menu warung makan; Kriya Lokal adalah konsep katalog UMKM. Gambar SVG menggambarkan konsep, bukan produk yang sudah diluncurkan. Skills berfokus pada HTML/CSS, JavaScript, React/Next.js, responsive design, dan accessibility, dengan penjelasan pemakaian tanpa persentase kemampuan.

Testimoni contoh disimpan sebagai draft. Ganti tautan sosial contoh sebelum publikasi dan gunakan testimoni asli dengan izin pemiliknya. Konten portofolio, label navigasi, CTA, dan footer dapat diubah dari admin; label sistem dan validasi berada di kode antarmuka.

## Database dan keamanan

SQLite membuat setup lokal tidak memerlukan layanan database terpisah. Untuk pindah ke PostgreSQL, ubah provider dan `DATABASE_URL`, buat migration PostgreSQL, lalu uji proses ekspor/impor data. Migration SQLite tidak bisa langsung diterapkan ke PostgreSQL.

Sesi JWT berlaku 8 jam dalam cookie httpOnly dengan SameSite Strict. Password memakai bcrypt cost 12. Backend menggunakan Helmet, CORS terkonfigurasi, pemeriksaan Origin, validasi Zod, dan rate limit: login 10 percobaan per 15 menit per IP; kontak 5 permintaan per 15 menit per IP, ditambah honeypot. Konten disimpan sebagai plain text; tag HTML ditolak dan React melakukan escaping saat render.

Upload menerima JPEG, PNG, atau WebP maksimal 5 MB dan 25 juta piksel. Sharp memeriksa isi file, menghapus metadata melalui encoding ulang, dan menyimpan WebP maksimal 1920 px dengan nama acak. Upload bersifat publik. Menghapus konten tidak otomatis menghapus file gambar karena gambar mungkin masih dipakai konten lain.

## Pemeriksaan dan produksi

Jalankan perintah berikut di masing-masing folder:

```bash
npm run lint
npm test
npm run build
```

Tes backend memakai database sementara yang terpisah dan menghapusnya setelah selesai. Jalankan setup terlebih dahulu untuk menyiapkan Prisma client. Build backend menghasilkan Prisma client dan menjalankan lint; JavaScript dijalankan langsung oleh Node.js. Build frontend tidak memerlukan API aktif, tetapi halaman dinamis memerlukannya saat diakses.

Untuk produksi, jalankan `npm run setup` pada backend, lalu `npm run build` dan `npm start` pada kedua aplikasi. Atur `NODE_ENV=production`, HTTPS, dan origin yang benar. Frontend serta API harus berada pada site yang sama, misalnya `portfolio.example.com` dan `api.example.com`, agar cookie SameSite Strict bekerja. Atur `TRUST_PROXY` sesuai jumlah proxy yang benar.

Database dan direktori `backend/public/uploads` memerlukan penyimpanan persisten dan backup bersama. Setup awal ditujukan untuk satu instance; rate limit berada di memori proses. Beberapa instance membutuhkan database, penyimpanan upload, dan rate-limit store bersama. Inbox membutuhkan paginasi bila volume melampaui 500 pesan.

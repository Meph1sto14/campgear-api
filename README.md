# CampGear API

REST API Backend untuk toko online sederhana perlengkapan camping & outdoor, dibangun menggunakan Node.js, Express.js, dan MongoDB (Mongoose). Proyek ini dikembangkan sebagai bagian dari program magang Gamelab Indonesia — Engineering Division.

## Fitur

- **Autentikasi & Otorisasi** — Register & login dengan JWT, role-based access control (`customer` vs `admin`).
- **Produk & Kategori** — CRUD produk dan kategori (khusus admin untuk create/update/delete), dapat diakses publik untuk read.
- **Keranjang Belanja (Cart)** — Tambah produk, ubah jumlah, hapus item, lihat isi cart milik user yang sedang login.
- **Checkout & Order**
  - Validasi stok sebelum order dibuat.
  - Total harga dihitung ulang di server (tidak mempercayai input client).
  - Snapshot nama & harga produk disimpan di setiap item order, sehingga riwayat pesanan tidak berubah meski harga produk asli diubah admin.
  - Stok berkurang otomatis saat checkout berhasil, dan dikembalikan otomatis jika order dibatalkan atau pembayaran gagal.
  - Order status workflow: `pending → paid → processed → shipped → completed`, dengan `cancelled` sebagai jalur alternatif, divalidasi agar tidak bisa loncat status sembarangan.
- **Review & Rating** — CRUD ulasan produk, hanya oleh user yang sudah login.
- **Webhook Payment Gateway (simulasi)** — Endpoint machine-to-machine dilindungi API Key, dilengkapi rate limiting untuk mencegah penyalahgunaan.
- **Filtering, Sorting, Search, & Pagination** — Tersedia di endpoint daftar produk (berdasarkan kategori, rentang harga, kata kunci, dsb).
- **Soft Delete** — Produk yang dihapus admin diarsipkan (`archived: true`), tidak dihapus permanen dari database.
- **Notifikasi** — Perubahan status order dicatat lewat console log sebagai simulasi notifikasi.
- **Dokumentasi API** — Swagger UI tersedia di `/api-docs`.

## Teknologi

- Node.js & Express.js
- MongoDB & Mongoose
- JWT (`jsonwebtoken`) untuk autentikasi
- `bcryptjs` untuk hashing password
- `express-validator` untuk validasi input
- `express-rate-limit` untuk rate limiting webhook
- `swagger-jsdoc` & `swagger-ui-express` untuk dokumentasi API
- `jest`, `supertest`, `mongodb-memory-server` untuk automated testing

## Struktur Folder

```
campgear-api/
├── config/        # Konfigurasi koneksi database & swagger
├── controller/     # Menerima request, memanggil service, mengirim response
├── service/         # Business logic (perhitungan harga, validasi stok, dsb)
├── model/            # Skema Mongoose untuk tiap collection
├── route/            # Definisi endpoint & pemasangan middleware
├── middleware/     # Autentikasi JWT, API Key, rate limiter, error handler, dll
├── validator/        # Aturan validasi input per resource
├── util/               # Helper (AppError, catchAsync, generateToken, dll)
├── tests/              # Automated testing (Jest + Supertest)
├── seed.js            # Script untuk mengisi data awal (kategori & produk)
├── app.js              # Setup Express app & routing
└── server.js         # Entry point, koneksi DB & menjalankan server
```

## Instalasi

1. Clone repository:
   ```bash
   git clone <url-repository-ini>
   cd campgear-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di root project (lihat bagian [Environment Variable](#environment-variable) di bawah).

## Environment Variable

Buat file `.env` di root project dengan isi berikut (lihat juga `.env.example`):

| Variable          | Deskripsi                                              | Contoh                                    |
|--------------------|---------------------------------------------------------|--------------------------------------------|
| `PORT`             | Port server dijalankan                                  | `3000`                                      |
| `MONGO_URI`        | Connection string MongoDB                                | `mongodb://127.0.0.1:27017/campgear`        |
| `JWT_SECRET`       | Secret key untuk signing JWT                             | `ganti_dengan_string_acak_yang_aman`        |
| `JWT_EXPIRES_IN`   | Masa berlaku token JWT (opsional, default `7d`)          | `7d`                                        |
| `API_KEY_WEBHOOK`  | API Key untuk endpoint webhook payment gateway simulasi   | `ganti_dengan_api_key_acak`                 |

> **Penting:** File `.env` tidak boleh ter-commit ke repository (sudah termasuk dalam `.gitignore`).

## Menjalankan Project

Jalankan MongoDB terlebih dahulu (lokal atau melalui MongoDB Atlas), lalu:

```bash
# Mode development (auto-restart dengan nodemon)
npm run dev

# Mode production
npm start
```

Server berjalan di `http://localhost:3000` (atau sesuai `PORT` di `.env`).

### Mengisi Data Awal (Seed)

Untuk mengisi data kategori & produk contoh (4 kategori, masing-masing 5 produk):

```bash
node seed.js
```

## Cara Testing

Automated testing menggunakan Jest + Supertest + MongoDB in-memory server:

```bash
npm test
```

Testing mencakup skenario autentikasi, checkout (termasuk stok habis), dan webhook.

Selain itu, seluruh endpoint juga sudah diuji manual satu per satu melalui Swagger UI (lihat bagian dokumentasi di bawah) dan didemonstrasikan pada video penjelasan project.

## Dokumentasi API

Setelah server berjalan, dokumentasi API interaktif (Swagger) dapat diakses di:

```
http://localhost:3000/api-docs
```

## Autentikasi & Role

- **Public** — Melihat daftar & detail produk/kategori tanpa login.
- **Customer** (login) — Mengelola cart, checkout, melihat riwayat order sendiri, membuat review.
- **Admin** (login) — CRUD produk & kategori, melihat & mengubah status seluruh order.
- **API Key** — Khusus endpoint webhook, digunakan oleh pihak eksternal (payment gateway simulasi) tanpa perlu login sebagai user, dikirim melalui header `x-api-key`.

## Catatan

Field metadata (`createdBy`, `updatedBy`, `createdAt`, `updatedAt`, `archived`) diterapkan secara konsisten menggunakan format **camelCase** di seluruh collection, mengikuti rekomendasi penamaan field pada brief proyek.

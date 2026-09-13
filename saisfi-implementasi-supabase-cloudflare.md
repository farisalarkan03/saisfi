# Struktur Implementasi Saisfi — Supabase + Cloudflare

## 1. Kenapa kombinasi ini

- **Supabase**: Postgres siap pakai, Auth, Storage, Realtime — cocok buat MVP karena nggak perlu bangun backend dari nol.
- **Cloudflare**: hosting frontend yang cepat secara global (Pages), plus Workers buat logika kecil yang harus jalan di edge — terutama endpoint submit form publik yang butuh validasi/rate-limit sebelum menyentuh database.

Prinsip pembagian tugas: **Supabase = sumber data & auth**, **Cloudflare = pintu masuk & lapisan proteksi/edge logic**.

## 2. Skema database (Supabase Postgres)

```
profiles
  id            uuid (FK -> auth.users.id)
  full_name     text
  avatar_url    text
  plan          text            -- 'free' | 'pro'
  role          text            -- 'admin' | 'user' (default 'user')

forms
  id            uuid PK
  owner_id      uuid (FK -> profiles.id)
  title         text
  description   text
  slug          text unique
  status        text            -- 'draft' | 'published'
  theme         jsonb           -- { accent_color, font, layout, background }
  published_at  timestamptz
  created_at    timestamptz
  updated_at    timestamptz

questions
  id            uuid PK
  form_id       uuid (FK -> forms.id)
  type          text            -- short_text | paragraph | multiple_choice |
                                 -- checkbox | dropdown | date | number | rating | file
  label         text
  hint          text
  required      boolean
  position      int
  options       jsonb           -- array opsi, khusus tipe pilihan

responses
  id            uuid PK
  form_id       uuid (FK -> forms.id)
  submitted_at  timestamptz
  meta          jsonb           -- ip_hash, user_agent

answers
  id            uuid PK
  response_id   uuid (FK -> responses.id)
  question_id   uuid (FK -> questions.id)
  value         jsonb           -- fleksibel sesuai tipe pertanyaan

integrations
  id            uuid PK
  form_id       uuid (FK -> forms.id)
  type          text            -- 'whatsapp' | 'sheets'
  config        jsonb
  enabled       boolean
```

## 3. Row Level Security (RLS)

- `forms`, `questions`: **owner only** untuk SELECT/INSERT/UPDATE/DELETE — dicek lewat `owner_id = auth.uid()`.
- `forms` SELECT publik: view terpisah yang cuma expose kolom aman (`title`, `theme`, `questions`) untuk form dengan `status = 'published'`.
- `responses` dan `answers`: **tidak dibuka untuk INSERT langsung dari client** (anon role). Semua penulisan lewat Cloudflare Worker pakai `service_role` key, supaya bisa validasi & rate-limit dulu sebelum data masuk.
- `responses` SELECT: owner only (lihat data respons form miliknya).
- **Akses admin**: dibuat function `is_admin()` yang cek `role = 'admin'` di tabel `profiles` untuk `auth.uid()` yang sedang login. Semua policy di atas ditambah kondisi `OR is_admin()`, jadi admin bisa baca/kelola semua baris tanpa perlu jadi owner.

## 4. Auth

- Supabase Auth: email/password dulu untuk MVP, magic link atau Google login menyusul.
- Sesi dipegang oleh `supabase-js` di Next.js, dicek lewat middleware untuk rute `/dashboard/**` dan `/builder/**`.

## 5. Storage

- Bucket privat `uploads` di Supabase Storage untuk pertanyaan tipe "unggah file", diakses lewat signed URL.
- Kalau volume file besar & biaya jadi masalah, opsi migrasi ke **Cloudflare R2** di fase lanjut (egress lebih murah).

## 6. Lapisan Cloudflare

**Cloudflare Pages**
- Hosting frontend (Next.js), auto-deploy dari GitHub, preview deploy per pull request.

**Cloudflare Workers**
- `POST /api/submit/:slug` — endpoint publik penerima jawaban form:
  1. Cek token **Cloudflare Turnstile** (anti-bot)
  2. Rate-limit per IP pakai **Cloudflare KV**
  3. Tulis ke `responses` + `answers` lewat Supabase REST/RPC pakai service role key
  4. Kirim job ke dispatcher integrasi
- `dispatch-integrations` — kirim notifikasi WhatsApp (API seperti Fonnte/WA Cloud API) & tulis baris ke Google Sheets. Fase lanjut: pindah ke **Cloudflare Queues** supaya submit form tetap cepat walau API pihak ketiga lambat.

**Cloudflare KV**
- Counter rate-limit per IP/form
- Cache definisi form yang sudah publish, biar render form publik nggak selalu roundtrip ke Supabase

## 7. Struktur folder (monorepo)

```
saisfi/
  apps/
    web/                # Next.js — dashboard, builder, render form publik
  workers/
    submit/             # Cloudflare Worker: terima submission publik
    dispatch/           # Cloudflare Worker: kirim ke WhatsApp/Sheets
  supabase/
    migrations/         # file migrasi SQL
    seed.sql
  packages/
    shared-types/       # TypeScript types dipakai bareng web + workers
```

## 8. Environment variables

| Variable | Dipakai di | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | web | aman diexpose ke client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | dibatasi RLS, aman diexpose |
| `SUPABASE_SERVICE_ROLE_KEY` | worker saja | **jangan pernah** taruh di frontend |
| `TURNSTILE_SECRET` | worker | verifikasi captcha |
| `WA_API_KEY` | worker (dispatch) | provider WhatsApp API |
| `GOOGLE_SHEETS_CREDENTIALS` | worker (dispatch) | service account Sheets API |

## 9. Dua dashboard: Admin vs Pengguna

Satu aplikasi, dua area dengan hak akses berbeda — dibedakan lewat kolom `role` di `profiles` dan dicek di middleware Next.js, bukan dua aplikasi terpisah.

**Struktur rute**
```
/dashboard/**   -> area pengguna biasa (role: user)
/admin/**       -> area admin (role: admin), redirect ke /dashboard kalau bukan admin
```

**Dashboard Pengguna** (`/dashboard`)
- Daftar form milik sendiri + status (draft/published) + jumlah respons
- Builder form (yang sudah kita desain) + panel tema
- Halaman respons per form: tabel jawaban, export CSV
- Pengaturan integrasi per form (WhatsApp, Sheets)
- Pengaturan akun: profil, ganti password, info plan (free/pro)

**Dashboard Admin** (`/admin`)
- Daftar semua pengguna terdaftar — cari, lihat detail, ubah plan, suspend akun
- Daftar semua form di platform (lintas pengguna) — untuk moderasi konten/spam
- Statistik platform: total pengguna, total form, total respons, tren pertumbuhan
- Pengaturan global: kredensial integrasi default, kuota per plan, pengumuman/maintenance mode
- Log aktivitas penting (form dihapus, akun disuspend, dll) untuk audit

**Kenapa dipisah lewat role, bukan subdomain/app terpisah**: lebih cepat dibangun untuk MVP, satu basis kode, satu deploy. Kalau nanti tim admin membesar dan butuh isolasi lebih ketat, baru dipisah jadi app sendiri di `apps/admin`.

## 10. Peta ke fase MVP

**Fase 1 — MVP**
- Supabase (Auth + DB + Storage) + Cloudflare Pages saja
- Submit form publik masih lewat Supabase langsung dengan policy INSERT terbatas (tanpa Worker dulu, biar cepat launch)

**Fase 2 — begitu ada traffic/spam**
- Pindahkan submit form ke Cloudflare Worker
- Tambah Turnstile + rate-limit KV
- Aktifkan integrasi WhatsApp/Sheets lewat Worker + Queues

Alasan urutan ini: jangan bangun proteksi edge sebelum ada masalah nyata (spam, biaya, skala) — fokus dulu ke validasi produk.

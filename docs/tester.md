# API Tester — Modal Pagu SIPD

Halaman untuk menguji konsumsi API `GET /api/v1/sipd-penetapan-apbd/modal` dan melihat bentuk respons datanya (mengacu `docs/modal_sipd.md`).

## Cara pakai

1. Buka **`/dashboard/tester`**.
2. Isi **`kode_sub_kegiatan`** (wajib) — tombol cepat dari daftar sub kegiatan user login tersedia.
3. (Opsional) isi **`kode_skpd`** dan **`tahun`** — jika `kode_skpd` dikosongkan, otomatis diambil dari session user.
4. Klik **Jalankan Request**.

## Yang ditampilkan

- Status HTTP + durasi (ms) + penanda `fallback mock` bila backend offline.
- 3 mode lihat: **Rekapitulasi** (kartu 5 level hierarki × 5 metrik pagu), **Standar Harga** (tabel rincian rekening/SSH/indikator RKBMD), **Raw JSON** (response mentah).
- URL akhir yang dikonsumsi melalui proxy Next.js.
- Error backend asli diteruskan (403 Forbidden untuk PPK tanpa hak sub kegiatan, 404, dll).

## Alur

```
Browser → /api/sipd/penetapan-apbd/modal (proxy + Bearer token session)
                ↓
Laravel /api/v1/sipd-penetapan-apbd/modal?kode_sub_kegiatan=...&kode_skpd=...&tahun=...
```

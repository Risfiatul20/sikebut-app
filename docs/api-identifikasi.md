## API Identifikasi Kebutuhan (dikombinasi dengan Anggaran)

| Method | URI | Fungsi |
|---|---|---|
| GET | `/api/v1/identifikasi-kebutuhan` | List + anggaran nested |
| POST | `/api/v1/identifikasi-kebutuhan` | Buat header + anggaran sekaligus |
| GET | `/api/v1/identifikasi-kebutuhan/{id}` | Detail + anggaran |
| PUT | `/api/v1/identifikasi-kebutuhan/{id}` | Update header + rekonsiliasi anggaran |
| DELETE | `/api/v1/identifikasi-kebutuhan/{id}` | Hapus (anggaran ikut cascade) |

Semua di bawah `auth:sanctum`. `{id}` numeric.

### Query Params (index)

| Param | Perilaku |
|---|---|
| `kode_skpd` | Default = `kode_skpd` user login. **Hanya berlaku di list** — di show/update/delete diabaikan agar tidak bisa melebarkan scope |
| `search` | ILIKE `nama_paket`, `kode_sub_kegiatan` |
| `status_review`, `cara_pengadaan`, `jenis_pengadaan`, `kode_program`, `kode_kegiatan`, `kode_sub_kegiatan` | Exact match |
| `sort_by` | `id` (default), `nama_paket`, `status_review`, `created_at`, `updated_at` |
| `sort_direction` | `desc` (default) / `asc` |
| `per_page` | Default 15, `0` = semua |

### Scoping
1. SKPD otomatis dari user login.
2. Role **PPK** → dibatasi `kode_sub_kegiatan` yang ter-mapping di `dev.user_sub_kegiatan`. Akses record di luar mapping → **404**.
3. Guard tambahan: `kode_skpd=` (string kosong) tidak membuka seluruh data — divalidasi `!== ''` sebelum fallback ke user.

### Request (store)

```json
{
  "nama_paket": "Pengadaan Mebel Sekolah",
  "cara_pengadaan": "Tender",
  "jenis_pengadaan": "Pekerjaan Konstruksi",
  "kode_skpd": "1.01.0.00.0.00.01.0000",
  "kode_klpd": null,
  "kode_program": "1.01.02.1",
  "kode_kegiatan": "1.01.02.1.01",
  "kode_sub_kegiatan": "1.01.02.1.01.0036",
  "status_review": "Draft",
  "waktu_pemanfaatan_awal": "2026-01-05",
  "waktu_pemanfaatan_akhir": "2026-01-20",
  "waktu_pemilihan_awal": "2026-02-01",
  "waktu_pemilihan_akhir": "2026-02-15",
  "waktu_pelaksanaan_kontrak_awal": "2026-03-01",
  "waktu_pelaksanaan_kontrak_akhir": "2026-03-10",
  "waktu_pelaksanaan_pekerjaan_awal": "2026-03-11",
  "waktu_pelaksanaan_pekerjaan_akhir": "2026-09-11",
  "form_data": { "uraian": "Kebutuhan meja kantor", "volume": 10 },
  "catatan_reviewer": null,
  "catatan_reviewer_detail": null,
  "anggaran": [
    { "id_sipd_penetapan": 1, "kode_standar_harga": "SH-001", "pagu": 15000000, "perubahan_standar": null },
    { "id_sipd_penetapan": 2, "pagu": 5000000.5 }
  ]
}
```

Aturan validasi: `nama_paket`, `cara_pengadaan`, `kode_skpd`, `form_data` wajib. `anggaran` wajib, `min:1`. Tiap `anggaran.*.id_sipd_penetapan` wajib + harus ada di `sipd_penetapan_apbd`. Tiap `pagu` wajib, `numeric`, `min:0`. Semua kode FK divalidasi `exists`. Pasangan tanggal divalidasi `after_or_equal` (akhir ≥ awal) untuk 4 kelompok waktu.

`update`: semua field `sometimes`; item `anggaran` boleh bawa `id` untuk update baris lama, tanpa `id` = baris baru, baris yang tidak dikirim = dihapus. `id` milik kebutuhan lain ditolak (tidak masuk daftar milik record ini) → diperlakukan sebagai insert baru, bukan edit lintas record.

### Response

```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "pembuat": { "id": 1, "nama": "Administrator", "username": "admin" },
    "nama_paket": "Pengadaan Mebel Sekolah",
    "cara_pengadaan": "Tender",
    "jenis_pengadaan": "Pekerjaan Konstruksi",
    "status_review": "Draft",
    "kode_klpd": null,
    "kode_skpd": "1.01.0.00.0.00.01.0000",
    "nama_skpd": "DINAS PENDIDIKAN DAN KEBUDAYAAN",
    "kode_program": "1.01.02.1",
    "nama_program": "Program Pendidikan Menengah",
    "kode_kegiatan": "1.01.02.1.01",
    "nama_kegiatan": "Penyelenggaraan Pendidikan Menengah",
    "kode_sub_kegiatan": "1.01.02.1.01.0036",
    "nama_sub_kegiatan": "Pengadaan Mebel Sekolah",
    "waktu_pemanfaatan_awal": "2026-01-05",
    "waktu_pemanfaatan_akhir": "2026-01-20",
    "waktu_pemilihan_awal": "2026-02-01",
    "waktu_pemilihan_akhir": "2026-02-15",
    "waktu_pelaksanaan_kontrak_awal": "2026-03-01",
    "waktu_pelaksanaan_kontrak_akhir": "2026-03-10",
    "waktu_pelaksanaan_pekerjaan_awal": "2026-03-11",
    "waktu_pelaksanaan_pekerjaan_akhir": "2026-09-11",
    "form_data": { "uraian": "Kebutuhan meja kantor", "volume": 10 },
    "catatan_reviewer": null,
    "catatan_reviewer_detail": null,
    "total_pagu": "20000000.50",
    "jumlah_anggaran": 2,
    "anggaran": [
      {
        "id": 1,
        "identifikasi_kebutuhan_id": 1,
        "id_sipd_penetapan": 1,
        "kode_standar_harga": "SH-001",
        "nama_standar_harga": "Kursi Kayu",
        "pagu": "15000000.00",
        "perubahan_standar": null,
        "sipd_penetapan": {
          "kode_sub_unit": "1.01.0.00.0.00.01.0000",
          "kode_sub_kegiatan": "1.01.02.1.01.0036",
          "kode_rekening": "5.2.03.01.001.00010",
          "kode_sumber_dana": "1.02.01",
          "nama_sumber_dana": "PAD",
          "tahun": 2026,
          "pagu_sipd": "15000000.00"
        },
        "created_at": "2026-09-01T02:30:00.000000Z"
      }
    ],
    "created_at": "2026-09-01T02:30:00.000000Z",
    "updated_at": "2026-09-01T02:30:00.000000Z"
  }
}
```

List membungkus array di `data` + `links` + `meta`. `store` → `201` dengan `message`. `total_pagu` dan `pagu` string desimal 2 (hindari presisi float pada angka uang).

### File

| File | Isi |
|---|---|
| `app/Models/IdentifikasiKebutuhan.php` | `hasMany anggaran`, `belongsTo` pembuat/skpd/program/kegiatan/subKegiatan, cast `form_data` + `catatan_reviewer_detail` → array, 8 tanggal → date |
| `app/Models/IdentifikasiKebutuhanAnggaran.php` | `belongsTo` kebutuhan/standarHarga/sipdPenetapan, cast `pagu` → `decimal:2` |
| `app/Http/Requests/IdentifikasiKebutuhan/StoreIdentifikasiKebutuhanRequest.php` | Validasi penuh + nested anggaran |
| `app/Http/Requests/IdentifikasiKebutuhan/UpdateIdentifikasiKebutuhanRequest.php` | Varian `sometimes` + `anggaran.*.id` |
| `app/Http/Resources/IdentifikasiKebutuhanResource.php` | Header + relasi nama + `total_pagu` |
| `app/Http/Resources/IdentifikasiKebutuhanAnggaranResource.php` | Baris anggaran + info SIPD |
| `app/Http/Controllers/Api/IdentifikasiKebutuhanController.php` | `scopedQuery()`, 5 aksi, transaksi DB |
| `tests/Feature/IdentifikasiKebutuhanApiTest.php` | 7 test |

### Yang ditemukan & diperbaiki selama verifikasi
1. **Test bug** (bukan produksi): request kedua dengan `withToken()` dalam satu test masih memakai user ter-cache di guard, sehingga tes scoping PPK sempat lolos palsu (200, seharusnya 404). Diperbaiki dengan `forgetGuards()`.
2. **Assertion tautologis** (`assertDatabaseCount` membandingkan tabel dengan dirinya sendiri) diganti cek jumlah baris anggaran milik record terkait.
3. `SipdPenetapanApbd::query()->find()` tanpa argumen → `first()`.

### Caveat
1. `status_review` bebas nilainya (varchar, tanpa constraint/enum di DB). Endpoint hanya mengisi default `Draft` saat create. Kalau alur review butuh state machine (Draft → Diajukan → Disetujui → Ditolak), perlu ditambahkan validasi + endpoint review.
2. `id_sipd_penetapan` **tidak punya FK constraint** ke `sipd_penetapan_apbd` di database — integritas hanya dijaga validasi API. Menambahkan FK di DB lebih aman.
3. `kode_klpd` juga tanpa FK.
4. Tidak ada filter tanggal (misal rentang pemanfaatan) dan tidak ada agregasi per SKPD — tambah kalau dashboard membutuhkannya.
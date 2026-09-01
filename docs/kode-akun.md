Berikut adalah ringkasan format response dan parameter untuk endpoint **List Data Kode Akun Berjenjang & Indikator RKBMD**:

---

### Endpoint: `GET /api/v1/ref-akun`
- **Header**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Pencarian teks berdasarkan `kode_akun` atau `nama_akun` (*case-insensitive*).
  - `level`: Filter berdasarkan tingkat/level akun (`1`, `2`, `3`, `4`, `5`, dst).
  - `parent`: Filter langsung berdasarkan `parent_kode_akun` tertentu.
  - `b`: Filter boolean untuk `is_belanja_pengadaan` (`true`/`false`).
  - `r`: Filter boolean untuk `is_rkbmd_pengadaan` (`true`/`false`).
  - `h`: Filter boolean untuk `is_rkbmd_pemeliharaan_rehab` (`true`/`false`).
  - `t`: Filter boolean untuk `is_rkbmd_pemeliharaan_rutin` (`true`/`false`).
  - `per_page`: Jumlah item per halaman (default `0` = seluruh data tanpa paginasi).

---

### 1. Response Default (List Seluruh Data / Flat List Berjenjang)
Saat `per_page` tidak dikirim (atau bernilai `0`), response mengembalikan seluruh data dalam array `data`:

```json
{
  "data": [
    {
      "kode": "5",
      "nama": "Belanja",
      "level": 1,
      "parent": null,
      "b": false,
      "r": false,
      "h": false,
      "t": false
    },
    {
      "kode": "5.1",
      "nama": "Belanja Operasi",
      "level": 2,
      "parent": "5",
      "b": false,
      "r": false,
      "h": false,
      "t": false
    },
    {
      "kode": "5.1.02",
      "nama": "Belanja Barang dan Jasa",
      "level": 3,
      "parent": "5.1",
      "b": false,
      "r": false,
      "h": false,
      "t": false
    },
    {
      "kode": "5.1.02.01",
      "nama": "Belanja Barang",
      "level": 4,
      "parent": "5.1.02",
      "b": false,
      "r": false,
      "h": false,
      "t": false
    },
    {
      "kode": "5.1.02.01.01.0024",
      "nama": "Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor",
      "level": 5,
      "parent": "5.1.02.01.01",
      "b": true,
      "r": true,
      "h": false,
      "t": false
    }
  ]
}
```

---

### 2. Response dengan Pagination (`GET /api/v1/ref-akun?per_page=15&page=1`)
Saat `per_page > 0`:

```json
{
  "data": [
    {
      "kode": "5",
      "nama": "Belanja",
      "level": 1,
      "parent": null,
      "b": false,
      "r": false,
      "h": false,
      "t": false
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-akun?page=1",
    "last": "http://localhost:8000/api/v1/ref-akun?page=10",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-akun?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

---

### Pemetaan Flag Indikator RKBMD:
| Key | Tipe Data | Relasi Kolom di DB (`akun_indikator_rkbmd`) | Keterangan |
|---|---|---|---|
| `b` | `boolean` | `is_belanja_pengadaan` | Flag Belanja Pengadaan |
| `r` | `boolean` | `is_rkbmd_pengadaan` | Flag RKBMD Pengadaan |
| `h` | `boolean` | `is_rkbmd_pemeliharaan_rehab` | Flag RKBMD Pemeliharaan/Rehab |
| `t` | `boolean` | `is_rkbmd_pemeliharaan_rutin` | Flag RKBMD Pemeliharaan Rutin |
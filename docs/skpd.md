Berikut adalah ringkasan format response dan parameter untuk endpoint **List SKPD**:

---

### Endpoint: `GET /api/v1/ref-skpd`
- **Header**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Pencarian teks berdasarkan `kode_skpd` atau `nama_skpd` (*case-insensitive*).
  - `is_sub_unit`: Filter data sub-unit (`true` untuk hanya menampilkan sub-unit, `false` untuk SKPD induk).
  - `parent_kode_skpd`: Filter sub-unit berdasarkan kode SKPD induk tertentu.
  - `sort_by`: `kode_skpd` (default), `nama_skpd`, atau `parent_kode_skpd`.
  - `sort_direction`: `asc` (default) atau `desc`.
  - `per_page`: Jumlah data per halaman (default `0` = mengambil seluruh data tanpa paginasi).

---

### 1. Response Default (List Seluruh Data / Dropdown)
Jika `per_page` tidak disertakan (atau bernilai `0`), response mengembalikan seluruh data dalam array `data`:

```json
{
  "data": [
    {
      "kode_skpd": "4.01.0.00.0.00.01.0000",
      "nama_skpd": "SEKRETARIAT DAERAH",
      "parent_kode_skpd": null,
      "is_sub_unit": false
    },
    {
      "kode_skpd": "4.01.0.00.0.00.01.0001",
      "nama_skpd": "Bagian Umum Sekretariat Daerah",
      "parent_kode_skpd": "4.01.0.00.0.00.01.0000",
      "is_sub_unit": true,
      "parent": {
        "kode_skpd": "4.01.0.00.0.00.01.0000",
        "nama_skpd": "SEKRETARIAT DAERAH"
      }
    }
  ]
}
```

---

### 2. Response dengan Pagination (`GET /api/v1/ref-skpd?per_page=15&page=1`)
Jika `per_page > 0`, response dilengkapi metadata paginasi:

```json
{
  "data": [
    {
      "kode_skpd": "1.01.0.00.0.00.01.0000",
      "nama_skpd": "DINAS PENDIDIKAN DAN KEBUDAYAAN",
      "parent_kode_skpd": null,
      "is_sub_unit": false
    },
    {
      "kode_skpd": "1.01.0.00.0.00.01.0002",
      "nama_skpd": "Bidang Pembinaan Sekolah Menengah Pertama",
      "parent_kode_skpd": "1.01.0.00.0.00.01.0000",
      "is_sub_unit": true,
      "parent": {
        "kode_skpd": "1.01.0.00.0.00.01.0000",
        "nama_skpd": "DINAS PENDIDIKAN DAN KEBUDAYAAN"
      }
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-skpd?page=1",
    "last": "http://localhost:8000/api/v1/ref-skpd?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-skpd?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 65
  }
}
```

---

### Keterangan Field:
| Field | Tipe Data | Keterangan |
|---|---|---|
| `kode_skpd` | `string` | Kode referensi SKPD / Sub Unit |
| `nama_skpd` | `string` | Nama lengkap SKPD / Sub Unit |
| `parent_kode_skpd` | `string \| null` | Kode SKPD induk (null jika merupakan SKPD induk) |
| `is_sub_unit` | `boolean` | `true` jika unit merupakan bawahan/sub unit, `false` jika SKPD induk |
| `parent` | `object \| omitted` | Hanya muncul saat `is_sub_unit: true`, berisi `kode_skpd` dan `nama_skpd` dari SKPD induknya |
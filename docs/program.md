### 1. `GET /api/v1/ref-program`
**Header**: `Authorization: Bearer <token>`

**Query Params**:
| Param | Keterangan |
|---|---|
| `search` | Cari by `kode_program` atau `nama_program` |
| `kode_skpd` | Filter otomatis dari `sipd_penetapan_apbd` (jika login user, otomatis diisi) |
| `per_page` | Pagination (0 = semua data) |

**Response**:
```json
{
  "data": [
    {
      "kode_program": "1.01.02.1",
      "nama_program": "Program Pendidikan Menengah",
      "kode_bidang_urusan": "1.01.02",
      "nama_bidang_urusan": "Pendidikan Menengah"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-program?page=1",
    "last": "http://localhost:8000/api/v1/ref-program?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-program?page=2"
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

### 2. `GET /api/v1/ref-kegiatan`
**Header**: `Authorization: Bearer <token>`

**Query Params**:
| Param | Keterangan |
|---|---|
| `search` | Cari by `kode_kegiatan` atau `nama_kegiatan` |
| `kode_program` | Filter berdasarkan program induk |
| `kode_skpd` | Filter otomatis dari `sipd_penetapan_apbd` |
| `per_page` | Pagination (0 = semua data) |

**Response**:
```json
{
  "data": [
    {
      "kode_kegiatan": "1.01.02.1.01",
      "nama_kegiatan": "Penyelenggaraan Pendidikan Menengah",
      "kode_program": "1.01.02.1"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-kegiatan?page=1",
    "last": "http://localhost:8000/api/v1/ref-kegiatan?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-kegiatan?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 15,
    "to": 15,
    "total": 38
  }
}
```

---

### 3. `GET /api/v1/ref-sub-kegiatan`
**Header**: `Authorization: Bearer <token>`

**Query Params**:
| Param | Keterangan |
|---|---|
| `search` | Cari by `kode_sub_kegiatan` atau `nama_sub_kegiatan` |
| `kode_kegiatan` | Filter berdasarkan kegiatan induk |
| `kode_skpd` | Filter otomatis dari `sipd_penetapan_apbd` |
| `per_page` | Pagination (0 = semua data) |

**Response**:
```json
{
  "data": [
    {
      "kode_sub_kegiatan": "1.01.02.1.01.0036",
      "nama_sub_kegiatan": "Pengadaan Mebel Sekolah",
      "kode_kegiatan": "1.01.02.1.01"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-sub-kegiatan?page=1",
    "last": "http://localhost:8000/api/v1/ref-sub-kegiatan?page=8",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-sub-kegiatan?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 8,
    "per_page": 15,
    "to": 15,
    "total": 112
  }
}
```

---

### Keterangan Umum
- **Filter `kode_skpd`**: Jika user login punya `kode_skpd`, akan otomatis aktif. Kirim `kode_skpd` manual untuk override.
- **Jika `per_page=0`**: Response hanya array `data` tanpa `links`/`meta`.
- **Filter hierarki**: `ref-program` → `ref-kegiatan` (filter `kode_program`) → `ref-sub-kegiatan` (filter `kode_kegiatan`). Cascading dropdown.
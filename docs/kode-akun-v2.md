### Endpoint: `GET /api/v1/ref-akun/view`
- **Header**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search`: Pencarian teks berdasarkan `kode_6`, `nama_6`, `nama_5`, `nama_4`, `nama_3`, atau `nama_2`
  - `kode_2`: Filter level 2 (e.g. `5.1.`)
  - `kode_3`: Filter level 3 (e.g. `5.1.01.`)
  - `kode_4`: Filter level 4 (e.g. `5.1.01.01.`)
  - `kode_5`: Filter level 5 (e.g. `5.1.01.01.001.`)
  - `kode_sub_unit` / otomatis `kode_skpd` user login: Filter rekening milik SKPD tertentu via `sipd_penetapan_apbd`
  - `belanja_pengadaan` / `b`: Filter boolean `is_belanja_pengadaan`
  - `rkbmd_pengadaan` / `r`: Filter boolean `is_rkbmd_pengadaan`
  - `pemeliharaan_rehab` / `h`: Filter boolean `is_rkbmd_pemeliharaan_rehab`
  - `pemeliharaan_rutin` / `t`: Filter boolean `is_rkbmd_pemeliharaan_rutin`
  - `per_page`: Jumlah item per halaman (default `0` = seluruh data)

---

### Response (`200 OK`)

```json
{
  "data": [
    {
      "kode_2": "5.1.",
      "nama_2": "BELANJA OPERASI",
      "kode_3": "5.1.01.",
      "nama_3": "Belanja Pegawai",
      "kode_4": "5.1.01.01.",
      "nama_4": "Belanja Gaji dan Tunjangan ASN",
      "kode_5": "5.1.01.01.001.",
      "nama_5": "Belanja Gaji Pokok ASN",
      "kode_6": "5.1.01.01.001.00001",
      "nama_6": "Belanja Gaji Pokok PNS",
      "b": false,
      "r": false,
      "h": false,
      "t": false
    },
    {
      "kode_2": "5.1.",
      "nama_2": "BELANJA OPERASI",
      "kode_3": "5.1.02.",
      "nama_3": "Belanja Barang dan Jasa",
      "kode_4": "5.1.02.01.",
      "nama_4": "Belanja Barang",
      "kode_5": "5.1.02.01.01.",
      "nama_5": "Belanja Alat/Bahan untuk Kegiatan Kantor",
      "kode_6": "5.1.02.01.01.00024",
      "nama_6": "Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor",
      "b": true,
      "r": true,
      "h": false,
      "t": false
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/ref-akun/view?page=1",
    "last": "http://localhost:8000/api/v1/ref-akun/view?page=5",
    "prev": null,
    "next": "http://localhost:8000/api/v1/ref-akun/view?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 68
  }
}
```

---

### Keterangan Field

| Field | Tipe | Keterangan |
|---|---|---|
| `kode_2` s/d `kode_5` | `string \| null` | Kode akun di level 2–5 (induk hirarki) |
| `nama_2` s/d `nama_5` | `string \| null` | Nama akun di level 2–5 |
| `kode_6` | `string` | Kode akun level 6 (akun rekening terakhir) |
| `nama_6` | `string` | Nama akun level 6 |
| `b` | `boolean` | `is_belanja_pengadaan` |
| `r` | `boolean` | `is_rkbmd_pengadaan` |
| `h` | `boolean` | `is_rkbmd_pemeliharaan_rehab` |
| `t` | `boolean` | `is_rkbmd_pemeliharaan_rutin` |

Setiap baris merupakan satu akun level 6 dengan konteks hirarki induknya (level 2–5) ditampilkan sejajar dalam satu baris, sehingga frontend dapat langsung menampilkan tabel tanpa perlu menyusun pohon secara manual.
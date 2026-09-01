## Ringkasan Penggunaan API Modal Pagu SIPD

### Endpoint
- **URL**: `GET /api/v1/sipd-penetapan-apbd/modal`
- **Auth**: `Bearer Token` (`auth:sanctum`)
- **Headers**:
  ```http
  Authorization: Bearer <token>
  Accept: application/json
  ```

---

### Query Parameters

| Parameter | Tipe | Status | Keterangan |
|---|---|---|---|
| `kode_sub_kegiatan` / `subkegiatan` | `string` | **Wajib** | Kode sub kegiatan yang dipilih (contoh: `1.01.02.1.01.0012`). |
| `kode_sub_unit` / `kode_skpd` | `string` | Opsional | Kode sub unit SKPD. Jika tidak dikirim, otomatis memakai `kode_skpd` milik user yang sedang login. |
| `tahun` | `integer` | Opsional | Tahun anggaran penetapan APBD (contoh: `2026`). |

---

### Aturan & Hak Akses
1. **Role PPK**: Sistem otomatis memeriksa apakah `kode_sub_kegiatan` terdaftar pada mapping `dev.user_sub_kegiatan` milik user tersebut. Jika tidak berhak, response mengembalikan `403 Forbidden`.
2. **Konteks Tidak Ditemukan**: Jika data sub kegiatan tidak ada di sub unit tersebut pada `dev.ref_sipd_view`, response mengembalikan `404 Not Found`.

---

### Contoh Pemanggilan

#### 1. cURL
```bash
curl -X GET "http://localhost:8000/api/v1/sipd-penetapan-apbd/modal?kode_sub_kegiatan=1.01.02.1.01.0012&tahun=2026" \
  -H "Authorization: Bearer 1|abcdef123456..." \
  -H "Accept: application/json"
```

#### 2. JavaScript (Fetch / Axios)
```javascript
const response = await axios.get('/api/v1/sipd-penetapan-apbd/modal', {
  params: {
    kode_sub_kegiatan: '1.01.02.1.01.0012',
    tahun: 2026
  },
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

### Penjelasan Output Data Response

Response JSON mengembalikan 2 blok utama:

#### 1. Rekapitulasi Hierarki Anggaran (`skpd`, `sub_unit`, `program`, `kegiatan`, `sub_kegiatan`)
Setiap level menyajikan 5 metrik kalkulasi:
- `total_pagu`: Total seluruh pagu penetapan pada level tersebut.
- `total_pagu_pengadaan`: Total pagu yang memiliki indikator `is_belanja_pengadaan = true`.
- `total_pagu_non_pengadaan`: Total pagu operasional / non-pengadaan (`is_belanja_pengadaan = false`).
- `total_kebutuhan_anggaran`: Akumulasi nominal yang sudah diinput pada tabel `dev.identifikasi_kebutuhan_anggaran`.
- `sisa_pagu_pengadaan`: Selisih (`total_pagu_pengadaan - total_kebutuhan_anggaran`).

#### 2. List Rincian Standar Harga (`standar_harga`)
Daftar seluruh item rekening dan standar harga di bawah sub kegiatan tersebut:
- `id_sipd_penetapan`: ID baris `sipd_penetapan_apbd` (digunakan sebagai referensi saat insert identifikasi kebutuhan).
- `kode_rekening` & `nama_rekening`: Informasi kode akun dan uraian belanja.
- `kode_standar_harga` & `nama_standar_harga`: Informasi SSH / SBU / ASB / HSPK.
- `kode_sumber_dana` & `nama_sumber_dana`: Sumber pendanaan (misal: PAD, DAK, DAU).
- `is_belanja_pengadaan`, `is_rkbmd_pengadaan`, `is_rkbmd_pemeliharaan_rehab`, `is_rkbmd_pemeliharaan_rutin`: Indikator RKBMD.
- `pagu`: Pagu penetapan item bersangkutan.
- `total_kebutuhan_anggaran`: Kebutuhan anggaran yang sudah terpakai untuk item tersebut.
- `sisa_pagu`: Pagu yang masih tersedia (`pagu - total_kebutuhan_anggaran`).
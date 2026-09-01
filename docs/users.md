Ringkasan format request & response dari seluruh endpoint **API User Management**:

---

### 1. List Users / Datatable (`GET /api/v1/users`)
Mendukung query parameter: `search`, `role`, `kode_skpd`, `sort_by`, `sort_direction`, dan `per_page`.

**Response (Status: `200 OK`)**:
```json
{
  "data": [
    {
      "id": 1,
      "nama": "Budi Santoso, S.T.",
      "username": "ppk_umum",
      "role": "PPK",
      "kode_skpd": "4.01.0.00.0.00.01.0000",
      "info": {
        "nip": "198507152010011005",
        "pangkat": "Penata Tingkat I",
        "golongan": "III/d",
        "jabatan": "Pejabat Pembuat Komitmen Bagian Umum",
        "no_hp": "081234567890",
        "email_dinas": "budi.santoso@pemda.go.id"
      },
      "created_at": "2026-08-31T05:00:00.000000Z",
      "skpd": {
        "kode_skpd": "4.01.0.00.0.00.01.0000",
        "nama_skpd": "SEKRETARIAT DAERAH",
        "parent_kode_skpd": null
      },
      "sub_kegiatan": [
        {
          "kode_sub_kegiatan": "1.01.02.1.01.0036",
          "kode_kegiatan": "1.01.02.1.01",
          "nama_sub_kegiatan": "Pengadaan Mebel Sekolah"
        }
      ]
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/users?page=1",
    "last": "http://localhost:8000/api/v1/users?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 1,
    "total": 1
  }
}
```

---

### 2. Create User (`POST /api/v1/users`)

**Request Body**:
```json
{
  "nama": "Budi Santoso, S.T.",
  "username": "ppk_umum",
  "password": "Password123",
  "role": "PPK",
  "kode_skpd": "4.01.0.00.0.00.01.0000",
  "info": {
    "nip": "198507152010011005",
    "pangkat": "Penata Tingkat I",
    "golongan": "III/d",
    "jabatan": "Pejabat Pembuat Komitmen Bagian Umum",
    "no_hp": "081234567890",
    "email_dinas": "budi.santoso@pemda.go.id"
  },
  "sub_kegiatan_ids": [
    "1.01.02.1.01.0036"
  ]
}
```

**Response (Status: `201 Created`)**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "nama": "Budi Santoso, S.T.",
    "username": "ppk_umum",
    "role": "PPK",
    "kode_skpd": "4.01.0.00.0.00.01.0000",
    "info": {
      "nip": "198507152010011005",
      "pangkat": "Penata Tingkat I",
      "golongan": "III/d",
      "jabatan": "Pejabat Pembuat Komitmen Bagian Umum",
      "no_hp": "081234567890",
      "email_dinas": "budi.santoso@pemda.go.id"
    },
    "created_at": "2026-08-31T05:00:00.000000Z",
    "skpd": {
      "kode_skpd": "4.01.0.00.0.00.01.0000",
      "nama_skpd": "SEKRETARIAT DAERAH",
      "parent_kode_skpd": null
    },
    "sub_kegiatan": [
      {
        "kode_sub_kegiatan": "1.01.02.1.01.0036",
        "kode_kegiatan": "1.01.02.1.01",
        "nama_sub_kegiatan": "Pengadaan Mebel Sekolah"
      }
    ]
  }
}
```

---

### 3. Detail User (`GET /api/v1/users/{id}`)

**Response (Status: `200 OK`)**:
```json
{
  "user": {
    "id": 1,
    "nama": "Budi Santoso, S.T.",
    "username": "ppk_umum",
    "role": "PPK",
    "kode_skpd": "4.01.0.00.0.00.01.0000",
    "info": {
      "nip": "198507152010011005",
      "pangkat": "Penata Tingkat I",
      "golongan": "III/d",
      "jabatan": "Pejabat Pembuat Komitmen Bagian Umum",
      "no_hp": "081234567890",
      "email_dinas": "budi.santoso@pemda.go.id"
    },
    "created_at": "2026-08-31T05:00:00.000000Z",
    "skpd": {
      "kode_skpd": "4.01.0.00.0.00.01.0000",
      "nama_skpd": "SEKRETARIAT DAERAH",
      "parent_kode_skpd": null
    },
    "sub_kegiatan": [
      {
        "kode_sub_kegiatan": "1.01.02.1.01.0036",
        "kode_kegiatan": "1.01.02.1.01",
        "nama_sub_kegiatan": "Pengadaan Mebel Sekolah"
      }
    ]
  }
}
```

---

### 4. Update User (`PUT /api/v1/users/{id}`)

**Request Body** (Semua field bersifat optional/`sometimes`):
```json
{
  "nama": "Budi Santoso, S.T., M.M.",
  "info": {
    "jabatan": "PPK Bidang Sarana & Prasarana",
    "no_hp": "081299998888"
  },
  "sub_kegiatan_ids": [
    "1.01.02.1.01.0036",
    "1.01.02.1.03.0001"
  ]
}
```

**Response (Status: `200 OK`)**:
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "nama": "Budi Santoso, S.T., M.M.",
    "username": "ppk_umum",
    "role": "PPK",
    "kode_skpd": "4.01.0.00.0.00.01.0000",
    "info": {
      "nip": "198507152010011005",
      "pangkat": "Penata Tingkat I",
      "golongan": "III/d",
      "jabatan": "PPK Bidang Sarana & Prasarana",
      "no_hp": "081299998888",
      "email_dinas": "budi.santoso@pemda.go.id"
    },
    "created_at": "2026-08-31T05:00:00.000000Z",
    "skpd": {
      "kode_skpd": "4.01.0.00.0.00.01.0000",
      "nama_skpd": "SEKRETARIAT DAERAH",
      "parent_kode_skpd": null
    },
    "sub_kegiatan": [
      {
        "kode_sub_kegiatan": "1.01.02.1.01.0036",
        "kode_kegiatan": "1.01.02.1.01",
        "nama_sub_kegiatan": "Pengadaan Mebel Sekolah"
      },
      {
        "kode_sub_kegiatan": "1.01.02.1.03.0001",
        "kode_kegiatan": "1.01.02.1.03",
        "nama_sub_kegiatan": "Penyediaan Biaya Personil Peserta Didik Nonformal/Kesetaraan"
      }
    ]
  }
}
```

---

### 5. Delete User (`DELETE /api/v1/users/{id}`)

**Response (Status: `200 OK`)**:
```json
{
  "message": "User deleted successfully"
}
```
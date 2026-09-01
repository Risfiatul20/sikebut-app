import { User, SkpdItem, SubKegiatanItem } from "@/types/user"

export const INITIAL_USERS: User[] = [];
export const MOCK_SKPD: SkpdItem[] = [];
export const MOCK_SUB_KEGIATAN: SubKegiatanItem[] = [];

/**
export const MOCK_SKPD: SkpdItem[] = [
  {
    kode_skpd: "4.01.0.00.0.00.01.0000",
    nama_skpd: "SEKRETARIAT DAERAH",
    singkatan: "Setda",
  },
  {
    kode_skpd: "1.03.0.00.0.00.01.0000",
    nama_skpd: "DINAS PEKERJAAN UMUM, PERUMAHAN DAN KAWASAN PERMUKIMAN",
    singkatan: "Dinas PUPR",
  },
  {
    kode_skpd: "1.02.0.00.0.00.01.0000",
    nama_skpd: "DINAS KESEHATAN",
    singkatan: "Dinkes",
  },
  {
    kode_skpd: "1.01.0.00.0.00.01.0000",
    nama_skpd: "DINAS PENDIDIKAN",
    singkatan: "Disdik",
  },
  {
    kode_skpd: "2.16.0.00.0.00.01.0000",
    nama_skpd: "DINAS KOMUNIKASI DAN INFORMATIKA",
    singkatan: "Diskominfo",
  },
  {
    kode_skpd: "4.01.0.00.0.00.02.0000",
    nama_skpd: "BADAN KEUANGAN DAN ASET DAERAH",
    singkatan: "BKAD",
  },
  {
    kode_skpd: "4.02.0.00.0.00.01.0000",
    nama_skpd: "BADAN PERENCANAAN PEMBANGUNAN DAERAH",
    singkatan: "Bappeda",
  },
  {
    kode_skpd: "1.05.0.00.0.00.01.0000",
    nama_skpd: "SATUAN POLISI PAMONG PRAJA",
    singkatan: "Satpol PP",
  },
  {
    kode_skpd: "2.18.0.00.0.00.01.0000",
    nama_skpd: "DINAS KOPERASI, USAHA KECIL DAN MENENGAH",
    singkatan: "Dinkop UKM",
  },
]

export const MOCK_SUB_KEGIATAN: SubKegiatanItem[] = [
  {
    kode_sub_kegiatan: "1.01.02.1.01.0036",
    kode_kegiatan: "1.01.02.1.01",
    nama_sub_kegiatan: "Pengadaan Mebel Sekolah",
  },
  {
    kode_sub_kegiatan: "1.01.02.1.03.0001",
    kode_kegiatan: "1.01.02.1.03",
    nama_sub_kegiatan: "Penyediaan Biaya Personil Peserta Didik Nonformal/Kesetaraan",
  },
  {
    kode_sub_kegiatan: "1.03.02.1.01.0001",
    kode_kegiatan: "1.03.02.1.01",
    nama_sub_kegiatan: "Penyelenggaraan Jalan Kabupaten/Kota",
  },
  {
    kode_sub_kegiatan: "1.03.03.1.01.0002",
    kode_kegiatan: "1.03.03.1.01",
    nama_sub_kegiatan: "Pembangunan Gedung Kantor Pemerintah Daerah",
  },
  {
    kode_sub_kegiatan: "1.02.02.1.01.0005",
    kode_kegiatan: "1.02.02.1.01",
    nama_sub_kegiatan: "Pengadaan Alat Kesehatan Fasilitas Layanan Kesehatan",
  },
  {
    kode_sub_kegiatan: "2.16.02.1.01.0001",
    kode_kegiatan: "2.16.02.1.01",
    nama_sub_kegiatan: "Pengelolaan Pusat Data dan Jaringan Komunikasi",
  },
]

// Sample data matching docs/users.md format
export const INITIAL_USERS: User[] = [
  {
    id: 1,
    nama: "Budi Santoso, S.T.",
    username: "ppk_umum",
    role: "PPK",
    kode_skpd: "4.01.0.00.0.00.01.0000",
    nama_skpd: "SEKRETARIAT DAERAH",
    info: {
      nip: "198507152010011005",
      pangkat: "Penata Tingkat I",
      golongan: "III/d",
      jabatan: "Pejabat Pembuat Komitmen Bagian Umum",
      no_hp: "081234567890",
      email_dinas: "budi.santoso@pemda.go.id",
    },
    created_at: "2026-08-31T05:00:00.000000Z",
    skpd: {
      kode_skpd: "4.01.0.00.0.00.01.0000",
      nama_skpd: "SEKRETARIAT DAERAH",
      parent_kode_skpd: null,
    },
    sub_kegiatan: [
      {
        kode_sub_kegiatan: "1.01.02.1.01.0036",
        kode_kegiatan: "1.01.02.1.01",
        nama_sub_kegiatan: "Pengadaan Mebel Sekolah",
      },
    ],
  },
  {
    id: 2,
    nama: "dr. Siti Rahmawati, Sp.PK",
    username: "siti.verifikator",
    role: "Verifikator",
    kode_skpd: "1.02.0.00.0.00.01.0000",
    nama_skpd: "DINAS KESEHATAN",
    info: {
      nip: "198308222009022004",
      pangkat: "Pembina",
      golongan: "IV/a",
      jabatan: "Ketua Tim Verifikasi Pengadaan Dinkes",
      no_hp: "081234567802",
      email_dinas: "siti.rahmawati@sleman.go.id",
    },
    created_at: "2026-01-12T09:15:00.000000Z",
    skpd: {
      kode_skpd: "1.02.0.00.0.00.01.0000",
      nama_skpd: "DINAS KESEHATAN",
      parent_kode_skpd: null,
    },
    sub_kegiatan: [],
  },
  {
    id: 3,
    nama: "Ir. Hendra Kurniawan, M.Eng.",
    username: "hendra.kepalaopd",
    role: "Kepala OPD",
    kode_skpd: "1.03.0.00.0.00.01.0000",
    nama_skpd: "DINAS PEKERJAAN UMUM, PERUMAHAN DAN KAWASAN PERMUKIMAN",
    info: {
      nip: "197505141999031002",
      pangkat: "Pembina Utama Muda",
      golongan: "IV/c",
      jabatan: "Kepala Dinas PUPR",
      no_hp: "081234567801",
      email_dinas: "hendra.kurniawan@sleman.go.id",
    },
    created_at: "2026-01-10T08:30:00.000000Z",
    skpd: {
      kode_skpd: "1.03.0.00.0.00.01.0000",
      nama_skpd: "DINAS PEKERJAAN UMUM, PERUMAHAN DAN KAWASAN PERMUKIMAN",
      parent_kode_skpd: null,
    },
    sub_kegiatan: [],
  },
  {
    id: 4,
    nama: "Drs. Eko Wahyudi, M.Pd.",
    username: "eko.subunit",
    role: "Kepala Sub Unit",
    kode_skpd: "1.01.0.00.0.00.01.0000",
    nama_skpd: "DINAS PENDIDIKAN",
    info: {
      nip: "198009122005011009",
      pangkat: "Penata Tingkat I",
      golongan: "III/d",
      jabatan: "Kepala Seksi Sarana dan Prasarana SD",
      no_hp: "081234567806",
      email_dinas: "eko.wahyudi@sleman.go.id",
    },
    created_at: "2026-01-25T08:10:00.000000Z",
    skpd: {
      kode_skpd: "1.01.0.00.0.00.01.0000",
      nama_skpd: "DINAS PENDIDIKAN",
      parent_kode_skpd: null,
    },
    sub_kegiatan: [],
  },
  {
    id: 5,
    nama: "Arif Prasetyo, S.Kom.",
    username: "arif.admin",
    role: "Admin",
    kode_skpd: "2.16.0.00.0.00.01.0000",
    nama_skpd: "DINAS KOMUNIKASI DAN INFORMATIKA",
    info: {
      nip: "199204052018011002",
      pangkat: "Penata Muda Tingkat I",
      golongan: "III/b",
      jabatan: "Pranata Komputer Ahli Muda / Admin Sistem",
      no_hp: "081234567805",
      email_dinas: "arif.prasetyo@sleman.go.id",
    },
    created_at: "2026-01-20T14:45:00.000000Z",
    skpd: {
      kode_skpd: "2.16.0.00.0.00.01.0000",
      nama_skpd: "DINAS KOMUNIKASI DAN INFORMATIKA",
      parent_kode_skpd: null,
    },
    sub_kegiatan: [],
  },
]
**/
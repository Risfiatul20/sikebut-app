// Types untuk Hierarki Laporan Tree dari Backend API

export interface LaporanLokasi {
  id?: string
  detail?: string | null
  provinsi?: string | null
  kabupaten?: string | null
  kecamatan?: string | null
  provinsiCode?: string | null
  kabupatenCode?: string | null
  kecamatanCode?: string | null
}

export interface LaporanAnggaranItem {
  id: number
  identifikasi_kebutuhan_id: number
  id_sipd_penetapan: number
  kode_standar_harga: string
  pagu: string | number
  perubahan_standar?: string | null
  created_at?: string
}

export interface LaporanRkbmdPerAnggaranItem {
  mode?: string
  items?: unknown[]
  jenis?: string | null
  kode_rekening?: string
  nama_rekening?: string
  id_sipd_penetapan?: number
  kode_standar_harga?: string
  nama_standar_harga?: string
}

export interface LaporanPaketFormData {
  pdn?: string | null
  lokasi?: LaporanLokasi[] | string[]
  uraian?: string | null
  volume?: number | null
  volume_satuan?: string | null
  spesifikasi?: string | null
  pra_dpa?: string | null
  sumber_dana?: string | null
  usaha_kecil?: string | null
  metode_pengadaan?: string | null
  tersedia_ekatalog?: string | null
  spp_ekonomi?: string | null
  spp_sosial?: string | null
  spp_lingkungan?: string | null
  spp_lanjutan?: string[] | null
  tipe_swakelola?: string | null
  rkbmd_per_anggaran?: LaporanRkbmdPerAnggaranItem[]
  waktu_pemanfaatan_awal?: string | null
  waktu_pemanfaatan_akhir?: string | null
  waktu_pemilihan_awal?: string | null
  waktu_pemilihan_akhir?: string | null
  waktu_pelaksanaan_kontrak_awal?: string | null
  waktu_pelaksanaan_kontrak_akhir?: string | null
  waktu_pelaksanaan_pekerjaan_awal?: string | null
  waktu_pelaksanaan_pekerjaan_akhir?: string | null
  [key: string]: unknown
}

export interface LaporanBackendPaket {
  id: number
  nama_paket: string
  jenis_pengadaan: string | null
  cara_pengadaan: string
  status_review: string
  tahun: number | null
  total_pagu: number
  waktu_pemanfaatan_awal: string | null
  waktu_pemanfaatan_akhir: string | null
  waktu_pemilihan_awal: string | null
  waktu_pemilihan_akhir: string | null
  waktu_pelaksanaan_awal: string | null
  waktu_pelaksanaan_akhir: string | null
  nama_user: string | null
  form_data: LaporanPaketFormData
  anggaran: LaporanAnggaranItem[]
}

export interface LaporanSubKegiatanNode {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  total_pagu: number
  total_paket: number
  pakets: LaporanBackendPaket[]
}

export interface LaporanKegiatanNode {
  kode_kegiatan: string
  nama_kegiatan: string
  total_pagu: number
  total_paket: number
  sub_kegiatans: LaporanSubKegiatanNode[]
}

export interface LaporanProgramNode {
  kode_program: string
  nama_program: string
  total_pagu: number
  total_paket: number
  kegiatans: LaporanKegiatanNode[]
}

export interface LaporanSubUnitNode {
  kode_sub_unit: string
  nama_sub_unit: string
  total_pagu: number
  total_paket: number
  programs: LaporanProgramNode[]
}

export interface LaporanSkpdNode {
  kode_skpd: string
  nama_skpd: string
  total_pagu: number
  total_paket: number
  sub_units: LaporanSubUnitNode[]
}

export interface LaporanTreeResponse {
  status: string
  data: {
    summary: {
      total_skpd: number
      total_paket: number
      total_pagu: number
    }
    tree: LaporanSkpdNode[]
  }
}

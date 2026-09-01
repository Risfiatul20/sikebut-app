export interface SipdItem {
  id: number
  kode_daerah: string
  nama_daerah: string
  tahun: number
  versi: number
  nama_versi: string
  
  // SKPD & Sub Unit
  kode_skpd: string
  nama_skpd: string
  kode_sub_unit: string
  nama_sub_unit: string

  // Urusan & Bidang Urusan
  kode_urusan: string
  nama_urusan: string
  kode_bidang_urusan: string
  nama_bidang_urusan: string

  // Program, Kegiatan, Sub Kegiatan
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string

  // Sumber Dana
  kode_sumber_dana: string
  nama_sumber_dana: string

  // Rekening Belanja
  kode_rekening: string
  nama_rekening: string

  // Standar Harga
  kode_standar_harga: string
  nama_standar_harga: string

  // Pagu
  pagu: number
  created_at: string

  // OPD (dari API /api/v1/sipd-penetapan-apbd)
  kode_opd?: string
  nama_opd?: string

  // Indikator RKBMD rekening terkait
  indikator_rkbmd?: { b: boolean; r: boolean; h: boolean; t: boolean }
}

export interface SipdVersionInfo {
  versi: number
  nama_versi: string
  tahun: number
  total_pagu: number
  total_rincian: number
  tanggal_impor: string
  status: "Aktif" | "Arsip" | "Draft"
}

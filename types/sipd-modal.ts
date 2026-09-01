export interface SipdModalMetrics {
  total_pagu: string
  total_pagu_pengadaan: string
  total_pagu_non_pengadaan: string
  total_kebutuhan_anggaran: string
  sisa_pagu_pengadaan: string
}

export interface SipdModalLevel extends SipdModalMetrics {
  kode_skpd?: string
  nama_skpd?: string
  kode_sub_unit?: string
  nama_sub_unit?: string
  kode_program?: string
  nama_program?: string
  kode_kegiatan?: string
  nama_kegiatan?: string
  kode_sub_kegiatan?: string
  nama_sub_kegiatan?: string
}

export interface SipdStandarHarga {
  id_sipd_penetapan: number
  kode_rekening: string
  nama_rekening: string
  kode_standar_harga: string
  nama_standar_harga: string
  kode_sumber_dana: string
  nama_sumber_dana: string
  is_belanja_pengadaan?: boolean
  is_rkbmd_pengadaan?: boolean
  is_rkbmd_pemeliharaan_rehab?: boolean
  is_rkbmd_pemeliharaan_rutin?: boolean
  pagu: string
  total_kebutuhan_anggaran: string
  sisa_pagu: string
}

export interface SipdModalData {
  skpd: SipdModalLevel
  sub_unit: SipdModalLevel
  program: SipdModalLevel
  kegiatan: SipdModalLevel
  sub_kegiatan: SipdModalLevel
  standar_harga: SipdStandarHarga[]
}

export interface SipdModalApiResponse {
  status: string
  data: SipdModalData
  _mock?: boolean
}

export interface PaketLaporanRow {
  id: number
  nama_paket: string
  jenis_pengadaan: string | null
  status_review: string
  kode_skpd: string
  nama_skpd: string | null
  kode_sub_kegiatan: string
  nama_user: string | null
  created_at: string | null
  updated_at: string | null
  total_pagu: number | string
}

/** Rincian detail per paket — sesuai template Laporan.xlsx (sheet Penyedia/Swakelola). */
export interface RincianPaketRow {
  id: number
  nama_paket: string
  jenis_pengadaan: string | null
  status_review: string
  kode_skpd: string
  nama_skpd: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  nama_user: string
  lokasi: string[]
  volume: number
  volume_satuan: string
  uraian: string
  spesifikasi: string
  pdn: string
  usaha_kecil: string
  spp_ekonomi: string
  spp_sosial: string
  spp_lingkungan: string
  pra_dpa: string
  metode_pengadaan: string
  tersedia_ekatalog: string
  sumber_dana: string
  tipe_swakelola: string
  waktu_pemanfaatan_awal: string | null
  waktu_pemanfaatan_akhir: string | null
  waktu_pemilihan_awal: string | null
  waktu_pemilihan_akhir: string | null
  waktu_pelaksanaan_awal: string | null
  waktu_pelaksanaan_akhir: string | null
  mak: { kode_rekening: string; nama: string; pagu: number }[]
  total_pagu: number
  updated_at: string | null
}

export interface AgregatSkpdRow {
  kode_skpd: string
  nama_skpd: string | null
  jumlah_paket: number
  total_pagu: number | string
}

export interface AgregatJenisRow {
  jenis_pengadaan: string | null
  jumlah_paket: number
  total_pagu: number | string
}

export interface AgregatStatusRow {
  status_review: string
  jumlah_paket: number
}

export interface LaporanPaketResponse {
  data: {
    cara_pengadaan: string
    summary: {
      total_paket: number
      total_pagu: number
      total_skpd: number
    }
    per_skpd: AgregatSkpdRow[]
    per_jenis: AgregatJenisRow[]
    per_status: AgregatStatusRow[]
    paket: PaketLaporanRow[]
    rincian: RincianPaketRow[]
  }
}

/** Baris paket pada Berita Acara Pembahasan (dengan catatan pembahasan). */
export interface BaPaketRow {
  id: number
  nama_paket: string
  jenis_pengadaan: string | null
  status_review: string
  kode_skpd: string
  nama_skpd: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  nama_user: string
  pagu: number
  belanja_pengadaan: number
  belanja_non_pengadaan: number
  catatan_pembahasan: string
  updated_at: string | null
}

export interface BaPembahasanResponse {
  data: {
    cara_pengadaan: string
    summary: {
      total_paket: number
      total_pagu: number
    }
    paket: BaPaketRow[]
  }
}

/** Baris paket pada BA Catatan RKBMD. */
export interface BaRkbmdPaketRow {
  id: number
  nama_paket: string
  jenis_pengadaan: string | null
  status_review: string
  kode_skpd: string
  nama_skpd: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  nama_user: string
  jumlah_item: number
  total_unit: number
  items: { nama_barang: string; jumlah: number; satuan: string }[]
  catatan_pembahasan: string
  updated_at: string | null
}

export interface BaRkbmdResponse {
  data: {
    tipe: string
    summary: {
      total_paket: number
      total_barang: number
      total_unit: number
    }
    paket: BaRkbmdPaketRow[]
  }
}
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
  }
}

export interface BaPembahasanResponse {
  data: {
    cara_pengadaan: string
    summary: {
      total_paket: number
      total_pagu: number
    }
    paket: PaketLaporanRow[]
  }
}

export interface RkbmdItemRow {
  id: number
  kode_skpd: string
  nama_skpd: string | null
  nama_barang: string
  jumlah_barang: number
  satuan: string | null
  kode_sub_kegiatan: string | null
}

export interface BaRkbmdResponse {
  data: {
    tipe: string
    summary: {
      total_skpd: number
      total_barang: number
    }
    per_skpd: AgregatSkpdRow[]
    items: RkbmdItemRow[]
  }
}
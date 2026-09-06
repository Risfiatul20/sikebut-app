export interface RkbmdPengadaanItem {
  id_pengadaan: number
  id_instansi?: number
  id_renja?: number
  kode_skpd: string
  nama_skpd: string
  kode_sub_skpd?: string
  nama_sub_skpd?: string
  kode_program: string
  nama_program: string
  kode_giat: string
  nama_giat_nama_giat: string
  kode_sub_giat: string
  nama_sub_giat_nama_sub_giat: string
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  jumlah_maksimum: number
  cara_pemenuhan: string
  keterangan: string
  id_status?: number
  nm_status: string
  periode: number
  created_at?: string
}

export interface RkbmdPemeliharaanItem {
  id_pemeliharaan: number
  id_instansi?: number
  id_renja?: number
  kode_skpd: string
  nama_skpd: string
  kode_sub_skpd?: string
  nama_sub_skpd?: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_giat_nama_giat: string
  kode_sub_kegiatan: string
  nama_sub_giat_nama_sub_giat: string
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  kondisi_b: number
  kondisi_rr: number
  kondisi_rb: number
  nama_pemeliharaan: string
  jumlah_pemeliharaan: number
  satuan_pemeliharaan: string
  keterangan: string
  id_status?: number
  nm_status: string
  periode: number
  created_at?: string
}

export interface RkbmdImportResponse {
  success: boolean
  message: string
  import_id: string
}

export interface RkbmdImportStatus {
  success: boolean
  status: "processing" | "completed" | "failed"
  file_name: string
  error_message?: string | null
  updated_at: string
}

export type RkbmdType = "pengadaan" | "pemeliharaan"

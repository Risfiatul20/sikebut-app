export interface DashboardPaketTerbaru {
  id: number
  nama_paket: string
  status_review: string
  jenis_pengadaan: string | null
  cara_pengadaan: string
  created_at: string
  updated_at: string
  nama_user: string | null
  nama_skpd: string | null
}

export interface DashboardSummary {
  total_paket: number
  total_pagu_paket: number
  perlu_review: number
  paket_per_status: Record<string, number>
  paket_per_jenis: Record<string, number>
  paket_per_cara: Record<string, number>
  paket_terbaru: DashboardPaketTerbaru[]
}

export interface DashboardSummaryResponse {
  data: DashboardSummary
}

export interface DashboardKeterisianPpk {
  user_id: number
  username: string
  nama: string
  total_sub_kegiatan: number
  total_pagu_apbd: number
  jumlah_paket: number
  total_pagu_paket: number
  keterisian_persen: number
  tahun: number
}

export interface DashboardKeterisianPpkResponse {
  data: DashboardKeterisianPpk[]
}
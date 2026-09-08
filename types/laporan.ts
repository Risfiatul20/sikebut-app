export type LaporanLevelType = "opd" | "sub_unit" | "program" | "kegiatan" | "sub_kegiatan"

export interface LaporanRekapNode {
  id: string
  no?: string
  kode: string
  nama: string
  level: 1 | 2 | 3 | 4 | 5
  type: LaporanLevelType
  pagu: number
  belanjaNonPengadaan: number
  belanjaPengadaan: number
  
  // Identifikasi Kebutuhan
  identifikasi: {
    jumlah: {
      paket: number
      pagu: number
    }
    penyedia: {
      paket: number
      pagu: number
    }
    swakelola: {
      paket: number
      pagu: number
    }
  }

  // Persentase atau nilai keterisian
  keterisian: number // 0 - 100

  // Hierarki anak
  children?: LaporanRekapNode[]
}

export interface LaporanRekapResponse {
  status: string
  data: {
    tahun: number
    summary: {
      total_pagu: number
      total_pengadaan: number
      total_non_pengadaan: number
      total_paket: number
      total_pagu_paket: number
    }
    tree: LaporanRekapNode[]
  }
}

// Data agregat per grup pada laporan kebutuhan (dari backend /api/v1/laporan/kebutuhan)
export interface LaporanKebutuhanGroup {
  kode: string
  nama: string
  total: number
  count: number
  pengadaan?: number
}

export interface LaporanKebutuhanResponse {
  status: string
  data: {
    tahun: number
    summary: {
      total_pagu: number
      total_pengadaan: number
      total_rincian: number
      total_skpd: number
      total_program: number
      total_sumber_dana: number
    }
    versi_list: { versi: string }[]
    skpd: LaporanKebutuhanGroup[]
    program: LaporanKebutuhanGroup[]
    sumber_dana: LaporanKebutuhanGroup[]
  }
}

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

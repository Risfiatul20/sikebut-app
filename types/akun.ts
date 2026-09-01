export interface AkunItem {
  kode: string
  nama: string
  level: number
  parent: string | null
  b: boolean // is_belanja_pengadaan
  r: boolean // is_rkbmd_pengadaan
  h: boolean // is_rkbmd_pemeliharaan_rehab
  t: boolean // is_rkbmd_pemeliharaan_rutin
}

export interface RefAkunPaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface RefAkunListResponse {
  data: AkunItem[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: RefAkunPaginationMeta
}

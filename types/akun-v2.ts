export interface AkunViewItem {
  kode_2: string | null
  nama_2: string | null
  kode_3: string | null
  nama_3: string | null
  kode_4: string | null
  nama_4: string | null
  kode_5: string | null
  nama_5: string | null
  kode_6: string
  nama_6: string
  b: boolean // is_belanja_pengadaan
  r: boolean // is_rkbmd_pengadaan
  h: boolean // is_rkbmd_pemeliharaan_rehab
  t: boolean // is_rkbmd_pemeliharaan_rutin
}

export interface RefAkunViewPaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface RefAkunViewListResponse {
  data: AkunViewItem[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: RefAkunViewPaginationMeta
}

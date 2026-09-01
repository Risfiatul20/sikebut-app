export interface RefSkpdParent {
  kode_skpd: string
  nama_skpd: string
}

export interface RefSkpd {
  kode_skpd: string
  nama_skpd: string
  parent_kode_skpd: string | null
  is_sub_unit: boolean
  parent?: RefSkpdParent
}

export interface RefSkpdPaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface RefSkpdListResponse {
  data: RefSkpd[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: RefSkpdPaginationMeta
}

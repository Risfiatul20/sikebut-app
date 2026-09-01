export interface UserInfo {
  nip?: string
  pangkat?: string
  golongan?: string
  jabatan?: string
  no_hp?: string
  email_dinas?: string
  [key: string]: unknown
}

export type UserRole = "Admin" | "Kepala OPD" | "Kepala Sub Unit" | "PPK" | "Verifikator"

export interface SkpdItem {
  kode_skpd: string
  nama_skpd: string
  parent_kode_skpd?: string | null
  singkatan?: string
}

export interface SubKegiatanItem {
  kode_sub_kegiatan: string
  kode_kegiatan: string
  nama_sub_kegiatan: string
}

export interface User {
  id: number
  kode_skpd: string | null
  nama_skpd?: string | null // computed or from skpd
  skpd?: SkpdItem | null
  sub_kegiatan?: SubKegiatanItem[] | null
  // Legacy / convenience fields
  kode_sub_kegiatan?: string | null
  nama_sub_kegiatan?: string | null
  nama: string
  username: string
  role: UserRole
  info: UserInfo | null
  created_at: string
}

export interface UserPaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface UserPaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface UserListResponse {
  data: User[]
  links: UserPaginationLinks
  meta: UserPaginationMeta
}

export interface UserSingleResponse {
  message?: string
  user: User
}

export interface CreateUserPayload {
  nama: string
  username: string
  password?: string
  role: UserRole
  kode_skpd?: string | null
  info?: UserInfo | null
  sub_kegiatan_ids?: string[]
}

export interface UpdateUserPayload {
  id?: number
  nama?: string
  username?: string
  password?: string
  role?: UserRole
  kode_skpd?: string | null
  info?: UserInfo | null
  sub_kegiatan_ids?: string[]
}

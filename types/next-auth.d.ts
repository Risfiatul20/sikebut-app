import "next-auth"
import "next-auth/jwt"
import type { DefaultSession } from "next-auth"

export interface AuthUserInfo {
  nip?: string
  pangkat?: string
  golongan?: string
  jabatan?: string
  no_hp?: string
  email_dinas?: string
  [key: string]: unknown
}

export interface AuthSubKegiatan {
  kode_sub_kegiatan: string
  kode_kegiatan: string
  nama_sub_kegiatan: string
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      username?: string
      apiToken?: string
      role?: string
      kodeSkpd?: string
      namaSkpd?: string
      info?: AuthUserInfo
      subKegiatan?: AuthSubKegiatan[]
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    username?: string
    apiToken?: string
    role?: string
    kodeSkpd?: string
    namaSkpd?: string
    info?: AuthUserInfo
    subKegiatan?: AuthSubKegiatan[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    apiToken?: string
    role?: string
    kodeSkpd?: string
    namaSkpd?: string
    info?: AuthUserInfo
    subKegiatan?: AuthSubKegiatan[]
  }
}

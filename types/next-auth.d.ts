import "next-auth"
import "next-auth/jwt"
import "@auth/core"
import "@auth/core/jwt"
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

export interface AuthProgram {
  kode_program: string
  nama_program: string
  kode_bidang_urusan?: string
  nama_bidang_urusan?: string
  [key: string]: unknown
}

export interface AuthKegiatan {
  kode_kegiatan: string
  nama_kegiatan: string
  kode_program?: string
  [key: string]: unknown
}

export interface AuthSubKegiatan {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  kode_kegiatan?: string
  [key: string]: unknown
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
      subkegiatans?: AuthSubKegiatan[]
      kegiatans?: AuthKegiatan[]
      programs?: AuthProgram[]
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
    subkegiatans?: AuthSubKegiatan[]
    kegiatans?: AuthKegiatan[]
    programs?: AuthProgram[]
  }
}

declare module "@auth/core/types" {
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
      subkegiatans?: AuthSubKegiatan[]
      kegiatans?: AuthKegiatan[]
      programs?: AuthProgram[]
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
    subkegiatans?: AuthSubKegiatan[]
    kegiatans?: AuthKegiatan[]
    programs?: AuthProgram[]
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
    subkegiatans?: AuthSubKegiatan[]
    kegiatans?: AuthKegiatan[]
    programs?: AuthProgram[]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string
    username?: string
    apiToken?: string
    role?: string
    kodeSkpd?: string
    namaSkpd?: string
    info?: AuthUserInfo
    subKegiatan?: AuthSubKegiatan[]
    subkegiatans?: AuthSubKegiatan[]
    kegiatans?: AuthKegiatan[]
    programs?: AuthProgram[]
  }
}

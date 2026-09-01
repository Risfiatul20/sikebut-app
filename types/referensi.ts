export interface ProgramRef {
  kode_program: string
  nama_program: string
  kode_bidang_urusan: string
  nama_bidang_urusan: string
}

export interface KegiatanRef {
  kode_kegiatan: string
  nama_kegiatan: string
  kode_program: string
}

export interface SubKegiatanRef {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  kode_kegiatan: string
}

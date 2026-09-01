export type CaraPengadaan = "Penyedia" | "Swakelola"
export type JenisPengadaan = "Barang" | "Konstruksi" | "Jasa Lainnya" | "Konsultansi"
export type YaTidak = "Ya" | "Tidak"
export type BanyakTerbatas = "Banyak" | "Terbatas"
export type MetodePengadaan = "ePurchasing" | "Tender" | "Pengadaan Langsung" | "Seleksi" | "Penunjukan Langsung" | "Swakelola"
export type TipeSwakelola = "Tipe I" | "Tipe II" | "Tipe III" | "Tipe IV"
export type KondisiBarang = "Baik" | "Rusak Ringan" | "Rusak Berat"
export type Prioritas = "Tinggi" | "Sedang" | "Kecil"
export type Kompleksitas = "Kompleks" | "Sederhana"
export type JenisPenyedia = "Perorangan" | "Badan Usaha"
export type MetodeOperasi = "Otomatis" | "Manual"
export type StatusReview = "Draft" | "Menunggu Review" | "Disetujui" | "Ditolak"

export interface WilayahItem {
  code: string
  name: string
}

export interface WilayahResponse {
  data: WilayahItem[]
  meta: {
    administrative_area_level: number
    updated_at: string
  }
}

export interface LokasiItem {
  id: string
  provinsi: string
  provinsiCode: string
  kabupaten: string
  kabupatenCode: string
  kecamatan: string
  kecamatanCode: string
  detail: string
}

export interface PaguPaketItem {
  id: string
  id_sipd_penetapan: number
  kode_standar_harga: string
  nama_standar_harga: string
  kode_rekening: string
  nama_rekening: string
  pagu_sipd: number
  pagu_tertagih: number
  rencana_pagu_paket: number
}

export interface FormIdentitas {
  kode_skpd: string
  nama_skpd: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  cara_pengadaan: CaraPengadaan
  jenis_pengadaan: JenisPengadaan | ""
}

export interface FormBarang {
  nama_paket: string
  fungsi_kegunaan: string
  uraian: string
  spesifikasi: string
  volume: number
  volume_satuan: "Unit" | "Paket" | "Set" | "Pcs" | "Lot"
  pdn: YaTidak
  usaha_kecil: YaTidak
  pra_dpa: YaTidak
  spp_ekonomi: YaTidak
  spp_sosial: YaTidak
  spp_lingkungan: YaTidak
  lokasi: LokasiItem[]
  waktu_pemanfaatan_awal: string
  waktu_pemanfaatan_akhir: string
  waktu_pemilihan_awal: string
  waktu_pemilihan_akhir: string
  waktu_pelaksanaan_kontrak_awal: string
  waktu_pelaksanaan_kontrak_akhir: string
  waktu_pelaksanaan_pekerjaan_awal: string
  waktu_pelaksanaan_pekerjaan_akhir: string
  metode_pengadaan: MetodePengadaan | ""
  tersedia_ekatalog: YaTidak
  sumber_dana: string
  jumlah_dibutuhkan: number
  jumlah_sejenis: number
  kondisi_baik: number
  kondisi_rusak_ringan: number
  kondisi_rusak_berat: number
  mudah_pasaran: YaTidak
  produsen: BanyakTerbatas
  kriteria_barang: string[]
  persyaratan_tkdn: YaTidak
  nilai_tkdn: number
  cara_pengiriman: string
  cara_operasi: MetodeOperasi
  pelatihan: YaTidak
  spp_lanjutan: string[]
  pengadaan_sejenis: YaTidak
  indikasi_konsolidasi: YaTidak
}

export interface FormKonstruksi {
  nama_paket: string
  fungsi: string
  target_sasaran: string
  uraian: string
  spesifikasi: string
  volume: number
  volume_satuan: "Unit" | "Paket" | "Lot"
  pdn: YaTidak
  usaha_kecil: YaTidak
  pra_dpa: YaTidak
  spp_ekonomi: YaTidak
  spp_sosial: YaTidak
  spp_lingkungan: YaTidak
  lokasi: LokasiItem[]
  waktu_pemanfaatan_awal: string
  waktu_pemanfaatan_akhir: string
  waktu_pemilihan_awal: string
  waktu_pemilihan_akhir: string
  waktu_pelaksanaan_kontrak_awal: string
  waktu_pelaksanaan_kontrak_akhir: string
  waktu_pelaksanaan_pekerjaan_awal: string
  waktu_pelaksanaan_pekerjaan_akhir: string
  metode_pengadaan: MetodePengadaan | ""
  tersedia_ekatalog_produk: YaTidak
  tersedia_ekatalog_material: YaTidak
  penggunaan_barang_dn: number
  penggunaan_barang_ln: number
  prioritas: Prioritas | ""
  studi_kelayakan: YaTidak
  dokumen_ded: YaTidak
  kompleksitas: Kompleksitas | ""
  kontrak_tahun_jamak: YaTidak
  jumlah_tahun_jamak: number
  izin_kontrak_jamak: YaTidak
  nomor_izin_jamak: string
  usaha_kecil_dapat: YaTidak
  sumber_dana: string
  pembebasan_lahan: YaTidak
  luas_lahan: number
  izin_pemanfaatan_tanah: YaTidak
  lama_pengurusan_lahan: number
  status_pembayaran_ganti_rugi: YaTidak
  pengadaan_sejenis: YaTidak
  indikasi_konsolidasi: YaTidak
}

export interface FormJasaLainnya {
  nama_paket: string
  kebutuhan_rutin: YaTidak
  fungsi_kegunaan: string
  kompetensi_teknis: string
  sumberdaya_dimiliki: string
  jumlah_pelaku: BanyakTerbatas
  uraian: string
  spesifikasi: string
  volume: number
  volume_satuan: "Unit" | "Paket" | "Set" | "Lot"
  pdn: YaTidak
  usaha_kecil: YaTidak
  pra_dpa: YaTidak
  spp_ekonomi: YaTidak
  spp_sosial: YaTidak
  spp_lingkungan: YaTidak
  lokasi: LokasiItem[]
  waktu_pemanfaatan_awal: string
  waktu_pemanfaatan_akhir: string
  waktu_pemilihan_awal: string
  waktu_pemilihan_akhir: string
  waktu_pelaksanaan_kontrak_awal: string
  waktu_pelaksanaan_kontrak_akhir: string
  waktu_pelaksanaan_pekerjaan_awal: string
  waktu_pelaksanaan_pekerjaan_akhir: string
  metode_pengadaan: MetodePengadaan | ""
  tersedia_ekatalog: YaTidak
  sumber_dana: string
  pengadaan_sejenis: YaTidak
  indikasi_konsolidasi: YaTidak
}

export interface FormKonsultansi {
  nama_paket: string
  target_sasaran: string
  uraian: string
  spesifikasi: string
  jenis_penyedia: JenisPenyedia | ""
  jumlah_pelaku: BanyakTerbatas
  volume: number
  volume_satuan: "Unit" | "Paket" | "Lot"
  pdn: YaTidak
  usaha_kecil: YaTidak
  pra_dpa: YaTidak
  spp_ekonomi: YaTidak
  spp_sosial: YaTidak
  spp_lingkungan: YaTidak
  lokasi: LokasiItem[]
  waktu_pemanfaatan_awal: string
  waktu_pemanfaatan_akhir: string
  waktu_pemilihan_awal: string
  waktu_pemilihan_akhir: string
  waktu_pelaksanaan_kontrak_awal: string
  waktu_pelaksanaan_kontrak_akhir: string
  waktu_pelaksanaan_pekerjaan_awal: string
  waktu_pelaksanaan_pekerjaan_akhir: string
  metode_pengadaan: MetodePengadaan | ""
  tersedia_ekatalog: YaTidak
  sumber_dana: string
  pengadaan_sejenis: YaTidak
  indikasi_konsolidasi: YaTidak
}

export interface FormSwakelola {
  nama_paket: string
  uraian_pekerjaan: string
  spesifikasi_pekerjaan: string
  tipe_swakelola: TipeSwakelola | ""
  lokasi: LokasiItem[]
  waktu_awal: string
  waktu_akhir: string
  sumber_dana: string
}

export type FormDataFields =
  | FormBarang
  | FormKonstruksi
  | FormJasaLainnya
  | FormKonsultansi
  | FormSwakelola

export interface IdentifikasiKebutuhan {
  id: number
  user_id: number
  nama_user: string
  kode_skpd: string
  nama_skpd: string
  kode_program: string
  nama_program: string
  kode_kegiatan: string
  nama_kegiatan: string
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  cara_pengadaan: CaraPengadaan
  jenis_pengadaan: JenisPengadaan | null
  nama_paket: string
  waktu_pemanfaatan_awal: string | null
  waktu_pemanfaatan_akhir: string | null
  waktu_pemilihan_awal: string | null
  waktu_pemilihan_akhir: string | null
  waktu_pelaksanaan_kontrak_awal: string | null
  waktu_pelaksanaan_kontrak_akhir: string | null
  waktu_pelaksanaan_pekerjaan_awal: string | null
  waktu_pelaksanaan_pekerjaan_akhir: string | null
  status_review: StatusReview
  form_data: FormDataFields
  catatan_reviewer: string | null
  created_at: string
  updated_at: string
  anggaran: AnggaranItem[]
}

export interface AnggaranItem {
  id: number
  identifikasi_kebutuhan_id: number
  id_sipd_penetapan: number
  kode_standar_harga: string
  nama_standar_harga: string
  kode_rekening: string
  nama_rekening: string
  pagu: number
  created_at: string
}

// Registry field per jenis pengadaan — sumber tunggal untuk merender detail lengkap
// dan catatan per-field verifikator (disimpan di catatan_reviewer_detail JSONB).
// Key field = key di form_data; label mengikuti penjelasan.docx & step-form-*.tsx.

export type FieldKind =
  | "text" // teks biasa
  | "number" // angka
  | "yatidak" // Ya / Tidak
  | "banyakterbatas" // Banyak / Terbatas
  | "multi" // array string (join koma)
  | "volume" // volume + satuan
  | "persen" // nilai % (mis. TKDN, penggunaan DN/LN)
  | "rkbmdlist" // daftar item RKBMD teridentifikasi (array)

export interface FieldDef {
  key: string
  label: string
  kind: FieldKind
}

export interface FieldSection {
  title: string
  fields: FieldDef[]
}

const text: FieldKind = "text"
const number: FieldKind = "number"
const yatidak: FieldKind = "yatidak"
const banyakterbatas: FieldKind = "banyakterbatas"
const multi: FieldKind = "multi"
const volume: FieldKind = "volume"
const persen: FieldKind = "persen"
const rkbmdlist: FieldKind = "rkbmdlist"

// ---------------------------------------------------------------------------
// Barang (penjelasan.docx Tabel 2–6)
// ---------------------------------------------------------------------------
const BARANG_SECTIONS: FieldSection[] = [
  {
    title: "Identitas & Spesifikasi",
    fields: [
      { key: "nama_paket", label: "Nama Paket", kind: text },
      { key: "fungsi_kegunaan", label: "Fungsi/Kegunaan", kind: text },
      { key: "uraian", label: "Uraian Pekerjaan", kind: text },
      { key: "spesifikasi", label: "Spesifikasi Pekerjaan", kind: text },
      { key: "volume", label: "Volume", kind: volume },
      { key: "metode_pengadaan", label: "Metode Pengadaan", kind: text },
      { key: "sumber_dana", label: "Sumber Dana", kind: text },
    ],
  },
  {
    title: "Persyaratan Pengadaan",
    fields: [
      { key: "pdn", label: "PDN (Produk Dalam Negeri)", kind: yatidak },
      { key: "usaha_kecil", label: "Pengadaan Usaha Kecil", kind: yatidak },
      { key: "pra_dpa", label: "Pra DPA", kind: yatidak },
      { key: "spp_ekonomi", label: "SPP — Aspek Ekonomi", kind: yatidak },
      { key: "spp_sosial", label: "SPP — Aspek Sosial", kind: yatidak },
      { key: "spp_lingkungan", label: "SPP — Aspek Lingkungan", kind: yatidak },
      { key: "tersedia_ekatalog", label: "Tersedia di e-Katalog LKPP", kind: yatidak },
    ],
  },
  {
    title: "Identifikasi Barang Tersedia (RKBMD)",
    fields: [
      { key: "jumlah_dibutuhkan", label: "Jumlah Barang Dibutuhkan (unit)", kind: number },
      { key: "jumlah_sejenis", label: "Jumlah Barang Sejenis Tersedia (unit)", kind: number },
      { key: "kondisi_baik", label: "Kondisi Baik (unit)", kind: number },
      { key: "kondisi_rusak_ringan", label: "Kondisi Rusak Ringan (unit)", kind: number },
      { key: "kondisi_rusak_berat", label: "Kondisi Rusak Berat (unit)", kind: number },
      { key: "rkbmd_items", label: "Daftar Item Teridentifikasi (RKBMD)", kind: rkbmdlist },
    ],
  },
  {
    title: "Pasar & TKDN",
    fields: [
      { key: "mudah_pasaran", label: "Mudah Diperoleh di Pasaran Indonesia", kind: yatidak },
      { key: "produsen", label: "Produsen/Pelaku Usaha Mampu & Memenuhi Syarat", kind: banyakterbatas },
      { key: "kriteria_barang", label: "Kriteria Barang", kind: multi },
      { key: "persyaratan_tkdn", label: "Persyaratan Barang Memiliki Nilai TKDN", kind: yatidak },
      { key: "nilai_tkdn", label: "Nilai TKDN", kind: persen },
    ],
  },
  {
    title: "Pengiriman & Operasional",
    fields: [
      { key: "cara_pengiriman", label: "Cara Pengiriman", kind: text },
      { key: "cara_pengangkutan", label: "Cara Pengangkutan", kind: text },
      { key: "cara_pemasangan", label: "Cara Pemasangan", kind: text },
      { key: "cara_penimbunan", label: "Cara Penimbunan/Penyimpanan", kind: text },
      { key: "cara_operasi", label: "Cara Pengoperasian/Penggunaan", kind: text },
      { key: "pelatihan", label: "Kebutuhan Pelatihan Operasional", kind: yatidak },
      { key: "spp_lanjutan", label: "Aspek SPP Lanjutan", kind: multi },
    ],
  },
  {
    title: "Konsolidasi",
    fields: [
      { key: "pengadaan_sejenis", label: "Ada Pengadaan Sejenis di Kegiatan Lain", kind: yatidak },
      { key: "indikasi_konsolidasi", label: "Indikasi Konsolidasi Pengadaan", kind: yatidak },
    ],
  },
]

// ---------------------------------------------------------------------------
// Konstruksi (penjelasan.docx Tabel 7–10)
// ---------------------------------------------------------------------------
const KONSTRUKSI_SECTIONS: FieldSection[] = [
  {
    title: "Identitas & Spesifikasi",
    fields: [
      { key: "nama_paket", label: "Nama Paket", kind: text },
      { key: "fungsi", label: "Fungsi/Kegunaan", kind: text },
      { key: "target_sasaran", label: "Target/Sasaran yang Akan Dicapai", kind: text },
      { key: "uraian", label: "Uraian Pekerjaan", kind: text },
      { key: "spesifikasi", label: "Spesifikasi Pekerjaan", kind: text },
      { key: "volume", label: "Volume", kind: volume },
      { key: "metode_pengadaan", label: "Metode Pengadaan", kind: text },
      { key: "sumber_dana", label: "Sumber Dana", kind: text },
    ],
  },
  {
    title: "Persyaratan Pengadaan",
    fields: [
      { key: "pdn", label: "PDN (Produk Dalam Negeri)", kind: yatidak },
      { key: "usaha_kecil", label: "Pengadaan Usaha Kecil", kind: yatidak },
      { key: "pra_dpa", label: "Pra DPA", kind: yatidak },
      { key: "spp_ekonomi", label: "SPP — Aspek Ekonomi", kind: yatidak },
      { key: "spp_sosial", label: "SPP — Aspek Sosial", kind: yatidak },
      { key: "spp_lingkungan", label: "SPP — Aspek Lingkungan", kind: yatidak },
      { key: "tersedia_ekatalog_produk", label: "Produk Tersedia di e-Katalog", kind: yatidak },
      { key: "tersedia_ekatalog_material", label: "Material Tersedia di e-Katalog", kind: yatidak },
    ],
  },
  {
    title: "Penggunaan Barang/Material",
    fields: [
      { key: "penggunaan_barang_dn", label: "Penggunaan Barang Dalam Negeri", kind: persen },
      { key: "penggunaan_barang_ln", label: "Penggunaan Barang Luar Negeri", kind: persen },
    ],
  },
  {
    title: "Perencanaan & Kompleksitas",
    fields: [
      { key: "prioritas", label: "Prioritas Kebutuhan", kind: text },
      { key: "studi_kelayakan", label: "Studi Kelayakan Dilaksanakan", kind: yatidak },
      { key: "dokumen_ded", label: "Dokumen Detailed Engineering Design (DED)", kind: yatidak },
      { key: "kompleksitas", label: "Kompleksitas Pekerjaan", kind: text },
    ],
  },
  {
    title: "Kontrak & Usaha Kecil",
    fields: [
      { key: "kontrak_tahun_jamak", label: "Kontrak Tahun Jamak (Multi Years)", kind: yatidak },
      { key: "jumlah_tahun_jamak", label: "Jumlah Tahun Pelaksanaan", kind: number },
      { key: "izin_kontrak_jamak", label: "Izin Tertulis Kontrak Tahun Jamak", kind: yatidak },
      { key: "nomor_izin_jamak", label: "Nomor Surat Izin", kind: text },
      { key: "usaha_kecil_dapat", label: "Dapat Dilaksanakan oleh Usaha Kecil", kind: yatidak },
    ],
  },
  {
    title: "Lahan & Perizinan",
    fields: [
      { key: "pembebasan_lahan", label: "Kebutuhan Pembebasan Lahan", kind: yatidak },
      { key: "luas_lahan", label: "Luas Lahan/Tanah (m²)", kind: number },
      { key: "izin_pemanfaatan_tanah", label: "Kebutuhan Izin Pemanfaatan Tanah", kind: yatidak },
      { key: "lama_pengurusan_lahan", label: "Lama Waktu Pengurusan (bulan)", kind: number },
      { key: "status_pembayaran_ganti_rugi", label: "Administrasi Pembayaran Ganti Rugi", kind: yatidak },
    ],
  },
  {
    title: "Identifikasi Barang Tersedia (RKBMD)",
    fields: [
      { key: "jumlah_dibutuhkan", label: "Jumlah Barang Dibutuhkan (unit)", kind: number },
      { key: "jumlah_sejenis", label: "Jumlah Barang Sejenis Tersedia (unit)", kind: number },
      { key: "kondisi_baik", label: "Kondisi Baik (unit)", kind: number },
      { key: "kondisi_rusak_ringan", label: "Kondisi Rusak Ringan (unit)", kind: number },
      { key: "kondisi_rusak_berat", label: "Kondisi Rusak Berat (unit)", kind: number },
      { key: "rkbmd_items", label: "Daftar Item Teridentifikasi (RKBMD)", kind: rkbmdlist },
    ],
  },
  {
    title: "Konsolidasi",
    fields: [
      { key: "pengadaan_sejenis", label: "Ada Pengadaan Sejenis di Kegiatan Lain", kind: yatidak },
      { key: "indikasi_konsolidasi", label: "Indikasi Konsolidasi Pengadaan", kind: yatidak },
    ],
  },
]

// ---------------------------------------------------------------------------
// Jasa Lainnya (penjelasan.docx Tabel 11)
// ---------------------------------------------------------------------------
const JASA_SECTIONS: FieldSection[] = [
  {
    title: "Identitas & Spesifikasi",
    fields: [
      { key: "nama_paket", label: "Nama Paket", kind: text },
      { key: "kebutuhan_rutin", label: "Kebutuhan Rutin Tahunan", kind: yatidak },
      { key: "fungsi_kegunaan", label: "Fungsi/Kegunaan", kind: text },
      { key: "kompetensi_teknis", label: "Kompetensi/Spesifikasi Teknis", kind: text },
      { key: "sumberdaya_dimiliki", label: "Sumber Daya Tersedia/Dimiliki", kind: text },
      { key: "jumlah_pelaku", label: "Jumlah Pelaku Usaha Mampu & Memenuhi Syarat", kind: banyakterbatas },
      { key: "uraian", label: "Uraian Pekerjaan", kind: text },
      { key: "spesifikasi", label: "Spesifikasi Pekerjaan", kind: text },
      { key: "volume", label: "Volume", kind: volume },
      { key: "metode_pengadaan", label: "Metode Pengadaan", kind: text },
      { key: "sumber_dana", label: "Sumber Dana", kind: text },
    ],
  },
  {
    title: "Persyaratan Pengadaan",
    fields: [
      { key: "pdn", label: "PDN (Produk Dalam Negeri)", kind: yatidak },
      { key: "usaha_kecil", label: "Pengadaan Usaha Kecil", kind: yatidak },
      { key: "pra_dpa", label: "Pra DPA", kind: yatidak },
      { key: "spp_ekonomi", label: "SPP — Aspek Ekonomi", kind: yatidak },
      { key: "spp_sosial", label: "SPP — Aspek Sosial", kind: yatidak },
      { key: "spp_lingkungan", label: "SPP — Aspek Lingkungan", kind: yatidak },
      { key: "tersedia_ekatalog", label: "Tersedia di e-Katalog LKPP", kind: yatidak },
    ],
  },
  {
    title: "Konsolidasi",
    fields: [
      { key: "pengadaan_sejenis", label: "Ada Pengadaan Sejenis di Kegiatan Lain", kind: yatidak },
      { key: "indikasi_konsolidasi", label: "Indikasi Konsolidasi Pengadaan", kind: yatidak },
    ],
  },
]

// ---------------------------------------------------------------------------
// Konsultansi (penjelasan.docx Tabel 12)
// ---------------------------------------------------------------------------
const KONSULTANSI_SECTIONS: FieldSection[] = [
  {
    title: "Identitas & Spesifikasi",
    fields: [
      { key: "nama_paket", label: "Nama Paket", kind: text },
      { key: "target_sasaran", label: "Target/Sasaran yang Diharapkan", kind: text },
      { key: "jenis_penyedia", label: "Jenis Penyedia", kind: text },
      { key: "jumlah_pelaku", label: "Jumlah Pelaku Usaha Mampu & Memenuhi Syarat", kind: banyakterbatas },
      { key: "uraian", label: "Uraian Pekerjaan", kind: text },
      { key: "spesifikasi", label: "Spesifikasi Pekerjaan", kind: text },
      { key: "volume", label: "Volume", kind: volume },
      { key: "metode_pengadaan", label: "Metode Pengadaan", kind: text },
      { key: "sumber_dana", label: "Sumber Dana", kind: text },
    ],
  },
  {
    title: "Persyaratan Pengadaan",
    fields: [
      { key: "pdn", label: "PDN (Produk Dalam Negeri)", kind: yatidak },
      { key: "usaha_kecil", label: "Pengadaan Usaha Kecil", kind: yatidak },
      { key: "pra_dpa", label: "Pra DPA", kind: yatidak },
      { key: "spp_ekonomi", label: "SPP — Aspek Ekonomi", kind: yatidak },
      { key: "spp_sosial", label: "SPP — Aspek Sosial", kind: yatidak },
      { key: "spp_lingkungan", label: "SPP — Aspek Lingkungan", kind: yatidak },
      { key: "tersedia_ekatalog", label: "Tersedia di e-Katalog LKPP", kind: yatidak },
    ],
  },
  {
    title: "Konsolidasi",
    fields: [
      { key: "pengadaan_sejenis", label: "Ada Pengadaan Sejenis di Kegiatan Lain", kind: yatidak },
      { key: "indikasi_konsolidasi", label: "Indikasi Konsolidasi Pengadaan", kind: yatidak },
    ],
  },
]

// ---------------------------------------------------------------------------
// Swakelola (penjelasan.docx Tabel 13)
// ---------------------------------------------------------------------------
const SWAKELOLA_SECTIONS: FieldSection[] = [
  {
    title: "Identitas & Spesifikasi",
    fields: [
      { key: "nama_paket", label: "Nama Paket", kind: text },
      { key: "tipe_swakelola", label: "Tipe Swakelola", kind: text },
      { key: "uraian_pekerjaan", label: "Uraian Pekerjaan", kind: text },
      { key: "spesifikasi_pekerjaan", label: "Spesifikasi Pekerjaan", kind: text },
      { key: "sumber_dana", label: "Sumber Dana", kind: text },
    ],
  },
]

export function getFieldSections(jenis: string | undefined | null): FieldSection[] {
  switch (jenis) {
    case "Barang":
      return BARANG_SECTIONS
    case "Konstruksi":
      return KONSTRUKSI_SECTIONS
    case "Jasa Lainnya":
      return JASA_SECTIONS
    case "Konsultansi":
      return KONSULTANSI_SECTIONS
    case "Swakelola":
      return SWAKELOLA_SECTIONS
    default:
      return []
  }
}

export function formatFieldValue(field: FieldDef, fd: Record<string, unknown>): string | null {
  const v = fd[field.key]
  if (v === undefined || v === null) return null
  switch (field.kind) {
    case "volume": {
      const satuan = fd.volume_satuan
      const vol = Number(v)
      if (!vol) return null
      return `${vol.toLocaleString("id-ID")} ${satuan ? String(satuan) : "Unit"}`
    }
    case "persen": {
      const n = Number(v)
      if (!n && n !== 0) return null
      return `${n}%`
    }
    case "number": {
      const n = Number(v)
      if (!n && n !== 0) return null
      return n.toLocaleString("id-ID")
    }
    case "yatidak":
      return v === "Ya" || v === "Tidak" ? String(v) : null
    case "banyakterbatas":
      return v === "Banyak" || v === "Terbatas" ? String(v) : null
    case "multi": {
      if (!Array.isArray(v) || v.length === 0) return null
      return v.join(", ")
    }
    case "rkbmdlist": {
      if (!Array.isArray(v) || v.length === 0) return null
      const totalUnit = v.reduce((s: number, it) => s + Number((it as { jumlah?: number })?.jumlah || 0), 0)
      return `${v.length} item RKBMD teridentifikasi — total ${totalUnit.toLocaleString("id-ID")} unit`
    }
    default: {
      const s = String(v).trim()
      return s || null
    }
  }
}
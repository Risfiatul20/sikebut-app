// Validasi kelengkapan wizard Identifikasi Kebutuhan Pengadaan.
// Aturan (arahan atasan):
//  - Semua opsi jawaban default kosong + wajib diisi (saat pindah langkah / simpan / submit).
//  - SPP (Ekonomi/Sosial/Lingkungan) & SPP Lanjutan BOLEH kosong.
//  - RKBMD (barang tersedia) boleh kosong — identifikasi opsional.
//  - Lokasi pertama WAJIB, lokasi berikutnya boleh kosong.
//  - Waktu (Pemanfaatan, Pemilihan, Pelaksanaan Kontrak) WAJIB.
//  - Field kondisional (TKDN, tahun jamak, lahan/ganti rugi) tidak dipaksa.

import { getFieldSections } from "./field-registry"

// Error validasi terstruktur — dipakai banner global (page.tsx), highlight per-field,
// dan auto-lompat ke langkah pertama yang bermasalah.
// step: 0 = Identitas, 1 = Form (per jenis), 2 = Review (Pagu Paket).
export interface ValidasiError {
  step: 0 | 1 | 2
  /** Key field di form_data / identitas — acuan highlight per-field. */
  key?: string
  /** Teks yang ditampilkan di banner. */
  label: string
}

const OPSIONAL_KEYS = new Set<string>([
  // SPP — boleh kosong (arahan #13)
  "spp_ekonomi",
  "spp_sosial",
  "spp_lingkungan",
  "spp_lanjutan",
  // Identifikasi RKBMD — boleh kosong
  "rkbmd_items",
  "jumlah_dibutuhkan",
  "jumlah_sejenis",
  "kondisi_baik",
  "kondisi_rusak_ringan",
  "kondisi_rusak_berat",
  // Kondisional — hanya wajib bila kondisi induknya "Ya"
  "nilai_tkdn",
  "jumlah_tahun_jamak",
  "izin_kontrak_jamak",
  "nomor_izin_jamak",
  "luas_lahan",
  "izin_pemanfaatan_tanah",
  "lama_pengurusan_lahan",
  "status_pembayaran_ganti_rugi",
])

const WAKTU_WAJIB: Array<[string, string]> = [
  ["waktu_pemanfaatan_awal", "Waktu Pemanfaatan"],
  ["waktu_pemilihan_awal", "Waktu Pemilihan Penyedia"],
  ["waktu_pelaksanaan_kontrak_awal", "Waktu Pelaksanaan Kontrak"],
]

// Pasangan awal→akhir untuk cek urutan tanggal (akhir tidak boleh sebelum awal).
const WAKTU_PASANGAN: Array<[string, string, string]> = [
  ["waktu_pemanfaatan_awal", "waktu_pemanfaatan_akhir", "Waktu Pemanfaatan"],
  ["waktu_pemilihan_awal", "waktu_pemilihan_akhir", "Waktu Pemilihan Penyedia"],
  ["waktu_pelaksanaan_kontrak_awal", "waktu_pelaksanaan_kontrak_akhir", "Waktu Pelaksanaan Kontrak"],
]

// Swakelola memakai pasangan waktu_awal / waktu_akhir.
const WAKTU_PASANGAN_SWAKELOLA: Array<[string, string, string]> = [
  ["waktu_awal", "waktu_akhir", "Waktu Pelaksanaan Pekerjaan"],
]

/** Parsing nilai waktu (YYYY-MM / YYYY-MM-DD / MM/YYYY / MM-YYYY) → { year, month } | null. */
function parseWaktu(v: unknown): { year: number; month: number } | null {
  if (typeof v !== "string" || !v.trim()) return null
  const str = v.trim()
  let m = /^(\d{4})[-/](\d{1,2})(?:-\d{1,2})?$/.exec(str) // YYYY-MM[-DD] / YYYY/MM
  if (m) return { year: Number(m[1]), month: Number(m[2]) }
  m = /^(\d{1,2})[-/](\d{4})$/.exec(str) // MM/YYYY / MM-YYYY
  if (m) return { year: Number(m[2]), month: Number(m[1]) }
  return null
}

/** Cek pasangan waktu: akhir tidak boleh lebih awal dari awal. */
function cekUrutanWaktu(fd: Record<string, unknown>, pasangan: Array<[string, string, string]>): Array<{ key: string; label: string; pesan: string }> {
  const errs: Array<{ key: string; label: string; pesan: string }> = []
  for (const [keyAwal, keyAkhir, label] of pasangan) {
    const awal = parseWaktu(fd[keyAwal])
    const akhir = parseWaktu(fd[keyAkhir])
    if (!awal || !akhir) continue
    if (akhir.year < awal.year || (akhir.year === awal.year && akhir.month < awal.month)) {
      errs.push({ key: keyAwal, label, pesan: `${label}: tanggal Akhir tidak boleh sebelum tanggal Awal` })
    }
  }
  return errs
}

// Label tambahan untuk key di luar registry (lokasi & waktu di-cek manual).
const LABEL_EXTRA: Record<string, string> = {
  lokasi: "Lokasi (baris pertama)",
  waktu_pemanfaatan_awal: "Waktu Pemanfaatan (awal)",
  waktu_pemilihan_awal: "Waktu Pemilihan Penyedia (awal)",
  waktu_pelaksanaan_kontrak_awal: "Waktu Pelaksanaan Kontrak (awal)",
  waktu_awal: "Waktu Pelaksanaan Pekerjaan (awal)",
}

/** Label human-readable untuk key field (registry per jenis + label ekstra). */
export function labelForKey(jenis: string | undefined | null, key: string): string {
  if (LABEL_EXTRA[key]) return LABEL_EXTRA[key]
  for (const section of getFieldSections(jenis)) {
    for (const f of section.fields) {
      if (f.key === key) return f.label
    }
  }
  return key
}

function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null) return true
  if (typeof v === "string") return v.trim() === ""
  if (typeof v === "number") return v === 0
  if (Array.isArray(v)) return v.length === 0
  return false
}

/** Validasi langkah Identitas (step 0). */
export function validasiIdentitas(data: {
  kode_program: string
  kode_kegiatan: string
  kode_sub_kegiatan: string
  cara_pengadaan: string
  jenis_pengadaan: string
}): ValidasiError[] {
  const missing: ValidasiError[] = []
  if (!data.kode_program) missing.push({ step: 0, key: "kode_program", label: "Program" })
  if (!data.kode_kegiatan) missing.push({ step: 0, key: "kode_kegiatan", label: "Kegiatan" })
  if (!data.kode_sub_kegiatan) missing.push({ step: 0, key: "kode_sub_kegiatan", label: "Sub Kegiatan" })
  if (!data.cara_pengadaan) missing.push({ step: 0, key: "cara_pengadaan", label: "Cara Pengadaan" })
  if (data.cara_pengadaan !== "Swakelola" && !data.jenis_pengadaan) {
    missing.push({ step: 0, key: "jenis_pengadaan", label: "Jenis Pengadaan" })
  }
  return missing
}

/** Validasi kelengkapan form sesuai jenis pengadaan (step form). */
export function validasiFormWajib(jenis: string | undefined | null, fd: Record<string, unknown>): ValidasiError[] {
  if (!jenis) return [{ step: 0, key: "jenis_pengadaan", label: "Pilih jenis pengadaan terlebih dahulu" }]

  const missing: ValidasiError[] = []

  // Field dari registry (label mengikuti penjelasan.docx)
  for (const section of getFieldSections(jenis)) {
    for (const f of section.fields) {
      if (OPSIONAL_KEYS.has(f.key)) continue
      if (f.kind === "rkbmdlist") continue
      if (isEmpty(fd[f.key])) missing.push({ step: 1, key: f.key, label: f.label })
    }
  }

  // Lokasi pertama wajib (provinsi + kabupaten), selanjutnya boleh kosong
  const lokasi = Array.isArray(fd.lokasi) ? (fd.lokasi as Array<Record<string, unknown>>) : []
  const lokasiPertama = lokasi[0]
  if (!lokasiPertama || !lokasiPertama.provinsiCode) {
    missing.push({ step: 1, key: "lokasi", label: "Lokasi (provinsi pertama wajib)" })
  } else if (!lokasiPertama.kabupatenCode) {
    missing.push({ step: 1, key: "lokasi", label: "Lokasi (kabupaten/kota pertama wajib)" })
  }

  // Waktu wajib (hanya awal; akhir boleh kosong) — Swakelola memakai waktu_awal
  const waktuWajib = jenis === "Swakelola" ? [["waktu_awal", "Waktu Pelaksanaan Pekerjaan"]] as Array<[string, string]> : WAKTU_WAJIB
  for (const [key, label] of waktuWajib) {
    if (isEmpty(fd[key])) missing.push({ step: 1, key, label: `${label} (awal wajib)` })
  }

  // Urutan waktu: akhir tidak boleh sebelum awal
  const pasangan =
    jenis === "Swakelola" ? WAKTU_PASANGAN_SWAKELOLA : WAKTU_PASANGAN
  for (const e of cekUrutanWaktu(fd, pasangan)) {
    missing.push({ step: 1, key: e.key, label: e.pesan })
  }

  return missing
}

/** Validasi saat simpan/submit — identitas + form + minimal 1 pagu paket. */
export function validasiSebelumSimpan(params: {
  identitas: { kode_program: string; kode_kegiatan: string; kode_sub_kegiatan: string; cara_pengadaan: string; jenis_pengadaan: string }
  jenis: string | undefined | null
  formData: Record<string, unknown>
  totalAnggaran: number
}): ValidasiError[] {
  const missing = [
    ...validasiIdentitas(params.identitas),
    ...validasiFormWajib(params.jenis, params.formData),
  ]
  if (params.totalAnggaran <= 0) missing.push({ step: 2, key: "anggaran", label: "Pagu Paket (minimal pilih 1 standar harga)" })
  return missing
}
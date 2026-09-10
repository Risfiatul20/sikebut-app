"use client"

import { useState, useEffect, useCallback } from "react"
import {
  X,
  Search,
  Loader2,
  Package,
  Wrench,
  ClipboardList,
  CheckCircle2,
  ArrowLeft,
  Check,
  Info,
  ArrowRight,
  Layers,
} from "lucide-react"
import {
  RkbmdItemTerpilih,
  RkbmdPerAnggaran,
  RkbmdPerAnggaranMode,
  RkbmdJenis,
  PaguPaketItem,
} from "@/types/identifikasi"

/**
 * Popup "Ambil Data dari RKBMD" — sesuai arahan atasan (aturan flag akun_indikator_rkbmd):
 *
 *   Penentu = 3 flag: is_rkbmd_pengadaan · is_rkbmd_pemeliharaan_rutin · is_rkbmd_pemeliharaan_rehab
 *
 *   Semua rekening SELALU melewati layar pilihan dulu (tidak ada lompatan langsung):
 *   - tidak ada flag sama sekali                              → 2 pilihan (Tidak Butuh / Tidak Tersedia)
 *   - hanya is_rkbmd_pengadaan                                → 3 pilihan (Pengadaan / Tidak Butuh / Tidak Tersedia)
 *   - hanya pemeliharaan (rutin dan/atau rehab, tanpa pengadaan) → 3 pilihan (Pemeliharaan / Tidak Butuh / Tidak Tersedia)
 *   - is_rkbmd_pengadaan + pemeliharaan (rutin dan/atau rehab)  → 4 pilihan
 *
 *   Pilih Pengadaan/Pemeliharaan → lanjut pilih barang di form terkait.
 *   Pilih Tidak Butuh / Tidak Tersedia → BERHENTI di situ (tanpa pilih barang).
 */

interface Props {
  isOpen: boolean
  onClose: () => void
  kodeSubKegiatan: string
  kodeSkpd?: string
  /** Item Pagu Paket (standar harga) terpilih — acuan pertanyaan RKBMD per kode rekening. */
  anggaran: PaguPaketItem[]
  /** Jawaban RKBMD per item pagu (pre-fill saat dibuka ulang). */
  currentSelections: RkbmdPerAnggaran[]
  /** ID identifikasi yang sedang diedit — riwayat "Diisi" usulan ini dikecualikan supaya tidak dobel. */
  identifikasiId?: number | null
  /** Terpanggil saat semua item pagu terjawab dan user menekan "Simpan Semua Jawaban". */
  onSelect: (items: RkbmdPerAnggaran[]) => void
}

interface RawPengadaan {
  id_pengadaan: number
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  jumlah_maksimum?: number
  /** Total jumlah yang sudah dipakai usulan lain (riwayat "Diisi"). */
  sudah_diisi?: number
}

interface RawPemeliharaan {
  id_pemeliharaan: number
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  jumlah_pemeliharaan?: number
  satuan_pemeliharaan?: string
  kondisi_b?: number
  kondisi_rr?: number
  kondisi_rb?: number
  /** Total jumlah yang sudah dipakai usulan lain (riwayat "Diisi"). */
  sudah_diisi?: number
}

type SubStep = "jenis" | "mode" | "pilih" | "done"

const MODE_OPTIONS: Array<{
  mode: RkbmdPerAnggaranMode
  jenis?: RkbmdJenis
  icon: typeof Package
  title: string
  desc: string
  color: "emerald" | "violet" | "slate" | "amber"
}> = [
  {
    mode: "rencana",
    jenis: "pengadaan",
    icon: Package,
    title: "Rencana (Pengadaan)",
    desc: "Barang dari rencana kebutuhan pengadaan (rkbmd_pengadaan).",
    color: "emerald",
  },
  {
    mode: "aset",
    jenis: "pemeliharaan",
    icon: Wrench,
    title: "Aset Dimiliki (Pemeliharaan)",
    desc: "Aset yang dimiliki & dipelihara (rkbmd_pemeliharaan) — jumlah dari tabel pemeliharaan, kondisi dari tabel kebutuhan.",
    color: "violet",
  },
  {
    mode: "tidak_butuh",
    icon: Check,
    title: "Tidak Butuh RKBMD",
    desc: "Kebutuhan ini tidak memerlukan identifikasi RKBMD (dicatat sebagai keterangan).",
    color: "slate",
  },
  {
    mode: "tidak_tersedia",
    icon: Info,
    title: "Tidak Tersedia di RKBMD",
    desc: "Belanja pendukung / barang tidak ada di RKBMD — hanya informasi saja.",
    color: "amber",
  },
]

export function RkbmdPickerModal({
  isOpen,
  onClose,
  kodeSubKegiatan,
  kodeSkpd,
  anggaran,
  currentSelections,
  identifikasiId,
  onSelect,
}: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState<RkbmdPerAnggaran[]>([])
  const [subStep, setSubStep] = useState<SubStep>("mode")
  const [pengadaan, setPengadaan] = useState<RawPengadaan[]>([])
  const [pemeliharaan, setPemeliharaan] = useState<RawPemeliharaan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  /** Alur RKBMD per item pagu — penentu = 3 flag akun_indikator_rkbmd:
   *  is_rkbmd_pengadaan · is_rkbmd_pemeliharaan_rutin · is_rkbmd_pemeliharaan_rehab
   *
   *  Aturan (sesuai arahan atasan) — SEMUA rekening lewat layar pilihan dulu:
   *  - tanpa flag sama sekali                               → 2 pilihan (Tidak Butuh / Tidak Tersedia)
   *  - hanya is_rkbmd_pengadaan                             → 3 pilihan (Pengadaan / Tidak Butuh / Tidak Tersedia)
   *  - hanya pemeliharaan (rutin dan/atau rehab)            → 3 pilihan (Pemeliharaan / Tidak Butuh / Tidak Tersedia)
   *  - pengadaan + pemeliharaan (rutin dan/atau rehab)      → 4 pilihan
   */
  const flowOf = useCallback(
    (item: PaguPaketItem) => {
      const pengadaan = !!item.is_rkbmd_pengadaan
      const rutin = !!item.is_rkbmd_pemeliharaan_rutin
      const rehab = !!item.is_rkbmd_pemeliharaan_rehab
      const pemeliharaan = rutin || rehab
      return {
        pengadaan,
        pemeliharaan,
        // Ganda = ada flag pengadaan DAN ada flag pemeliharaan → 4 pilihan
        both: pengadaan && pemeliharaan,
        // Tanpa flag sama sekali → 2 pilihan (Tidak Butuh / Tidak Tersedia)
        none: !pengadaan && !pemeliharaan,
        // Hanya flag pengadaan → 3 pilihan (Pengadaan / Tidak Butuh / Tidak Tersedia)
        pengadaanOnly: pengadaan && !pemeliharaan,
        // Hanya flag pemeliharaan (rutin dan/atau rehab) → 3 pilihan (Pemeliharaan / Tidak Butuh / Tidak Tersedia)
        pemeliharaanOnly: !pengadaan && pemeliharaan,
      }
    },
    []
  )

  /** Jawaban kosong untuk satu item pagu. */
  const emptyAnswer = useCallback(
    (item: PaguPaketItem): RkbmdPerAnggaran => ({
      id_sipd_penetapan: item.id_sipd_penetapan,
      kode_rekening: item.kode_rekening,
      nama_rekening: item.nama_rekening,
      kode_standar_harga: item.kode_standar_harga,
      nama_standar_harga: item.nama_standar_harga,
      jenis: "",
      mode: "",
      items: [],
    }),
    []
  )

  // Inisialisasi saat modal dibuka — SEMUA rekening mulai dari layar pilihan
  useEffect(() => {
    if (!isOpen) return
    const prefilled = anggaran.map((item) => {
      const prev = currentSelections.find(
        (p) => p.id_sipd_penetapan === item.id_sipd_penetapan
      )
      if (prev) return { ...prev, items: prev.items ?? [] }
      return emptyAnswer(item)
    })
    setAnswers(prefilled)
    setStepIdx(0)
    setSearch("")
    // Sub-langkah pertama item ke-0: sudah terjawab → lanjut tahap terkait; selain itu → layar pilihan (mode)
    const first = prefilled[0]
    if (first?.mode) setSubStep(first.mode === "rencana" || first.mode === "aset" ? "pilih" : "done")
    else setSubStep("mode")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadData = useCallback(async () => {
    if (!isOpen) return
    setIsLoading(true)
    setError(null)

    // Filter cukup berdasarkan sub kegiatan (kode_sub_giat).
    // Catatan: data RKBMD tersimpan dengan kode_skpd OPD induk (mis. ...0000),
    // sedangkan kode_skpd user bisa sub-unit (...0006). Jika kode_skpd ikut
    // dikirim, hasilnya 0 baris walau data ada → modal tampak kosong.
    const params = new URLSearchParams({ per_page: "0" })
    if (kodeSubKegiatan) params.set("kode_sub_kegiatan", kodeSubKegiatan)
    // Mode edit: kecualikan usulan ini dari riwayat "Diisi" (jangan dihitung dobel)
    if (identifikasiId) params.set("exclude_identifikasi", String(identifikasiId))

    try {
      const [resPengadaan, resPemeliharaan] = await Promise.all([
        fetch(`/api/rkbmd/pengadaan?${params.toString()}`),
        fetch(`/api/rkbmd/pemeliharaan?${params.toString()}`),
      ])
      if (!resPengadaan.ok || !resPemeliharaan.ok) {
        const failed = !resPengadaan.ok ? resPengadaan : resPemeliharaan
        // Ambil pesan asli dari body (mis. "Backend tidak dapat dijangkau...")
        let detail = `Gagal memuat data RKBMD (HTTP ${resPengadaan.status}/${resPemeliharaan.status})`
        try {
          const j = await failed.clone().json()
          if (j?.error) detail = j.error
        } catch {
          // body bukan JSON
        }
        throw new Error(detail)
      }
      const [jPengadaan, jPemeliharaan] = await Promise.all([
        resPengadaan.json(),
        resPemeliharaan.json(),
      ])
      setPengadaan((jPengadaan.data ?? []) as RawPengadaan[])
      setPemeliharaan((jPemeliharaan.data ?? []) as RawPemeliharaan[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat RKBMD")
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, kodeSubKegiatan, kodeSkpd, identifikasiId])

  useEffect(() => {
    if (isOpen) loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, kodeSubKegiatan])

  if (!isOpen) return null

  const totalItems = anggaran.length

  /** Pindah ke item tertentu — tentukan sub-langkah dari jawaban/flag. */
  const goToItem = (idx: number) => {
    if (idx < 0 || idx >= totalItems) return
    setStepIdx(idx)
    setSearch("")
    const a = answers[idx]
    if (a?.mode) {
      setSubStep(a.mode === "rencana" || a.mode === "aset" ? "pilih" : "done")
      return
    }
    // Belum terjawab → selalu tampilkan layar pilihan (2/3/4 opsi sesuai flag rekening)
    setSubStep("mode")
  }

  const patchAnswer = (idx: number, patch: Partial<RkbmdPerAnggaran>) => {
    setAnswers((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, ...patch } : a))
    )
  }

  /** Level 1 — pilih mode akhir item. */
  const pickMode = (m: RkbmdPerAnggaranMode, jenis?: RkbmdJenis) => {
    const cur = answers[stepIdx]
    // Bersihkan pilihan barang lama kalau berpindah ke jawaban lain
    // (mis. Rencana → Tidak Butuh, atau Rencana → Aset) supaya jawaban konsisten.
    const items = cur?.mode === m ? (cur.items ?? []) : []
    patchAnswer(stepIdx, {
      mode: m,
      jenis: jenis || cur?.jenis || "",
      items,
    })
    if (m === "rencana" || m === "aset") {
      // lanjut pilih barang
      setSubStep("pilih")
    } else {
      // Tidak Butuh / Tidak Tersedia → BERHENTI (tanpa pilih barang)
      setSubStep("done")
    }
  }

  /** Level 2 — konfirmasi pilihan barang → item selesai. */
  const confirmTab = () => {
    setSubStep("done")
  }

  /** Pindah ke item berikutnya / selesaikan semua. */
  const nextItem = () => {
    if (stepIdx < totalItems - 1) goToItem(stepIdx + 1)
  }

  const currentItem = anggaran[stepIdx]
  const currentAnswer = answers[stepIdx]
  const currentFlow = currentItem ? flowOf(currentItem) : null

  const answeredCount = answers.filter((a) => a?.mode).length
  const allAnswered = totalItems > 0 && answeredCount === totalItems

  const q = search.toLowerCase().trim()
  const filterBySearch = <T extends { nama_barang: string; kode_fikasi: string }>(
    rows: T[]
  ) => {
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.nama_barang.toLowerCase().includes(q) ||
        r.kode_fikasi.toLowerCase().includes(q)
    )
  }
  const pengadaanFiltered = filterBySearch(pengadaan)
  const pemeliharaanFiltered = filterBySearch(pemeliharaan)
  const fmt = (n?: number | null) => (n ?? 0).toLocaleString("id-ID")

  const isChecked = (id: string) =>
    currentAnswer?.items.some((it) => it.id === id) ?? false

  // Batas maksimum input "Jumlah" = Jumlah Barang − Diisi (riwayat usulan lain).
  // Logika sama seperti form pemilihan Pagu Paket: sisa = total − terpakai.
  const pengadaanCap = (r: RawPengadaan): number | undefined => {
    const sisa = (r.jumlah_barang ?? 0) - (r.sudah_diisi ?? 0)
    return sisa > 0 ? sisa : 0
  }
  /** Sisa barang per baris = Jumlah Barang − Diisi − Jumlah (tampil di bawah kolom Jumlah Barang). */
  const sisaPengadaan = (r: RawPengadaan) => {
    const id = `pengadaan-${r.id_pengadaan}`
    const jumlah = currentItems.find((it) => it.id === id)?.jumlah ?? 0
    return (r.jumlah_barang ?? 0) - (r.sudah_diisi ?? 0) - jumlah
  }
  const pemeliharaanCap = (r: RawPemeliharaan): number | undefined => {
    const sisa =
      Math.max(r.jumlah_barang ?? 0, r.jumlah_pemeliharaan ?? 0) - (r.sudah_diisi ?? 0)
    return sisa > 0 ? sisa : 0
  }

  const togglePengadaan = (r: RawPengadaan) => {
    const id = `pengadaan-${r.id_pengadaan}`
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== stepIdx) return a
        const exists = a.items.some((it) => it.id === id)
        const items = exists
          ? a.items.filter((it) => it.id !== id)
          : [
              ...a.items,
              {
                id,
                sumber: "pengadaan" as const,
                nama_barang: r.nama_barang,
                kode_fikasi: r.kode_fikasi || "",
                // Arahan atasan: "Diisi" default 0 — user mengisi manual (batas = Jumlah Barang).
                jumlah: 0,
                satuan: r.satuan || "",
                jumlah_maksimum: r.jumlah_maksimum,
              },
            ]
        return { ...a, items }
      })
    )
  }

  const togglePemeliharaan = (r: RawPemeliharaan) => {
    const id = `pemeliharaan-${r.id_pemeliharaan}`
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== stepIdx) return a
        const exists = a.items.some((it) => it.id === id)
        const items = exists
          ? a.items.filter((it) => it.id !== id)
          : [
              ...a.items,
              {
                id,
                sumber: "pemeliharaan" as const,
                nama_barang: r.nama_barang,
                kode_fikasi: r.kode_fikasi || "",
                // Arahan atasan: "Jumlah" = input baru, default 0 (user isi manual),
                // batas = jumlah total − riwayat Diisi (logika seperti Pagu Paket).
                jumlah: 0,
                satuan: r.satuan_pemeliharaan || r.satuan || "",
                // Kondisi B/RR/RB otomatis dari tabel master rkbmd_kebutuhan (tidak bisa diubah)
                kondisi_b: r.kondisi_b ?? 0,
                kondisi_rr: r.kondisi_rr ?? 0,
                kondisi_rb: r.kondisi_rb ?? 0,
              },
            ]
        return { ...a, items }
      })
    )
  }

  const updateSelectedItem = (
    id: string,
    patch: Partial<RkbmdItemTerpilih>,
    cap?: number
  ) => {
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== stepIdx) return a
        const items = a.items.map((it) => {
          if (it.id !== id) return it
          const nextPatch =
            cap != null && patch.jumlah != null
              ? { ...patch, jumlah: Math.max(0, Math.min(patch.jumlah, cap)) }
              : patch
          return { ...it, ...nextPatch }
        })
        return { ...a, items }
      })
    )
  }

  const currentItems = currentAnswer?.items ?? []
  const totalUnit = currentItems.reduce((s, it) => s + (it.jumlah || 0), 0)

  const modeTitle = (m: RkbmdPerAnggaranMode | "") =>
    MODE_OPTIONS.find((o) => o.mode === m)?.title ?? "—"

  // ============================================================
  // Blok "Tidak Butuh / Tidak Tersedia" — berhenti tanpa barang
  // ============================================================
  const renderDone = () => (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
              Item selesai dijawab
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
              <span className="font-semibold">{currentAnswer?.nama_standar_harga || currentAnswer?.nama_rekening}</span>
              <span className="font-mono text-emerald-600/80"> ({currentAnswer?.kode_rekening})</span> ·{" "}
              {currentAnswer?.nama_rekening}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
              Jawaban: <b>{modeTitle(currentAnswer?.mode ?? "")}</b>
              {currentAnswer?.mode === "rencana" || currentAnswer?.mode === "aset" ? (
                <span> — {currentItems.length} barang terpilih (total {fmt(totalUnit)} unit)</span>
              ) : (
                <span> — berhenti di sini, tanpa pemilihan barang.</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            // Aturan final: semua rekening lewat layar pilihan (mode) —
            // "Ubah Jawaban" selalu kembali ke layar pilihan, bukan langsung ke tabel barang.
            setSubStep("mode")
          }}
          className="h-8 px-3 rounded-lg inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Ubah Jawaban
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          {stepIdx < totalItems - 1 ? (
            <button
              type="button"
              onClick={nextItem}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              Item Berikutnya <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSelect(answers)
                onClose()
              }}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              Simpan Semua Jawaban ({answeredCount}/{totalItems}) <Check className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // ============================================================
  // Level 1 — pilih mode akhir (Rencana / Aset / Tidak Butuh / Tidak Tersedia)
  // ============================================================
  const renderMode = () => {
    const f = currentFlow
    // Jumlah opsi sesuai kombinasi flag rekening:
    //  - tanpa flag            → 2 pilihan (Tidak Butuh / Tidak Tersedia)
    //  - hanya pengadaan       → 3 pilihan (Pengadaan / Tidak Butuh / Tidak Tersedia)
    //  - hanya pemeliharaan    → 3 pilihan (Pemeliharaan / Tidak Butuh / Tidak Tersedia)
    //  - pengadaan + pemeliharaan → 4 pilihan
    const none = f?.none
    const pengadaanOnly = f?.pengadaanOnly
    const pemeliharaanOnly = f?.pemeliharaanOnly
    const allowed = MODE_OPTIONS.filter((o) => {
      if (none) return o.mode === "tidak_butuh" || o.mode === "tidak_tersedia"
      if (pengadaanOnly)
        return (
          o.mode === "rencana" ||
          o.mode === "tidak_butuh" ||
          o.mode === "tidak_tersedia"
        )
      if (pemeliharaanOnly)
        return (
          o.mode === "aset" ||
          o.mode === "tidak_butuh" ||
          o.mode === "tidak_tersedia"
        )
      return true
    })
    return (
      <div className="p-5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Pilih salah satu —{" "}
          <span className="text-emerald-600 dark:text-emerald-400">{currentItem?.nama_standar_harga || currentItem?.nama_rekening}</span>
          <span className="font-mono text-slate-400"> ({currentItem?.kode_rekening})</span>
        </p>
        {none && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2.5 text-[11px] text-slate-600 dark:text-slate-300">
            Rekening ini tidak terdaftar di identifikasi RKBMD — pilih{" "}
            <b>Tidak Butuh RKBMD</b> atau <b>Tidak Tersedia di RKBMD</b>.
          </div>
        )}
        {pengadaanOnly && (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3.5 py-2.5 text-[11px] text-emerald-800 dark:text-emerald-200">
            Rekening ini terdaftar di <b>RKBMD Pengadaan</b> — pilih{" "}
            <b>Pengadaan</b> untuk memilih barang, atau <b>Tidak Butuh RKBMD</b> /{" "}
            <b>Tidak Tersedia di RKBMD</b> untuk berhenti.
          </div>
        )}
        {pemeliharaanOnly && (
          <div className="rounded-lg border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 px-3.5 py-2.5 text-[11px] text-violet-800 dark:text-violet-200">
            Rekening ini terdaftar di <b>RKBMD Pemeliharaan</b> — pilih{" "}
            <b>Pemeliharaan</b> untuk memilih aset, atau <b>Tidak Butuh RKBMD</b> /{" "}
            <b>Tidak Tersedia di RKBMD</b> untuk berhenti.
          </div>
        )}
        {f?.both && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5 text-[11px] text-amber-800 dark:text-amber-200">
            Rekening ini terdaftar di <b>RKBMD Pengadaan</b> sekaligus <b>RKBMD Pemeliharaan</b> —
            pilih salah satu dari 4 pilihan di bawah.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allowed.map((card) => {
            const Icon = card.icon
            // Tidak ada rekomendasi otomatis — semua pilihan setara sesuai flag rekening.
            const recommended = false
            const disabled = false
            return (
              <button
                key={card.mode}
                type="button"
                disabled={disabled}
                onClick={() => pickMode(card.mode, card.jenis)}
                className={`group text-left p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all ${
                  disabled
                    ? "border-slate-100 dark:border-slate-800 opacity-40 cursor-not-allowed"
                    : "border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      card.color === "emerald"
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : card.color === "violet"
                          ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                          : card.color === "slate"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{card.title}</p>
                      {recommended && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          Direkomendasikan
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
                    {(card.mode === "rencana" || card.mode === "aset") && (
                      <p className="text-[10px] font-mono text-slate-400 mt-1.5">
                        {card.mode === "rencana" ? pengadaan.length : pemeliharaan.length} item tersedia
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // Level 2 — pilih barang (tabel yang sudah ada)
  // ============================================================
  const renderPilih = () => {
    const isPengadaan = currentAnswer?.jenis !== "pemeliharaan"
    return (
      <div className="flex flex-col flex-1 min-h-0">
        {/* Kontrol */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              // Kembali ke pilihan mode (4 pilihan), reset jawaban item ini
              patchAnswer(stepIdx, { mode: "", jenis: "" })
              setSubStep("mode")
            }}
            className="h-8 px-2.5 rounded-lg inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </button>
          <div className="relative ml-auto">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang / kodefikasi..."
              className="w-60 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
          {isPengadaan ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Rencana (Pengadaan) — klik baris untuk mencentang, <b>Diisi</b> (riwayat usulan lain) & <b>Jumlah</b> (input baru, batas = sisa)
              </p>
              {isLoading ? (
                <LoadingRow />
              ) : pengadaanFiltered.length === 0 ? (
                <EmptyState label="Tidak ada data RKBMD Pengadaan untuk sub kegiatan ini. Isi manual pada form." />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-[10px] uppercase text-slate-400">
                        <th className="font-semibold px-3 py-2 text-center w-10">✓</th>
                        <th className="font-semibold px-3 py-2 text-left min-w-[180px]">Nama Barang</th>
                        <th className="font-semibold px-3 py-2 text-right">Jumlah Barang</th>
                        <th className="font-semibold px-3 py-2 text-right">Satuan</th>
                        <th className="font-semibold px-3 py-2 text-right">Diisi</th>
                        <th className="font-semibold px-3 py-2 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pengadaanFiltered.map((r) => {
                        const id = `pengadaan-${r.id_pengadaan}`
                        const checked = isChecked(id)
                        return (
                          <tr
                            key={id}
                            onClick={() => togglePengadaan(r)}
                            className={`cursor-pointer transition-colors ${checked ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                          >
                            <td className="px-3 py-2 text-center">
                              <div className={`h-5 w-5 rounded flex items-center justify-center border-2 mx-auto transition-colors ${checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                                {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{r.nama_barang}</p>
                              {r.kode_fikasi && <p className="font-mono text-[9px] text-slate-400 mt-0.5">{r.kode_fikasi}</p>}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <p className="font-mono text-slate-600 dark:text-slate-300">{fmt(r.jumlah_barang)}</p>
                              <p className={`font-mono text-[9px] ${sisaPengadaan(r) < 0 ? "text-rose-500" : "text-slate-400"}`}>
                                Sisa: {fmt(sisaPengadaan(r))}
                              </p>
                            </td>
                            <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">{r.satuan || "-"}</td>
                            <td className="px-3 py-2 text-right">
                              <span className="font-mono text-slate-500 dark:text-slate-400">{fmt(r.sudah_diisi ?? 0)}</span>
                            </td>
                            <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              {checked ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={pengadaanCap(r)}
                                  value={currentItems.find((it) => it.id === id)?.jumlah ?? 0}
                                  onChange={(e) => updateSelectedItem(id, { jumlah: Number(e.target.value) || 0 }, pengadaanCap(r))}
                                  className="w-24 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                                />
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Aset Dimiliki (Pemeliharaan) — klik baris untuk mencentang, kondisi (B/RR/RB) otomatis dari tabel kebutuhan (tidak bisa diubah), <b>Jumlah</b> diisi manual
              </p>
              {isLoading ? (
                <LoadingRow />
              ) : pemeliharaanFiltered.length === 0 ? (
                <EmptyState label="Tidak ada data RKBMD Pemeliharaan untuk sub kegiatan ini. Isi manual pada form." />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-[10px] uppercase text-slate-400">
                        <th className="font-semibold px-3 py-2 text-center w-10">✓</th>
                        <th className="font-semibold px-3 py-2 text-left min-w-[180px]">Nama Barang</th>
                        <th className="font-semibold px-3 py-2 text-right">Baik</th>
                        <th className="font-semibold px-3 py-2 text-right">RR</th>
                        <th className="font-semibold px-3 py-2 text-right">RB</th>
                        <th className="font-semibold px-3 py-2 text-right">Diisi</th>
                        <th className="font-semibold px-3 py-2 text-right">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pemeliharaanFiltered.map((r) => {
                        const id = `pemeliharaan-${r.id_pemeliharaan}`
                        const checked = isChecked(id)
                        return (
                          <tr
                            key={id}
                            onClick={() => togglePemeliharaan(r)}
                            className={`cursor-pointer transition-colors ${checked ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                          >
                            <td className="px-3 py-2 text-center">
                              <div className={`h-5 w-5 rounded flex items-center justify-center border-2 mx-auto transition-colors ${checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                                {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{r.nama_barang}</p>
                              {r.kode_fikasi && <p className="font-mono text-[9px] text-slate-400 mt-0.5">{r.kode_fikasi}</p>}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_b)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_rr)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_rb)}</td>
                            <td className="px-3 py-2 text-right">
                              <span className="font-mono text-slate-500 dark:text-slate-400">{fmt(r.sudah_diisi ?? 0)}</span>
                            </td>
                            <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              {checked ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={pemeliharaanCap(r)}
                                    value={currentItems.find((it) => it.id === id)?.jumlah ?? 0}
                                    onChange={(e) => updateSelectedItem(id, { jumlah: Number(e.target.value) || 0 }, pemeliharaanCap(r))}
                                    className="w-20 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                                  />
                                  <span className="text-[10px] text-slate-400">{r.satuan || ""}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[10px] text-slate-400">
            {currentItems.length} item dipilih • Total:{" "}
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">{fmt(totalUnit)} unit</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={confirmTab}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              {stepIdx < totalItems - 1 ? "Konfirmasi & Item Berikutnya" : "Konfirmasi Item Ini"} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // Guard: belum ada pagu paket
  // ============================================================
  if (totalItems === 0) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
          <div className="mx-auto h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="mt-4 font-display text-sm font-bold text-slate-900 dark:text-white">
            Pilih Pagu Paket Terlebih Dahulu
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pertanyaan RKBMD mengikuti <b>kode rekening</b> dari Pagu Paket (standar harga RKA SIPD).
            Silakan pilih Pagu Paket di section <b>"Pagu Paket & Sumber Dana"</b> pada form, lalu buka
            kembali menu ini.
          </p>
          <button
            onClick={onClose}
            className="mt-5 h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                Ambil Data dari RKBMD
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Pertanyaan per item Pagu Paket ({totalItems} rekening) — sub kegiatan:{" "}
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{kodeSubKegiatan || "-"}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stepper item */}
          {totalItems > 1 && (
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              {anggaran.map((item, idx) => {
                const a = answers[idx]
                const done = !!a?.mode
                const active = idx === stepIdx
                return (
                  <button
                    key={item.id_sipd_penetapan}
                    type="button"
                    onClick={() => goToItem(idx)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-colors ${
                      active
                        ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : done
                          ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />}
                    <span className="max-w-[150px] truncate text-left">{idx + 1}. {item.nama_standar_harga || item.nama_rekening || item.kode_rekening}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Info item aktif */}
          <div className="mt-2.5 rounded-lg border border-blue-100 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-500/5 px-3 py-2 flex items-start gap-2">
            <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
              <span className="font-bold text-blue-700 dark:text-blue-300">{currentItem?.nama_standar_harga || currentItem?.nama_rekening || "—"}</span>
              <span className="text-slate-400"> · {currentItem?.nama_rekening}</span>
              <span className="font-mono text-slate-400"> — {currentItem?.kode_rekening}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {subStep === "mode" && (
          <div className="flex-1 overflow-auto custom-scrollbar">
            {renderMode()}
            <div className="px-5 pb-4">
              <button
                onClick={onClose}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {subStep === "pilih" && renderPilih()}

        {subStep === "done" && renderDone()}

        {/* Progress bawah */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {answeredCount} dari {totalItems} item terjawab
          </span>
          {allAnswered && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Semua item selesai
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingRow() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Memuat data RKBMD...
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-xs text-slate-400 max-w-sm">{label}</p>
    </div>
  )
}
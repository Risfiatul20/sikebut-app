"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ChevronRight,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Search,
  Maximize2,
  Minimize2,
  Building2,
  FolderTree,
  FolderKanban,
  ListTree,
  Layers,
  Receipt,
  Wallet,
  Inbox,
} from "lucide-react"
import { LaporanPaketResponse, RincianPaketRow } from "@/types/laporan-paket"
import { useYear } from "@/context/year-context"

/* ------------------------------------------------------------------ */
/* Format helper                                                       */
/* ------------------------------------------------------------------ */

const fmtRp = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0))

const fmtAngka = (v: number | string) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(Number(v ?? 0))

const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/** "Okt 2026" — sama dengan format export Excel. */
const fmtWaktu = (iso: string | null) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return `${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`
}

/* ------------------------------------------------------------------ */
/* Pohon                                                               */
/* ------------------------------------------------------------------ */

type LevelType = "opd" | "sub_unit" | "program" | "kegiatan" | "sub_kegiatan" | "paket" | "rekening"

interface TreeNode {
  id: string
  level: number
  type: LevelType
  kode: string
  nama: string
  totalPagu: number
  jumlahPaket: number
  paket?: RincianPaketRow
  makKode?: string
  /** Kode sub kegiatan — baris 1 kolom MAK. */
  makSubKegiatan?: string
  /** Kode standar harga — baris 3 kolom MAK. */
  makStandar?: string
  makPagu?: number
  children: TreeNode[]
}

const LEVEL_BADGE: Record<LevelType, { label: string; icon: React.ElementType }> = {
  opd: { label: "OPD", icon: Building2 },
  sub_unit: { label: "Sub Unit", icon: FolderTree },
  program: { label: "Program", icon: FolderKanban },
  kegiatan: { label: "Kegiatan", icon: ListTree },
  sub_kegiatan: { label: "Sub Kegiatan", icon: Layers },
  paket: { label: "Paket", icon: Receipt },
  rekening: { label: "Rekening", icon: Wallet },
}

const rowShading = (level: number): string => {
  switch (level) {
    case 1:
      return "bg-slate-100/90 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700"
    case 2:
      return "bg-slate-50/80 dark:bg-slate-850/50 font-semibold text-slate-800 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800"
    case 3:
      return "bg-white dark:bg-slate-900/90 font-medium text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-700/60"
    case 4:
      return "bg-white dark:bg-slate-900 font-normal text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/50"
    case 5:
      return "bg-white dark:bg-slate-900 font-normal text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/40"
    case 6:
      return "bg-amber-50/50 dark:bg-amber-500/5 font-medium text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-700/60"
    default:
      return "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
  }
}

/** Urutkan paket mengikuti hierarki supaya pohon terbaca menurun. */
function urutkan(rows: RincianPaketRow[]): RincianPaketRow[] {
  return [...rows].sort((a, b) =>
    [
      a.nama_opd || "",
      a.nama_skpd || "",
      a.nama_program || "",
      a.nama_kegiatan || "",
      a.nama_sub_kegiatan || "",
      a.nama_paket || "",
    ]
      .join("\u0000")
      .localeCompare(
        [
          b.nama_opd || "",
          b.nama_skpd || "",
          b.nama_program || "",
          b.nama_kegiatan || "",
          b.nama_sub_kegiatan || "",
          b.nama_paket || "",
        ].join("\u0000"),
        "id"
      )
  )
}

function buildTree(rows: RincianPaketRow[]): TreeNode[] {
  const opdMap = new Map<string, TreeNode>()

  for (const r of rows) {
    const opdKode = r.kode_opd || r.kode_skpd
    const opdNama = r.nama_opd || r.nama_skpd

    let opd = opdMap.get(opdKode)
    if (!opd) {
      opd = {
        id: `opd-${opdKode}`,
        level: 1,
        type: "opd",
        kode: opdKode,
        nama: opdNama,
        totalPagu: 0,
        jumlahPaket: 0,
        children: [],
      }
      opdMap.set(opdKode, opd)
    }

    const turun = (parent: TreeNode, kode: string, nama: string, level: number, type: LevelType): TreeNode => {
      let node = parent.children.find((c) => c.kode === kode && c.type === type)
      if (!node) {
        node = {
          id: `${type}-${kode}-${parent.id}`,
          level,
          type,
          kode,
          nama,
          totalPagu: 0,
          jumlahPaket: 0,
          children: [],
        }
        parent.children.push(node)
      }
      return node
    }

    const su = turun(opd, r.kode_skpd, r.nama_skpd, 2, "sub_unit")
    const prog = turun(su, r.kode_program, r.nama_program, 3, "program")
    const keg = turun(prog, r.kode_kegiatan, r.nama_kegiatan, 4, "kegiatan")
    const sub = turun(keg, r.kode_sub_kegiatan, r.nama_sub_kegiatan, 5, "sub_kegiatan")

    const paket: TreeNode = {
      id: `paket-${r.id}`,
      level: 6,
      type: "paket",
      kode: `#${r.id}`,
      nama: r.nama_paket,
      totalPagu: Number(r.total_pagu || 0),
      jumlahPaket: 1,
      paket: r,
      children: [],
    }

    // Satu baris = satu KODE STANDAR HARGA (arahan atasan).
    // Kolom MAK menampilkan berurutan: kode sub kegiatan -> kode rekening -> kode standar.
    const makList = Array.isArray(r.mak) && r.mak.length > 0 ? r.mak : []
    makList.forEach((m, i) => {
      const kodeStandar = m.kode_standar || m.nama || ""
      const label = m.nama_standar || kodeStandar || m.kode_rekening || "—"
      paket.children.push({
        id: `standar-${r.id}-${i}`,
        level: 7,
        type: "rekening",
        kode: kodeStandar || m.kode_rekening || "—",
        nama: label,
        totalPagu: Number(m.pagu || 0),
        jumlahPaket: 0,
        makKode: m.kode_rekening || "",
        makSubKegiatan: r.kode_sub_kegiatan || "",
        makStandar: kodeStandar,
        makPagu: Number(m.pagu || 0),
        children: [],
      })
    })

    sub.children.push(paket)

    const pagu = Number(r.total_pagu || 0)
    for (const node of [opd, su, prog, keg, sub]) {
      node.totalPagu += pagu
      node.jumlahPaket += 1
    }
  }

  return Array.from(opdMap.values())
}

/* ------------------------------------------------------------------ */
/* Komponen                                                            */
/* ------------------------------------------------------------------ */

interface Props {
  jenis: "penyedia" | "swakelola"
  title: string
  description: string
}

export function LaporanPaketTree({ jenis, title, description }: Props) {
  const [data, setData] = useState<LaporanPaketResponse["data"] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")

  const { year: tahun } = useYear()
  const isPenyedia = jenis === "penyedia"

  // Status memuat DITURUNKAN dari kombinasi jenis+tahun yang sudah selesai dimuat.
  // Pola ini (derived state) membuat effect tidak perlu memanggil setState secara
  // sinkron, sekaligus menjaga indikator memuat tetap muncul saat tahun diganti.
  const kunciMuat = `${jenis}|${tahun}`
  const [selesaiMuat, setSelesaiMuat] = useState<string | null>(null)
  const loading = selesaiMuat !== kunciMuat

  // Kunci permintaan terakhir — mencegah data tahun lama menimpa data tahun terpilih
  // bila pengguna mengganti tahun dengan cepat (permintaan selesai tidak berurutan).
  const kunciTerakhir = useRef(kunciMuat)

  const load = useCallback(async () => {
    const kunciDiminta = `${jenis}|${tahun}`
    kunciTerakhir.current = kunciDiminta
    try {
      const res = await fetch(`/api/laporan/${jenis}?tahun=${tahun}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (kunciTerakhir.current !== kunciDiminta) return
      setData(json?.data ?? null)
      setError(null)
    } catch (err) {
      if (kunciTerakhir.current !== kunciDiminta) return
      setError(err instanceof Error ? err.message : "Gagal memuat data laporan")
    } finally {
      if (kunciTerakhir.current === kunciDiminta) setSelesaiMuat(kunciDiminta)
    }
  }, [jenis, tahun])

  useEffect(() => {
    // Dijalankan lewat microtask: pemuatan data hanya memanggil setState SETELAH
    // await (tidak ada setState sinkron), sehingga aman dari cascading render.
    void Promise.resolve().then(() => load())
  }, [load])

  const rincian = useMemo(() => urutkan(data?.rincian ?? []), [data])

  const tree = useMemo(() => buildTree(rincian), [rincian])

  /** ID semua node yang punya anak (untuk Bentangkan Semua). */
  const allExpandable = useMemo(() => {
    const ids: string[] = []
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        if (n.children.length > 0) {
          ids.push(n.id)
          walk(n.children)
        }
      }
    }
    walk(tree)
    return ids
  }, [tree])

  /** Baris yang terlihat setelah expand/collapse + nomor paket. */
  const rows = useMemo(() => {
    const out: { node: TreeNode; no: number | null }[] = []
    let no = 0
    const walk = (nodes: TreeNode[]) => {
      for (const n of nodes) {
        const nomor = n.type === "paket" ? ++no : null
        out.push({ node: n, no: nomor })
        if (n.children.length > 0 && expanded.has(n.id)) {
          walk(n.children)
        }
      }
    }
    walk(tree)
    return out
  }, [tree, expanded])

  const visibleRows = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.trim().toLowerCase()
    return rows.filter(
      ({ node }) => node.nama.toLowerCase().includes(q) || node.kode.toLowerCase().includes(q)
    )
  }, [rows, search])

  const totalPagu = useMemo(
    () => rincian.reduce((s, r) => s + Number(r.total_pagu || 0), 0),
    [rincian]
  )

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const stats = [
    { label: "Total Paket", value: data ? String(data.summary.total_paket) : "—", icon: Inbox },
    { label: "Total Pagu", value: data ? fmtRp(data.summary.total_pagu) : "—", icon: Wallet },
    { label: "Jumlah SKPD", value: data ? String(data.summary.total_skpd) : "—", icon: Building2 },
  ]

  const dash = "—"

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {/* Header + aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={`/api/laporan/${jenis}/export?tahun=${tahun}`}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Unduh laporan dalam format Excel (sesuai template)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Ekspor Excel
          </a>
          <button
            type="button"
            onClick={load}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className="mt-2 text-xl font-mono font-semibold text-slate-900 dark:text-white tracking-tight">
                    {s.value}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kop cetak */}
      <div className="hidden print:block text-center space-y-1 pb-3 border-b-2 border-slate-900">
        <p className="text-sm font-bold uppercase tracking-wide">Pemerintah Provinsi Sumatera Barat</p>
        <p className="text-xs font-semibold uppercase">
          Laporan Rencana Kebutuhan Pengadaan — {isPenyedia ? "Penyedia" : "Swakelola"}
        </p>
      </div>

      {/* Toolbar tabel */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 print:hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari OPD / paket / kode..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(new Set(allExpandable))}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Bentangkan Semua
          </button>
          <button
            type="button"
            onClick={() => setExpanded(new Set())}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Ciutkan Semua
          </button>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            T.A. {tahun} · {rincian.length} paket
          </span>
        </div>
      </div>

      {/* Tabel bertingkat */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rincian.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada paket {isPenyedia ? "Penyedia" : "Swakelola"} yang diajukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-white dark:bg-slate-900 text-[10px] uppercase text-slate-700 dark:text-slate-200">
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">No</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-left min-w-[260px]">
                    OPD/ Sub Unit/ Program/ Kegiatan/ Sub Kegiatan/ Paket
                  </th>
                  <th colSpan={3} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Lokasi</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Volume</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-left min-w-[180px]">Uraian Pekerjaan</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-left min-w-[180px]">Spesifikasi Pekerjaan</th>
                  {isPenyedia ? (
                    <>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">PDN</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Usaha Kecil</th>
                      <th colSpan={3} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Sustainable Public Procurement (SPP)</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Pra DIPA/ DPA (Y/T)</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Metode</th>
                      <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Ketersediaan e-Katalog (Y/T)</th>
                    </>
                  ) : (
                    <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Tipe</th>
                  )}
                  <th rowSpan={2} className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Sumber Dana</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">
                    MAK
                    <span className="block text-[9px] font-normal text-slate-400 dark:text-slate-500">Sub Kegiatan · Rekening · Standar</span>
                  </th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-right whitespace-nowrap">Pagu</th>
                  <th rowSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-right whitespace-nowrap">Total Pagu</th>
                  {isPenyedia && (
                    <>
                      <th colSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Pemanfaatan Barang/Jasa</th>
                      <th colSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Pelaksanaan Kontrak</th>
                      <th colSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Pemilihan Penyedia</th>
                    </>
                  )}
                  {!isPenyedia && (
                    <th colSpan={2} className="px-3 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Pelaksanaan Kontrak</th>
                  )}
                </tr>
                <tr className="bg-white dark:bg-slate-900 text-[10px] uppercase text-slate-600 dark:text-slate-300">
                  <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Provinsi</th>
                  <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Kab/Kota</th>
                  <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Detil Lokasi</th>
                  {isPenyedia && (
                    <>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Ekonomi (Y/T)</th>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Sosial (Y/T)</th>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center">Lingkungan (Y/T)</th>
                    </>
                  )}
                  <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Mulai</th>
                  <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Dari</th>
                  {isPenyedia && (
                    <>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Mulai</th>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Dari</th>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Mulai</th>
                      <th className="px-2 py-2 border border-slate-200 dark:border-slate-700 font-bold text-center whitespace-nowrap">Dari</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ node, no }) => {
                  const badge = LEVEL_BADGE[node.type]
                  const BadgeIcon = badge.icon
                  const hasChildren = node.children.length > 0
                  const isOpen = expanded.has(node.id)
                  const indent = (node.level - 1) * 20
                  const p = node.paket
                  const td = "px-2 py-2 border border-slate-100 dark:border-slate-800 align-top break-words"

                  return (
                    <tr key={node.id} className={`transition-colors ${rowShading(node.level)}`}>
                      {/* 1. No */}
                      <td className={`${td} text-center font-mono text-[11px] whitespace-nowrap text-slate-500 dark:text-slate-400`}>
                        {no ?? dash}
                      </td>

                      {/* 2. Nama hierarki */}
                      <td className={td}>
                        <div className="flex items-center gap-1.5 min-w-0" style={{ paddingLeft: `${indent}px` }}>
                          {hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggle(node.id)}
                              className="h-5 w-5 rounded hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center shrink-0 cursor-pointer"
                              title={isOpen ? "Ciutkan" : "Bentangkan"}
                            >
                              <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                            </button>
                          ) : (
                            <span className="w-5 shrink-0 text-center text-slate-300 dark:text-slate-600 text-xs">└</span>
                          )}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600">
                            <BadgeIcon className="h-2.5 w-2.5" />
                            <span>{badge.label}</span>
                          </span>
                          <div className="min-w-0">
                            <span>{node.nama}</span>
                            {node.type !== "rekening" && (
                              <span className="ml-1.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                ({node.kode})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lokasi */}
                      <td className={`${td} whitespace-nowrap`}>{p ? p.lokasi_provinsi || dash : dash}</td>
                      <td className={`${td} whitespace-nowrap`}>{p ? p.lokasi_kabupaten || dash : dash}</td>
                      <td className={td}>{p ? p.lokasi_detail || dash : dash}</td>

                      {/* Volume */}
                      <td className={`${td} text-center whitespace-nowrap font-mono`}>
                        {p ? `${fmtAngka(p.volume)}${p.volume_satuan ? ` ${p.volume_satuan}` : ""}` : dash}
                      </td>

                      {/* Uraian & Spesifikasi */}
                      <td className={td}>{p ? p.uraian || dash : dash}</td>
                      <td className={td}>{p ? p.spesifikasi || dash : dash}</td>

                      {isPenyedia ? (
                        <>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.pdn || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.usaha_kecil || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.spp_ekonomi || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.spp_sosial || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.spp_lingkungan || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.pra_dpa || dash : dash}</td>
                          <td className={`${td} whitespace-nowrap`}>{p ? p.metode_pengadaan || dash : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? p.tersedia_ekatalog || dash : dash}</td>
                        </>
                      ) : (
                        <td className={`${td} whitespace-nowrap`}>{p ? p.tipe_swakelola || dash : dash}</td>
                      )}

                      {/* Sumber dana */}
                      <td className={`${td} whitespace-nowrap`}>{p ? p.sumber_dana || dash : dash}</td>

                      {/* MAK & Pagu — MAK berisi 3 baris: sub kegiatan, rekening, standar harga */}
                      <td className={`${td} font-mono text-[10px] whitespace-nowrap`}>
                        {node.type === "rekening" ? (
                          <span className="flex flex-col leading-tight">
                            <span>{node.makSubKegiatan || dash}</span>
                            <span>{node.makKode || dash}</span>
                            <span>{node.makStandar || dash}</span>
                          </span>
                        ) : (
                          dash
                        )}
                      </td>
                      <td className={`${td} text-right font-mono whitespace-nowrap`}>
                        {node.type === "rekening" ? fmtRp(node.makPagu ?? 0) : dash}
                      </td>

                      {/* Total Pagu (hanya baris paket ke atas) */}
                      <td className={`${td} text-right font-mono font-semibold whitespace-nowrap text-slate-900 dark:text-white`}>
                        {node.type === "rekening" ? dash : fmtRp(node.totalPagu)}
                      </td>

                      {/* Jadwal */}
                      {isPenyedia ? (
                        <>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pemanfaatan_awal) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pemanfaatan_akhir) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pelaksanaan_awal) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pelaksanaan_akhir) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pemilihan_awal) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pemilihan_akhir) : dash}</td>
                        </>
                      ) : (
                        <>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pelaksanaan_awal) : dash}</td>
                          <td className={`${td} text-center whitespace-nowrap`}>{p ? fmtWaktu(p.waktu_pelaksanaan_akhir) : dash}</td>
                        </>
                      )}
                    </tr>
                  )
                })}

                {/* Baris total */}
                <tr className="bg-slate-200 dark:bg-slate-800 font-bold">
                  {/* 26 kolom (Penyedia): label 19 + Total Pagu + 6 jadwal · 15 kolom (Swakelola): label 12 + Total Pagu + 2 jadwal */}
                  <td colSpan={isPenyedia ? 19 : 12} className="px-3 py-2.5 border border-slate-300 dark:border-slate-700 text-left">
                    TOTAL KESELURUHAN — {rincian.length} Paket {isPenyedia ? "Penyedia" : "Swakelola"}
                  </td>
                  <td className="px-3 py-2.5 border border-slate-300 dark:border-slate-700 text-right font-mono whitespace-nowrap">
                    {fmtRp(totalPagu)}
                  </td>
                  <td colSpan={isPenyedia ? 6 : 2} className="border border-slate-300 dark:border-slate-700" />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

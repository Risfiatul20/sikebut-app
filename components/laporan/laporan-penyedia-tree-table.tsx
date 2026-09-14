"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useYear } from "@/context/year-context"
import {
  ChevronRight,
  ChevronDown,
  Layers,
  Printer,
  Maximize2,
  Minimize2,
  Package,
  Loader2,
  RefreshCw,
  Wallet,
  Building2,
  FileText,
} from "lucide-react"
import {
  LaporanTreeResponse,
  LaporanSkpdNode,
  LaporanBackendPaket,
  LaporanLokasi,
} from "@/types/laporan-tree"

// Types UI Tree Node
export type TreeNodeType = "opd" | "sub_unit" | "program" | "kegiatan" | "sub_kegiatan" | "paket"

export interface LaporanTreeNode {
  id: string
  no: string
  kode: string
  nama: string
  type: TreeNodeType
  pagu: number
  totalPagu: number
  // Fields Paket
  provinsi?: string
  kabKota?: string
  detilLokasi?: string
  volume?: number | string
  satuan?: string
  uraian?: string
  spesifikasi?: string
  pdn?: string
  usahaKecil?: string
  sppEkonomi?: string
  sppSosial?: string
  sppLingkungan?: string
  praDipa?: string
  metode?: string
  tersediaEkatalog?: string
  sumberDana?: string
  mak?: string
  pemanfaatanMulai?: string
  pemanfaatanAkhir?: string
  pelaksanaanMulai?: string
  pelaksanaanAkhir?: string
  pemilihanMulai?: string
  pemilihanAkhir?: string
  children?: LaporanTreeNode[]
}

const fmtRp = (n?: number) => {
  if (n === undefined || n === null) return "—"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)
}

const fmtTgl = (val?: string | null) => {
  if (!val) return "—"
  if (val.includes("T")) {
    try {
      const d = new Date(val)
      return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" })
    } catch {
      return val
    }
  }
  return val
}

const formatLokasi = (lokasiRaw: unknown): { provinsi: string; kabKota: string; detilLokasi: string } => {
  if (!lokasiRaw) return { provinsi: "—", kabKota: "—", detilLokasi: "—" }
  if (Array.isArray(lokasiRaw) && lokasiRaw.length > 0) {
    const first = lokasiRaw[0]
    if (typeof first === "string") {
      return { provinsi: "—", kabKota: "—", detilLokasi: lokasiRaw.join(", ") }
    }
    const item = first as LaporanLokasi
    return {
      provinsi: item?.provinsi || "—",
      kabKota: item?.kabupaten || "—",
      detilLokasi: item?.detail || item?.kecamatan || "—",
    }
  }
  if (typeof lokasiRaw === "object" && lokasiRaw !== null) {
    const item = lokasiRaw as LaporanLokasi
    return {
      provinsi: item?.provinsi || "—",
      kabKota: item?.kabupaten || "—",
      detilLokasi: item?.detail || item?.kecamatan || "—",
    }
  }
  return { provinsi: "—", kabKota: "—", detilLokasi: String(lokasiRaw) }
}

const formatMak = (paket: LaporanBackendPaket): string => {
  const rkbmdAnggaran = paket.form_data?.rkbmd_per_anggaran
  if (Array.isArray(rkbmdAnggaran) && rkbmdAnggaran.length > 0) {
    const kodes = rkbmdAnggaran
      .map((a) => a?.kode_rekening || a?.kode_standar_harga)
      .filter(Boolean) as string[]
    if (kodes.length > 0) return Array.from(new Set(kodes)).join(", ")
  }
  if (Array.isArray(paket.anggaran) && paket.anggaran.length > 0) {
    const kodes = paket.anggaran.map((a) => a?.kode_standar_harga).filter(Boolean)
    if (kodes.length > 0) return Array.from(new Set(kodes)).join(", ")
  }
  return "—"
}

// Transform Data Backend ke UI Tree Hierarchy
function transformBackendTree(skpds: LaporanSkpdNode[]): LaporanTreeNode[] {
  return skpds.map((skpd, i) => {
    const opdNo = `${i + 1}`
    const opdId = `opd-${skpd.kode_skpd || i}`

    const subUnits: LaporanTreeNode[] = (skpd.sub_units || []).map((su, j) => {
      const suNo = `${opdNo}.${j + 1}`
      const suId = `su-${su.kode_sub_unit || j}`

      const programs: LaporanTreeNode[] = (su.programs || []).map((prg, k) => {
        const prgNo = `${suNo}.${k + 1}`
        const prgId = `prg-${prg.kode_program || k}`

        const kegiatans: LaporanTreeNode[] = (prg.kegiatans || []).map((keg, l) => {
          const kegNo = `${prgNo}.${l + 1}`
          const kegId = `keg-${keg.kode_kegiatan || l}`

          const subKegiatans: LaporanTreeNode[] = (keg.sub_kegiatans || []).map((subkeg, m) => {
            const subkegNo = `${kegNo}.${m + 1}`
            const subkegId = `subkeg-${subkeg.kode_sub_kegiatan || m}`

            const pakets: LaporanTreeNode[] = (subkeg.pakets || []).map((pkt, n) => {
              const pktNo = `${subkegNo}.${n + 1}`
              const pktId = `pkt-${pkt.id || n}`
              const fd = pkt.form_data || {}
              const loc = formatLokasi(fd.lokasi)

              // Format Y/T flags
              const toFlag = (v: unknown): string => {
                if (!v) return "—"
                const str = String(v).trim().toUpperCase()
                if (str === "YA" || str === "Y" || str === "TRUE" || str === "1") return "Y"
                if (str === "TIDAK" || str === "T" || str === "FALSE" || str === "0") return "T"
                return String(v)
              }

              return {
                id: pktId,
                no: pktNo,
                kode: String(pkt.id),
                nama: pkt.nama_paket,
                type: "paket" as const,
                pagu: Number(pkt.total_pagu || 0),
                totalPagu: Number(pkt.total_pagu || 0),
                provinsi: loc.provinsi,
                kabKota: loc.kabKota,
                detilLokasi: loc.detilLokasi,
                volume: fd.volume ?? "—",
                satuan: fd.volume_satuan ?? "",
                uraian: fd.uraian ?? "—",
                spesifikasi: fd.spesifikasi ?? "—",
                pdn: toFlag(fd.pdn),
                usahaKecil: toFlag(fd.usaha_kecil),
                sppEkonomi: toFlag(fd.spp_ekonomi),
                sppSosial: toFlag(fd.spp_sosial),
                sppLingkungan: toFlag(fd.spp_lingkungan),
                praDipa: toFlag(fd.pra_dpa),
                metode: fd.metode_pengadaan ? String(fd.metode_pengadaan) : "—",
                tersediaEkatalog: toFlag(fd.tersedia_ekatalog),
                sumberDana: fd.sumber_dana ? String(fd.sumber_dana) : "—",
                mak: formatMak(pkt),
                pemanfaatanMulai: fmtTgl(pkt.waktu_pemanfaatan_awal || fd.waktu_pemanfaatan_awal),
                pemanfaatanAkhir: fmtTgl(pkt.waktu_pemanfaatan_akhir || fd.waktu_pemanfaatan_akhir),
                pelaksanaanMulai: fmtTgl(pkt.waktu_pelaksanaan_awal || fd.waktu_pelaksanaan_kontrak_awal),
                pelaksanaanAkhir: fmtTgl(pkt.waktu_pelaksanaan_akhir || fd.waktu_pelaksanaan_kontrak_akhir),
                pemilihanMulai: fmtTgl(pkt.waktu_pemilihan_awal || fd.waktu_pemilihan_awal),
                pemilihanAkhir: fmtTgl(pkt.waktu_pemilihan_akhir || fd.waktu_pemilihan_akhir),
              }
            })

            return {
              id: subkegId,
              no: subkegNo,
              kode: subkeg.kode_sub_kegiatan,
              nama: subkeg.nama_sub_kegiatan,
              type: "sub_kegiatan" as const,
              pagu: Number(subkeg.total_pagu || 0),
              totalPagu: Number(subkeg.total_pagu || 0),
              children: pakets,
            }
          })

          return {
            id: kegId,
            no: kegNo,
            kode: keg.kode_kegiatan,
            nama: keg.nama_kegiatan,
            type: "kegiatan" as const,
            pagu: Number(keg.total_pagu || 0),
            totalPagu: Number(keg.total_pagu || 0),
            children: subKegiatans,
          }
        })

        return {
          id: prgId,
          no: prgNo,
          kode: prg.kode_program,
          nama: prg.nama_program,
          type: "program" as const,
          pagu: Number(prg.total_pagu || 0),
          totalPagu: Number(prg.total_pagu || 0),
          children: kegiatans,
        }
      })

      return {
        id: suId,
        no: suNo,
        kode: su.kode_sub_unit,
        nama: su.nama_sub_unit,
        type: "sub_unit" as const,
        pagu: Number(su.total_pagu || 0),
        totalPagu: Number(su.total_pagu || 0),
        children: programs,
      }
    })

    return {
      id: opdId,
      no: opdNo,
      kode: skpd.kode_skpd,
      nama: skpd.nama_skpd,
      type: "opd" as const,
      pagu: Number(skpd.total_pagu || 0),
      totalPagu: Number(skpd.total_pagu || 0),
      children: subUnits,
    }
  })
}

export function LaporanPenyediaTreeTable() {
  const { year } = useYear()
  const [dataTree, setDataTree] = useState<LaporanTreeNode[]>([])
  const [summary, setSummary] = useState<{ total_skpd: number; total_paket: number; total_pagu: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Default tertutup semua
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/laporan/penyedia?tahun=${year}`, { cache: "no-store" })
      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Gagal memuat data (HTTP ${res.status})`)
      }
      const json: LaporanTreeResponse = await res.json()
      if (json?.data?.tree) {
        setDataTree(transformBackendTree(json.data.tree))
        setSummary(json.data.summary || null)
      } else {
        setDataTree([])
        setSummary(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => {
    let ignore = false
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      fetch(`/api/laporan/penyedia?tahun=${year}`, { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text().catch(() => "")
            throw new Error(text || `Gagal memuat data (HTTP ${res.status})`)
          }
          return res.json()
        })
        .then((json: LaporanTreeResponse) => {
          if (!ignore) {
            if (json?.data?.tree) {
              setDataTree(transformBackendTree(json.data.tree))
              setSummary(json.data.summary || null)
            } else {
              setDataTree([])
              setSummary(null)
            }
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err instanceof Error ? err.message : "Gagal memuat data laporan")
          }
        })
        .finally(() => {
          if (!ignore) {
            setLoading(false)
          }
        })
    }, 0)
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [year])

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Expand / Collapse All
  const getAllParentIds = (nodes: LaporanTreeNode[]): string[] => {
    const ids: string[] = []
    const traverse = (items: LaporanTreeNode[]) => {
      for (const item of items) {
        if (item.children && item.children.length > 0) {
          ids.push(item.id)
          traverse(item.children)
        }
      }
    }
    traverse(nodes)
    return ids
  }

  const allParentIds = useMemo(() => getAllParentIds(dataTree), [dataTree])

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {}
    allParentIds.forEach((id) => (next[id] = true))
    setExpanded(next)
  }

  const handleCollapseAll = () => {
    setExpanded({})
  }

  // Rekursif render baris tabel
  const renderRows = (nodes: LaporanTreeNode[], depth = 0): React.ReactNode[] => {
    const rows: React.ReactNode[] = []

    for (const node of nodes) {
      const isPaket = node.type === "paket"
      const hasChildren = Boolean(node.children && node.children.length > 0)
      const isExpanded = expanded[node.id] ?? false

      // Background hierarchy colors
      let rowBg = "hover:bg-slate-50 dark:hover:bg-slate-800/40"
      let badgeLabel = ""
      let badgeClass = ""

      switch (node.type) {
        case "opd":
          rowBg = "bg-blue-50/75 dark:bg-blue-950/40 font-bold border-t-2 border-blue-300 dark:border-blue-800"
          badgeLabel = "OPD"
          badgeClass = "bg-blue-600 text-white"
          break
        case "sub_unit":
          rowBg = "bg-sky-50/60 dark:bg-sky-950/30 font-semibold border-t border-sky-200 dark:border-sky-900"
          badgeLabel = "SUB UNIT"
          badgeClass = "bg-sky-600 text-white"
          break
        case "program":
          rowBg = "bg-indigo-50/50 dark:bg-indigo-950/25 font-semibold"
          badgeLabel = "PROGRAM"
          badgeClass = "bg-indigo-600 text-white"
          break
        case "kegiatan":
          rowBg = "bg-violet-50/40 dark:bg-violet-950/20 font-medium"
          badgeLabel = "KEGIATAN"
          badgeClass = "bg-violet-600 text-white"
          break
        case "sub_kegiatan":
          rowBg = "bg-slate-100/70 dark:bg-slate-800/50 font-medium"
          badgeLabel = "SUB KEGIATAN"
          badgeClass = "bg-slate-600 text-white"
          break
        case "paket":
          rowBg = "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          break
      }

      rows.push(
        <tr key={node.id} className={`transition-colors text-[11px] ${rowBg}`}>
          {/* Kolom No */}
          <td className="px-2 py-2 text-center font-mono text-[10px] whitespace-nowrap text-slate-500 border-r border-slate-200 dark:border-slate-800">
            {node.no}
          </td>

          {/* Kolom Nama & Hierarchy Tree */}
          <td
            className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap"
            style={{ paddingLeft: `${Math.max(8, depth * 22)}px` }}
          >
            <div className="flex items-center gap-1.5 min-w-[280px]">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(node.id)}
                  className="h-5 w-5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors shrink-0"
                  title={isExpanded ? "Tutup" : "Buka"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-5 shrink-0 flex items-center justify-center">
                  <Package className="h-3 w-3 text-emerald-500" />
                </span>
              )}

              {badgeLabel && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight shrink-0 ${badgeClass}`}>
                  {badgeLabel}
                </span>
              )}

              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                [{node.kode}]
              </span>

              <span className="truncate" title={node.nama}>
                {node.nama}
              </span>
            </div>
          </td>

          {/* Lokasi: Provinsi | Kab/Kota | Detil */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
            {isPaket ? node.provinsi : "—"}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
            {isPaket ? node.kabKota : "—"}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 min-w-[140px] max-w-[200px] truncate" title={node.detilLokasi}>
            {isPaket ? node.detilLokasi : "—"}
          </td>

          {/* Volume */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap font-mono">
            {isPaket ? `${node.volume} ${node.satuan || ""}`.trim() : "—"}
          </td>

          {/* Uraian Pekerjaan */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 min-w-[160px] max-w-[220px] truncate" title={node.uraian}>
            {isPaket ? node.uraian : "—"}
          </td>

          {/* Spesifikasi Pekerjaan */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 min-w-[160px] max-w-[220px] truncate" title={node.spesifikasi}>
            {isPaket ? node.spesifikasi : "—"}
          </td>

          {/* PDN (Y/T) */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.pdn === "Y" ? "text-emerald-600" : node.pdn === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.pdn}
              </span>
            ) : (
              "—"
            )}
          </td>

          {/* Usaha Kecil (Y/T) */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.usahaKecil === "Y" ? "text-emerald-600" : node.usahaKecil === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.usahaKecil}
              </span>
            ) : (
              "—"
            )}
          </td>

          {/* SPP: Ekonomi | Sosial | Lingkungan */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.sppEkonomi === "Y" ? "text-emerald-600" : node.sppEkonomi === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.sppEkonomi}
              </span>
            ) : (
              "—"
            )}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.sppSosial === "Y" ? "text-emerald-600" : node.sppSosial === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.sppSosial}
              </span>
            ) : (
              "—"
            )}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.sppLingkungan === "Y" ? "text-emerald-600" : node.sppLingkungan === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.sppLingkungan}
              </span>
            ) : (
              "—"
            )}
          </td>

          {/* Pra DIPA/DPA (Y/T) */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.praDipa === "Y" ? "text-emerald-600" : node.praDipa === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.praDipa}
              </span>
            ) : (
              "—"
            )}
          </td>

          {/* Metode */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
            {isPaket ? node.metode : "—"}
          </td>

          {/* Ketersediaan e-Katalog (Y/T) */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
            {isPaket ? (
              <span className={node.tersediaEkatalog === "Y" ? "text-blue-600" : node.tersediaEkatalog === "T" ? "text-rose-500" : "text-slate-400"}>
                {node.tersediaEkatalog}
              </span>
            ) : (
              "—"
            )}
          </td>

          {/* Sumber Dana */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center whitespace-nowrap">
            {isPaket ? node.sumberDana : "—"}
          </td>

          {/* MAK */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center font-mono text-[10px] whitespace-nowrap min-w-[120px] max-w-[200px] truncate" title={node.mak}>
            {isPaket ? node.mak : "—"}
          </td>

          {/* Pagu */}
          <td className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono whitespace-nowrap">
            {fmtRp(node.pagu)}
          </td>

          {/* Total Pagu */}
          <td className="px-3 py-2 border-r border-slate-200 dark:border-slate-800 text-right font-mono font-semibold whitespace-nowrap">
            {fmtRp(node.totalPagu)}
          </td>

          {/* Pemanfaatan Barang/Jasa: Mulai | Dari */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pemanfaatanMulai : "—"}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pemanfaatanAkhir : "—"}
          </td>

          {/* Pelaksanaan Kontrak: Mulai | Dari */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pelaksanaanMulai : "—"}
          </td>
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pelaksanaanAkhir : "—"}
          </td>

          {/* Pemilihan Penyedia: Mulai | Dari */}
          <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pemilihanMulai : "—"}
          </td>
          <td className="px-2 py-2 text-center text-[10px] whitespace-nowrap">
            {isPaket ? node.pemilihanAkhir : "—"}
          </td>
        </tr>
      )

      // Jika node di-expand, render anak-anaknya
      if (hasChildren && isExpanded && node.children) {
        rows.push(...renderRows(node.children, depth + 1))
      }
    }

    return rows
  }

  return (
    <div className="space-y-4">
      {/* Top Controls: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Laporan Rencana Kebutuhan — Penyedia
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarki lengkap 6 level (OPD &rarr; Sub Unit &rarr; Program &rarr; Kegiatan &rarr; Sub Kegiatan &rarr; Paket)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleExpandAll}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
          >
            <Maximize2 className="h-3.5 w-3.5 text-slate-400" /> Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs"
          >
            <Minimize2 className="h-3.5 w-3.5 text-slate-400" /> Collapse All
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total SKPD</p>
              <p className="text-lg font-mono font-semibold text-slate-900 dark:text-white">{summary.total_skpd}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Paket</p>
              <p className="text-lg font-mono font-semibold text-slate-900 dark:text-white">{summary.total_paket}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Pagu</p>
              <p className="text-lg font-mono font-semibold text-slate-900 dark:text-white">{fmtRp(summary.total_pagu)}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {/* Tree Table Container */}
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs relative ${loading ? "min-h-[280px]" : ""}`}>
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 z-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-7 w-7 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500">Memuat hierarki data laporan...</p>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[50px]">
                  No
                </th>
                <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[320px]">
                  OPD / Sub Unit / Program / Kegiatan / Sub Kegiatan / Paket
                </th>
                <th colSpan={3} className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-800">
                  Lokasi
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[90px]">
                  Volume
                </th>
                <th rowSpan={2} className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[180px]">
                  Uraian Pekerjaan
                </th>
                <th rowSpan={2} className="px-2 py-2.5 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[180px]">
                  Spesifikasi Pekerjaan
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[65px]">
                  PDN (Y/T)
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[75px]">
                  Usaha Kecil (Y/T)
                </th>
                <th colSpan={3} className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                  Sustainable Public Procurement (SPP)
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Pra DIPA/DPA (Y/T)
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[110px]">
                  Metode
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[110px]">
                  Ketersediaan e-Katalog (Y/T)
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[100px]">
                  Sumber Dana
                </th>
                <th rowSpan={2} className="px-2 py-2.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[120px]">
                  MAK
                </th>
                <th rowSpan={2} className="px-3 py-2.5 text-right border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[120px]">
                  Pagu
                </th>
                <th rowSpan={2} className="px-3 py-2.5 text-right border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[130px]">
                  Total Pagu
                </th>
                <th colSpan={2} className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 bg-blue-50/60 dark:bg-blue-950/30">
                  Pemanfaatan Barang/Jasa
                </th>
                <th colSpan={2} className="px-2 py-2 text-center border-r border-slate-200 dark:border-slate-700 bg-indigo-50/60 dark:bg-indigo-950/30">
                  Pelaksanaan Kontrak
                </th>
                <th colSpan={2} className="px-2 py-2 text-center bg-violet-50/60 dark:bg-violet-950/30">
                  Pemilihan Penyedia
                </th>
              </tr>

              {/* Row 2 Sub-Headers */}
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                {/* Lokasi sub-headers */}
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[100px]">
                  Provinsi
                </th>
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[110px]">
                  Kab/Kota
                </th>
                <th className="px-2 py-1.5 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[140px]">
                  Detil Lokasi
                </th>

                {/* SPP sub-headers */}
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[70px]">
                  Ekonomi (Y/T)
                </th>
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[70px]">
                  Sosial (Y/T)
                </th>
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Lingkungan (Y/T)
                </th>

                {/* Pemanfaatan sub-headers */}
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Mulai
                </th>
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Dari
                </th>

                {/* Pelaksanaan sub-headers */}
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Mulai
                </th>
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Dari
                </th>

                {/* Pemilihan sub-headers */}
                <th className="px-2 py-1.5 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap min-w-[80px]">
                  Mulai
                </th>
                <th className="px-2 py-1.5 text-center whitespace-nowrap min-w-[80px]">
                  Dari
                </th>
              </tr>
            </thead>
            <tbody>
              {dataTree.length > 0 ? (
                renderRows(dataTree)
              ) : !loading ? (
                <tr>
                  <td colSpan={24} className="py-12 text-center text-xs text-slate-400">
                    Tidak ada data rencana kebutuhan penyedia untuk periode ini.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

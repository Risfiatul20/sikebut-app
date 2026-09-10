"use client"

import React, { useState, useMemo, useCallback } from "react"
import {
  ChevronRight,
  Building2,
  FolderKanban,
  FileSpreadsheet,
  FolderTree,
  ListTree,
  Maximize2,
  Minimize2,
  Download,
  Search,
  Sparkles,
} from "lucide-react"
import { LaporanRekapNode, LaporanLevelType } from "@/types/laporan"

interface LaporanTreeTableProps {
  data: LaporanRekapNode[]
  tahun?: number
}

// Format Rupiah
const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0)
}

// Format Number Paket
const formatNumber = (val: number): string => {
  return new Intl.NumberFormat("id-ID").format(val || 0)
}

// Badge level style & icon helper (hitam-putih)
const getLevelBadge = (type: LaporanLevelType, level: number) => {
  const bg = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600"
  switch (type) {
    case "opd":
      return { label: "OPD", bg, icon: Building2 }
    case "sub_unit":
      return { label: "Sub Unit", bg, icon: FolderTree }
    case "program":
      return { label: "Program", bg, icon: FolderKanban }
    case "kegiatan":
      return { label: "Kegiatan", bg, icon: ListTree }
    case "sub_kegiatan":
      return { label: "Sub Kegiatan", bg, icon: FileSpreadsheet }
  }
}

// Get Row Shading based on Level (Level 1: OPD -> Level 5: Sub Kegiatan)
const getRowShadingClass = (level: number): string => {
  switch (level) {
    case 1:
      // Level 1: OPD - Slate-100/50, Bold, strong visual anchor
      return "bg-slate-100/90 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700"
    case 2:
      // Level 2: Sub Unit - Slate-50/80, Semi-bold
      return "bg-slate-50/80 dark:bg-slate-850/50 font-semibold text-slate-850 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800"
    case 3:
      // Level 3: Program
      return "bg-white dark:bg-slate-900/90 font-medium text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/30"
    case 4:
      // Level 4: Kegiatan
      return "bg-white dark:bg-slate-900 font-normal text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
    case 5:
      // Level 5: Sub Kegiatan
      return "bg-white dark:bg-slate-900 font-normal text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-800/30"
    default:
      return "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
  }
}

// Keterisian Badge Style (hitam-putih)
const getKeterisianBadge = (persen: number) => {
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600"
}

// Helper to collect all node IDs
const getAllNodeIds = (nodes: LaporanRekapNode[]): string[] => {
  let ids: string[] = []
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      ids.push(node.id)
      ids = ids.concat(getAllNodeIds(node.children))
    }
  }
  return ids
}

export function LaporanTreeTable({ data, tahun = 2026 }: LaporanTreeTableProps) {
  // Set default: Semua Level 1 tertutup (collapsed)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [searchTerm, setSearchTerm] = useState("")

  // All expandable IDs
  const allExpandableIds = useMemo(() => getAllNodeIds(data), [data])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(allExpandableIds))
  }, [allExpandableIds])

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  // Export CSV flat list
  const handleExportCSV = useCallback(() => {
    const rows: string[][] = [
      [
        "No",
        "Level",
        "Kode",
        "Nama OPD/Sub Unit/Program/Kegiatan/Sub Kegiatan",
        "Pagu",
        "Belanja Non Pengadaan",
        "Belanja Pengadaan",
        "Identifikasi Jumlah Paket",
        "Identifikasi Jumlah Pagu",
        "Identifikasi Penyedia Paket",
        "Identifikasi Penyedia Pagu",
        "Identifikasi Swakelola Paket",
        "Identifikasi Swakelola Pagu",
        "Keterisian (%)",
      ],
    ]

    const traverse = (nodes: LaporanRekapNode[], prefix = "") => {
      nodes.forEach((n) => {
        rows.push([
          `"${n.no || ""}"`,
          `"Level ${n.level} (${n.type})"`,
          `"${n.kode}"`,
          `"${n.nama}"`,
          String(n.pagu),
          String(n.belanjaNonPengadaan),
          String(n.belanjaPengadaan),
          String(n.identifikasi.jumlah.paket),
          String(n.identifikasi.jumlah.pagu),
          String(n.identifikasi.penyedia.paket),
          String(n.identifikasi.penyedia.pagu),
          String(n.identifikasi.swakelola.paket),
          String(n.identifikasi.swakelola.pagu),
          `${n.keterisian.toFixed(2)}%`,
        ])
        if (n.children && n.children.length > 0) {
          traverse(n.children)
        }
      })
    }

    traverse(data)

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Laporan_Rekap_Identifikasi_Kebutuhan_${tahun}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [data, tahun])

  // Summary ringkasan total di baris paling bawah tabel (Grand Total dari OPD)
  const grandTotal = useMemo(() => {
    return data.reduce(
      (acc, curr) => ({
        pagu: acc.pagu + curr.pagu,
        belanjaNonPengadaan: acc.belanjaNonPengadaan + curr.belanjaNonPengadaan,
        belanjaPengadaan: acc.belanjaPengadaan + curr.belanjaPengadaan,
        identifikasiJumlahPaket: acc.identifikasiJumlahPaket + curr.identifikasi.jumlah.paket,
        identifikasiJumlahPagu: acc.identifikasiJumlahPagu + curr.identifikasi.jumlah.pagu,
        identifikasiPenyediaPaket: acc.identifikasiPenyediaPaket + curr.identifikasi.penyedia.paket,
        identifikasiPenyediaPagu: acc.identifikasiPenyediaPagu + curr.identifikasi.penyedia.pagu,
        identifikasiSwakelolaPaket: acc.identifikasiSwakelolaPaket + curr.identifikasi.swakelola.paket,
        identifikasiSwakelolaPagu: acc.identifikasiSwakelolaPagu + curr.identifikasi.swakelola.pagu,
      }),
      {
        pagu: 0,
        belanjaNonPengadaan: 0,
        belanjaPengadaan: 0,
        identifikasiJumlahPaket: 0,
        identifikasiJumlahPagu: 0,
        identifikasiPenyediaPaket: 0,
        identifikasiPenyediaPagu: 0,
        identifikasiSwakelolaPaket: 0,
        identifikasiSwakelolaPagu: 0,
      }
    )
  }, [data])

  const grandKeterisian = grandTotal.belanjaPengadaan > 0
    ? (grandTotal.identifikasiJumlahPagu / grandTotal.belanjaPengadaan) * 100
    : 0

  // Recursive Row Renderer with exact hierarchical indentation & tree collapse
  const renderTreeRows = (nodes: LaporanRekapNode[]): React.ReactNode => {
    return nodes.map((node) => {
      const hasChildren = Boolean(node.children && node.children.length > 0)
      const isExpanded = expandedIds.has(node.id)
      const badge = getLevelBadge(node.type, node.level)
      const BadgeIcon = badge.icon
      const shadingClass = getRowShadingClass(node.level)

      // Dynamic indent width based on hierarchy level (1: 0px, 2: 24px, 3: 48px, 4: 72px, 5: 96px)
      const indentPadding = (node.level - 1) * 22

      // Filter check (if search is active)
      const isMatchedSearch = !searchTerm ||
        node.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.kode.toLowerCase().includes(searchTerm.toLowerCase())

      return (
        <React.Fragment key={node.id}>
          <tr
            className={`transition-colors duration-150 ${shadingClass} ${
              !isMatchedSearch && searchTerm ? "opacity-30" : ""
            }`}
          >
            {/* 1. No */}
            <td className="px-3 py-2.5 text-center font-mono text-[11px] align-middle whitespace-nowrap text-slate-500 dark:text-slate-400">
              {node.no || "—"}
            </td>

            {/* 2. Hierarchical Name (OPD / Sub Unit / Program / Kegiatan / Sub Kegiatan) */}
            <td className="px-3 py-2.5 align-middle min-w-0 break-words">
              <div
                className="flex items-center gap-1.5 min-w-0"
                style={{ paddingLeft: `${indentPadding}px` }}
              >
                {/* Expand/Collapse Chevron Button */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggleExpand(node.id)}
                    className="h-5 w-5 rounded hover:bg-slate-200/80 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 transition-transform duration-200 cursor-pointer"
                    title={isExpanded ? "Ciutkan (Collapse)" : "Bentangkan (Expand)"}
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isExpanded ? "rotate-90 text-slate-700 dark:text-slate-300 font-bold" : ""
                      }`}
                    />
                  </button>
                ) : (
                  <span className="w-5 shrink-0 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-mono">
                    {node.level > 1 ? "└" : "•"}
                  </span>
                )}

                {/* Level Type Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase shrink-0 ${badge.bg}`}
                >
                  <BadgeIcon className="h-2.5 w-2.5" />
                  <span>{badge.label}</span>
                </span>

                {/* Name & Kode */}
                <div className="min-w-0 flex-1 ml-0.5">
                  <span
                    className={`text-xs tracking-tight ${
                      node.level === 1
                        ? "font-bold text-slate-900 dark:text-white"
                        : node.level === 2
                        ? "font-semibold text-slate-800 dark:text-slate-100"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {node.nama}
                  </span>
                  <span className="ml-1.5 font-mono text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                    ({node.kode})
                  </span>
                </div>
              </div>
            </td>

            {/* 3. Pagu Total */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-900 dark:text-slate-100">
              {formatRupiah(node.pagu)}
            </td>

            {/* 4. Belanja Non Pengadaan */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-600 dark:text-slate-400">
              {formatRupiah(node.belanjaNonPengadaan)}
            </td>

            {/* 5. Belanja Pengadaan */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle font-semibold text-slate-900 dark:text-white">
              {formatRupiah(node.belanjaPengadaan)}
            </td>

            {/* 6. Identifikasi Kebutuhan - Jumlah: Paket */}
            <td className="px-2.5 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle bg-slate-50/60 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200">
              {formatNumber(node.identifikasi.jumlah.paket)}
            </td>

            {/* 7. Identifikasi Kebutuhan - Jumlah: Pagu */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle bg-slate-50/60 dark:bg-slate-800/30 font-semibold text-slate-900 dark:text-white">
              {formatRupiah(node.identifikasi.jumlah.pagu)}
            </td>

            {/* 8. Identifikasi Kebutuhan - Penyedia: Paket */}
            <td className="px-2.5 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-700 dark:text-slate-300">
              {formatNumber(node.identifikasi.penyedia.paket)}
            </td>

            {/* 9. Identifikasi Kebutuhan - Penyedia: Pagu */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-800 dark:text-slate-200">
              {formatRupiah(node.identifikasi.penyedia.pagu)}
            </td>

            {/* 10. Identifikasi Kebutuhan - Swakelola: Paket */}
            <td className="px-2.5 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-700 dark:text-slate-300">
              {formatNumber(node.identifikasi.swakelola.paket)}
            </td>

            {/* 11. Identifikasi Kebutuhan - Swakelola: Pagu */}
            <td className="px-3 py-2.5 text-right font-mono text-[11px] whitespace-nowrap align-middle text-slate-800 dark:text-slate-200">
              {formatRupiah(node.identifikasi.swakelola.pagu)}
            </td>

            {/* 12. Keterisian (%) */}
            <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
              <span
                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getKeterisianBadge(
                  node.keterisian
                )}`}
              >
                {node.keterisian.toFixed(1)}%
              </span>
            </td>
          </tr>

          {/* Render Child Rows when node is expanded */}
          {hasChildren && isExpanded && renderTreeRows(node.children!)}
        </React.Fragment>
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Control Actions & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari OPD, program, subkegiatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Action Controls: Expand All, Collapse All, Export CSV */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExpandAll}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Bentangkan seluruh tingkatan hierarki"
          >
            <Maximize2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Expand All</span>
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            title="Ciutkan seluruh tingkatan hierarki ke Level 1 (OPD)"
          >
            <Minimize2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Collapse All</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Unduh laporan dalam format CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Hierarchical Multi-Level Table */}
      <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse laporan-rekap-table print:table-fixed print:w-full">
            {/* MULTI-LEVEL HEADER (3 ROWS PERSIS SESUAI SPESIFIKASI) */}
            <thead>
              {/* Baris Header 1 */}
              <tr className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 text-[11px] font-semibold tracking-tight border-b border-slate-400 dark:border-slate-600 select-none">
                {/* No (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-3 py-2.5 text-center font-bold border-r border-slate-300 dark:border-slate-700 w-12 align-middle uppercase text-[10px] tracking-wider"
                >
                  No
                </th>

                {/* OPD / Sub Unit / Program / Kegiatan / Sub Kegiatan (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-4 py-2.5 text-left font-bold border-r border-slate-300 dark:border-slate-700 min-w-[300px] max-w-[440px] align-middle uppercase text-[10px] tracking-wider print:min-w-0"
                >
                  OPD / Sub Unit / Program / Kegiatan / Sub Kegiatan
                </th>

                {/* Pagu (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-3 py-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-700 min-w-[110px] align-middle uppercase text-[10px] tracking-wider print:min-w-0"
                >
                  Pagu
                </th>

                {/* Belanja Non Pengadaan (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-3 py-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-600 min-w-[110px] align-middle uppercase text-[10px] tracking-wider text-slate-900 dark:text-slate-100 print:min-w-0"
                >
                  Belanja Non Pengadaan
                </th>

                {/* Belanja Pengadaan (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-3 py-2.5 text-right font-bold border-r border-slate-300 dark:border-slate-700 min-w-[110px] align-middle uppercase text-[10px] tracking-wider text-slate-900 dark:text-slate-100 print:min-w-0"
                >
                  Belanja Pengadaan
                </th>

                {/* Identifikasi Kebutuhan (colspan=6) */}
                <th
                  colSpan={6}
                  className="px-3 py-2 text-center font-bold border-r border-slate-300 dark:border-slate-600 bg-slate-200 text-slate-900 dark:text-slate-100 uppercase text-[10px] tracking-wider border-b border-slate-400 dark:border-slate-600"
                >
                  Identifikasi Kebutuhan
                </th>

                {/* Keterisian (rowspan=3) */}
                <th
                  rowSpan={3}
                  className="px-3 py-2.5 text-center font-bold min-w-[90px] align-middle uppercase text-[10px] tracking-wider text-slate-900 dark:text-slate-100 print:min-w-0"
                >
                  Keterisian
                </th>
              </tr>

              {/* Baris Header 2 (di bawah Identifikasi Kebutuhan) */}
              <tr className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-300 dark:border-slate-600 select-none">
                {/* Jumlah (colspan=2) */}
                <th
                  colSpan={2}
                  className="px-2 py-1.5 text-center border-r border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold"
                >
                  Jumlah
                </th>

                {/* Penyedia (colspan=2) */}
                <th
                  colSpan={2}
                  className="px-2 py-1.5 text-center border-r border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold"
                >
                  Penyedia
                </th>

                {/* Swakelola (colspan=2) */}
                <th
                  colSpan={2}
                  className="px-2 py-1.5 text-center border-r border-slate-300 dark:border-slate-600 bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold"
                >
                  Swakelola
                </th>
              </tr>

              {/* Baris Header 3 (Sub-kolom Paket | Pagu) */}
              <tr className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100 text-[9px] font-bold uppercase tracking-wider border-b border-slate-300 dark:border-slate-600 select-none">
                {/* Jumlah: Paket | Pagu */}
                <th className="px-2.5 py-1 text-right border-r border-slate-300 dark:border-slate-600 w-16 bg-slate-100">
                  Paket
                </th>
                <th className="px-3 py-1 text-right border-r border-slate-300 dark:border-slate-600 bg-slate-100 min-w-[110px] print:min-w-0">
                  Pagu
                </th>

                {/* Penyedia: Paket | Pagu */}
                <th className="px-2.5 py-1 text-right border-r border-slate-300 dark:border-slate-600 w-16 bg-slate-100">
                  Paket
                </th>
                <th className="px-3 py-1 text-right border-r border-slate-300 dark:border-slate-600 bg-slate-100 min-w-[110px] print:min-w-0">
                  Pagu
                </th>

                {/* Swakelola: Paket | Pagu */}
                <th className="px-2.5 py-1 text-right border-r border-slate-300 dark:border-slate-600 w-16 bg-slate-100">
                  Paket
                </th>
                <th className="px-3 py-1 text-right border-r border-slate-300 dark:border-slate-600 bg-slate-100 min-w-[110px] print:min-w-0">
                  Pagu
                </th>
              </tr>
            </thead>

            {/* HIERARCHICAL TREE ROWS */}
            <tbody>{renderTreeRows(data)}</tbody>

            {/* FOOTER TOTAL KESELURUHAN (GRAND TOTAL) */}
            <tfoot>
              <tr className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white font-bold text-xs border-t-2 border-slate-400 dark:border-slate-500">
                <td colSpan={2} className="px-4 py-3 text-left uppercase tracking-wider text-[11px]">
                  <span className="inline-flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <Sparkles className="h-3.5 w-3.5" /> Total Keseluruhan
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-900 dark:text-white">
                  {formatRupiah(grandTotal.pagu)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatRupiah(grandTotal.belanjaNonPengadaan)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-900 dark:text-white">
                  {formatRupiah(grandTotal.belanjaPengadaan)}
                </td>
                <td className="px-2.5 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatNumber(grandTotal.identifikasiJumlahPaket)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-900 dark:text-white">
                  {formatRupiah(grandTotal.identifikasiJumlahPagu)}
                </td>
                <td className="px-2.5 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatNumber(grandTotal.identifikasiPenyediaPaket)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatRupiah(grandTotal.identifikasiPenyediaPagu)}
                </td>
                <td className="px-2.5 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatNumber(grandTotal.identifikasiSwakelolaPaket)}
                </td>
                <td className="px-3 py-3 text-right font-mono text-[12px] text-slate-700 dark:text-slate-200">
                  {formatRupiah(grandTotal.identifikasiSwakelolaPagu)}
                </td>
                <td className="px-3 py-3 text-center align-middle whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-200 text-slate-900 border border-slate-400 dark:bg-slate-700 dark:text-white">
                    {grandKeterisian.toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { SipdItem, SipdVersionInfo } from "@/types/sipd"
import { useSkpd } from "@/hooks/useSkpd"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { SipdColumnDropdown, DEFAULT_SIPD_COLUMNS } from "./sipd-column-dropdown"
import { SipdDetailModal } from "./sipd-detail-modal"
import {
  Search,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react"

interface SipdDataTableProps {
  items: SipdItem[]
  versions: SipdVersionInfo[]
  activeVersion: number
  activeYear: number
  onChangeVersion: (versi: number) => void
  onChangeYear: (tahun: number) => void
}

export function SipdDataTable({
  items,
  versions,
  activeVersion,
  activeYear,
  onChangeVersion,
  onChangeYear,
}: SipdDataTableProps) {
  const [search, setSearch] = useState("")
  const [selectedSkpd, setSelectedSkpd] = useState("ALL")
  const [selectedSumberDana, setSelectedSumberDana] = useState("ALL")

  // Ambil daftar SKPD dari API
  const { skpdList } = useSkpd()
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sikebut-sipd-columns")
        if (saved) return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return DEFAULT_SIPD_COLUMNS
  })

  const [selectedItemForDetail, setSelectedItemForDetail] = useState<SipdItem | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sorting state
  const [sortField, setSortField] = useState<string>("pagu")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Column Visibility Handlers
  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const updated = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem("sikebut-sipd-columns", JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_SIPD_COLUMNS)
    try {
      localStorage.setItem("sikebut-sipd-columns", JSON.stringify(DEFAULT_SIPD_COLUMNS))
    } catch {
      // ignore
    }
  }

  const handleSelectAllColumns = () => {
    const allTrue: Record<string, boolean> = {
      skpd: true,
      urusan: true,
      bidang_urusan: true,
      program: true,
      kegiatan: true,
      sub_kegiatan: true,
      sumber_dana: true,
      rekening: true,
      standar_harga: true,
      pagu: true,
      aksi: true,
    }
    setVisibleColumns(allTrue)
    try {
      localStorage.setItem("sikebut-sipd-columns", JSON.stringify(allTrue))
    } catch {
      // ignore
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Unique Sumber Dana options from items
  const sumberDanaOptions = useMemo(() => {
    const set = new Set<string>()
    items.forEach((it) => {
      if (it.kode_sumber_dana) set.add(it.kode_sumber_dana)
    })
    return Array.from(set)
  }, [items])

  const skpdFilterOptions: SearchableSelectOption[] = [
    { value: "ALL", label: "Semua Perangkat Daerah" },
    ...skpdList.map((s) => ({
      value: s.kode_skpd,
      label: s.is_sub_unit ? `↳ ${s.nama_skpd}` : s.nama_skpd,
      group: s.is_sub_unit ? "Sub Unit" : "SKPD Induk",
    })),
  ]

  const sumberDanaFilterOptions: SearchableSelectOption[] = [
    { value: "ALL", label: "Semua Sumber Dana" },
    ...sumberDanaOptions.map((sd) => ({
      value: sd,
      label: sd,
    })),
  ]

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim()

    const result = items.filter((it) => {
      // Version filter (0 = all versions)
      if (activeVersion > 0 && it.versi !== activeVersion) return false
      // Year filter
      if (activeYear > 0 && it.tahun !== activeYear) return false
      // SKPD filter
      if (selectedSkpd !== "ALL" && it.kode_skpd !== selectedSkpd) return false
      // Sumber Dana filter
      if (selectedSumberDana !== "ALL" && it.kode_sumber_dana !== selectedSumberDana) return false

      if (q) {
        const matchProgram = it.nama_program.toLowerCase().includes(q) || it.kode_program.toLowerCase().includes(q)
        const matchKegiatan = it.nama_kegiatan.toLowerCase().includes(q) || it.kode_kegiatan.toLowerCase().includes(q)
        const matchSub = it.nama_sub_kegiatan.toLowerCase().includes(q) || it.kode_sub_kegiatan.toLowerCase().includes(q)
        const matchRekening = it.nama_rekening.toLowerCase().includes(q) || it.kode_rekening.toLowerCase().includes(q)
        const matchStandar = it.nama_standar_harga.toLowerCase().includes(q) || it.kode_standar_harga.toLowerCase().includes(q)
        const matchSkpd = it.nama_skpd.toLowerCase().includes(q) || it.kode_skpd.toLowerCase().includes(q)
        const matchUrusan = it.nama_urusan.toLowerCase().includes(q) || it.kode_urusan.toLowerCase().includes(q)
        const matchBidang = it.nama_bidang_urusan.toLowerCase().includes(q) || it.kode_bidang_urusan.toLowerCase().includes(q)

        if (
          !matchProgram &&
          !matchKegiatan &&
          !matchSub &&
          !matchRekening &&
          !matchStandar &&
          !matchSkpd &&
          !matchUrusan &&
          !matchBidang
        ) {
          return false
        }
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      let aVal = (a as unknown as Record<string, unknown>)[sortField]
      let bVal = (b as unknown as Record<string, unknown>)[sortField]

      if (aVal === undefined || aVal === null) aVal = ""
      if (bVal === undefined || bVal === null) bVal = ""

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal
      }

      if (String(aVal) < String(bVal)) return sortOrder === "asc" ? -1 : 1
      if (String(aVal) > String(bVal)) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return result
  }, [items, search, activeVersion, activeYear, selectedSkpd, selectedSumberDana, sortField, sortOrder])

  // Pagination calculation
  const totalItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  // Total Pagu of filtered set
  const totalPaguFiltered = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.pagu, 0)
  }, [filteredItems])

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Tahun",
      "Versi",
      "Kode SKPD",
      "Nama SKPD",
      "Kode Urusan",
      "Nama Urusan",
      "Kode Bidang Urusan",
      "Nama Bidang Urusan",
      "Kode Program",
      "Nama Program",
      "Kode Kegiatan",
      "Nama Kegiatan",
      "Kode Sub Kegiatan",
      "Nama Sub Kegiatan",
      "Kode Sumber Dana",
      "Nama Sumber Dana",
      "Kode Rekening",
      "Nama Rekening",
      "Kode Standar Harga",
      "Nama Standar Harga",
      "Pagu Anggaran",
    ]

    const rows = filteredItems.map((it) => [
      it.id,
      it.tahun,
      it.versi,
      `"${it.kode_skpd}"`,
      `"${it.nama_skpd}"`,
      `"${it.kode_urusan}"`,
      `"${it.nama_urusan}"`,
      `"${it.kode_bidang_urusan}"`,
      `"${it.nama_bidang_urusan}"`,
      `"${it.kode_program}"`,
      `"${it.nama_program}"`,
      `"${it.kode_kegiatan}"`,
      `"${it.nama_kegiatan}"`,
      `"${it.kode_sub_kegiatan}"`,
      `"${it.nama_sub_kegiatan}"`,
      `"${it.kode_sumber_dana}"`,
      `"${it.nama_sumber_dana}"`,
      `"${it.kode_rekening}"`,
      `"${it.nama_rekening}"`,
      `"${it.kode_standar_harga}"`,
      `"${it.nama_standar_harga}"`,
      it.pagu,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `data_sipd_penetapan_${activeYear}_v${activeVersion || "all"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Table Top Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
        {/* Version & Year Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tahun:</span>
              <select
                value={activeYear}
                onChange={(e) => {
                  onChangeYear(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            {/* Version Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Versi APBD:</span>
              <select
                value={activeVersion}
                onChange={(e) => {
                  onChangeVersion(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="h-8 max-w-[260px] truncate rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs font-medium text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value={0}>Semua Versi APBD ({activeYear})</option>
                {versions
                  .filter((v) => v.tahun === activeYear)
                  .map((v) => (
                    <option key={v.versi} value={v.versi}>
                      Versi {v.versi} - {v.nama_versi}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quick Stats of Filtered View */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Pagu Tampil</p>
              <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatRupiah(totalPaguFiltered)}
              </p>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Rincian Data</p>
              <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                {filteredItems.length} RKA
              </p>
            </div>
          </div>
        </div>

        {/* Filter Inputs & Column Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari program, subkegiatan, rekening..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter SKPD */}
            <SearchableSelect
              options={skpdFilterOptions}
              value={selectedSkpd}
              onChange={(val) => { setSelectedSkpd(val); setCurrentPage(1) }}
              placeholder="Semua Perangkat Daerah"
              className="max-w-[200px]"
            />

            {/* Filter Sumber Dana */}
            <SearchableSelect
              options={sumberDanaFilterOptions}
              value={selectedSumberDana}
              onChange={(val) => { setSelectedSumberDana(val); setCurrentPage(1) }}
              placeholder="Semua Sumber Dana"
            />

            {(search || selectedSkpd !== "ALL" || selectedSumberDana !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSelectedSkpd("ALL")
                  setSelectedSumberDana("ALL")
                  setCurrentPage(1)
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 py-1"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Column Selector */}
            <SipdColumnDropdown
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
              onResetColumns={handleResetColumns}
              onSelectAllColumns={handleSelectAllColumns}
            />

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Export data SIPD ke CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 select-none">
                {/* SKPD */}
                {visibleColumns.skpd && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[180px]"
                    onClick={() => handleSort("nama_skpd")}
                  >
                    <div className="flex items-center gap-1">
                      <span>SKPD</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Urusan */}
                {visibleColumns.urusan && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[140px]"
                    onClick={() => handleSort("nama_urusan")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Urusan</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Bidang Urusan */}
                {visibleColumns.bidang_urusan && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[140px]"
                    onClick={() => handleSort("nama_bidang_urusan")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Bidang Urusan</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Program */}
                {visibleColumns.program && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[170px]"
                    onClick={() => handleSort("nama_program")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Program</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Kegiatan */}
                {visibleColumns.kegiatan && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[170px]"
                    onClick={() => handleSort("nama_kegiatan")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Kegiatan</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Subkegiatan */}
                {visibleColumns.sub_kegiatan && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[190px]"
                    onClick={() => handleSort("nama_sub_kegiatan")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Sub Kegiatan</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Sumber Dana */}
                {visibleColumns.sumber_dana && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[110px]"
                    onClick={() => handleSort("kode_sumber_dana")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Sumber Dana</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Rekening */}
                {visibleColumns.rekening && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[170px]"
                    onClick={() => handleSort("nama_rekening")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Rekening Belanja</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Standar Harga */}
                {visibleColumns.standar_harga && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[160px]"
                    onClick={() => handleSort("nama_standar_harga")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Standar Harga (SSH)</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Pagu */}
                {visibleColumns.pagu && (
                  <th
                    className="font-semibold px-3.5 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 text-right min-w-[140px]"
                    onClick={() => handleSort("pagu")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Pagu (Rp)</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Aksi */}
                {visibleColumns.aksi && (
                  <th className="font-semibold px-3.5 py-3 text-right">Aksi</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                    className="text-center text-xs text-slate-400 py-12"
                  >
                    Tidak ada rincian data SIPD yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* SKPD */}
                    {visibleColumns.skpd && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-900 dark:text-slate-100 leading-snug">
                          {item.nama_skpd}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {item.kode_skpd}
                        </p>
                      </td>
                    )}

                    {/* Urusan */}
                    {visibleColumns.urusan && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200 leading-snug line-clamp-2" title={item.nama_urusan}>
                          {item.nama_urusan}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Kode: {item.kode_urusan}
                        </p>
                      </td>
                    )}

                    {/* Bidang Urusan */}
                    {visibleColumns.bidang_urusan && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200 leading-snug">
                          {item.nama_bidang_urusan}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                          Kode: {item.kode_bidang_urusan}
                        </p>
                      </td>
                    )}

                    {/* Program */}
                    {visibleColumns.program && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-blue-900 dark:text-blue-300 leading-snug">
                          {item.nama_program}
                        </p>
                        <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 font-semibold">
                          {item.kode_program}
                        </p>
                      </td>
                    )}

                    {/* Kegiatan */}
                    {visibleColumns.kegiatan && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200 leading-snug">
                          {item.nama_kegiatan}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.kode_kegiatan}
                        </p>
                      </td>
                    )}

                    {/* Sub Kegiatan */}
                    {visibleColumns.sub_kegiatan && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-semibold text-[11px] text-slate-900 dark:text-slate-100 leading-snug">
                          {item.nama_sub_kegiatan}
                        </p>
                        <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                          {item.kode_sub_kegiatan}
                        </p>
                      </td>
                    )}

                    {/* Sumber Dana */}
                    {visibleColumns.sumber_dana && (
                      <td className="px-3.5 py-2.5 align-top whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          {item.kode_sumber_dana}
                        </span>
                      </td>
                    )}

                    {/* Rekening Belanja */}
                    {visibleColumns.rekening && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200 leading-snug">
                          {item.nama_rekening}
                        </p>
                        <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 font-semibold">
                          {item.kode_rekening}
                        </p>
                      </td>
                    )}

                    {/* Standar Harga */}
                    {visibleColumns.standar_harga && (
                      <td className="px-3.5 py-2.5 align-top">
                        <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200 leading-snug">
                          {item.nama_standar_harga}
                        </p>
                        <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-semibold">
                          {item.kode_standar_harga}
                        </p>
                      </td>
                    )}

                    {/* Pagu */}
                    {visibleColumns.pagu && (
                      <td className="px-3.5 py-2.5 align-top text-right whitespace-nowrap">
                        <p className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {formatRupiah(item.pagu)}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          v{item.versi} ({item.tahun})
                        </p>
                      </td>
                    )}

                    {/* Aksi */}
                    {visibleColumns.aksi && (
                      <td className="px-3.5 py-2.5 align-top text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedItemForDetail(item)}
                          className="h-7 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:text-slate-300 dark:hover:text-blue-300 text-[11px] font-medium transition-colors"
                          title="Lihat Struktur Lengkap RKA"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline ml-2">
              Menampilkan {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} rincian RKA
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <SipdDetailModal
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
      />
    </div>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ListTree, Search, RotateCcw, Filter, Loader2, Check, Table2 } from "lucide-react"
import { useAkun } from "@/hooks/useAkun"

export default function KodeAkunPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)

  // Filter boolean untuk 4 indikator RKBMD
  const [filterB, setFilterB] = useState<boolean | undefined>(undefined)
  const [filterR, setFilterR] = useState<boolean | undefined>(undefined)
  const [filterH, setFilterH] = useState<boolean | undefined>(undefined)
  const [filterT, setFilterT] = useState<boolean | undefined>(undefined)

  // Muat seluruh data SEKALI (backend sudah scoping per user) — respons pertama ~3s
  // lalu di-cache Next.js (revalidate 3600) sehingga reload berikutnya instan.
  const { akunList, isLoading, error, reload } = useAkun()

  // Filter client-side: instan tanpa request tambahan per ketikan.
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase()
    return akunList.filter((a) => {
      if (q && !a.kode.toLowerCase().includes(q) && !a.nama.toLowerCase().includes(q)) return false
      if (levelFilter !== null && a.level !== levelFilter) return false
      if (filterB !== undefined && a.b !== filterB) return false
      if (filterR !== undefined && a.r !== filterR) return false
      if (filterH !== undefined && a.h !== filterH) return false
      if (filterT !== undefined && a.t !== filterT) return false
      return true
    })
  }, [akunList, search, levelFilter, filterB, filterR, filterH, filterT])

  // Hitung summary dinamis dari hasil filter
  const totalAkun = filteredList.length
  const totalBelanja = useMemo(() => filteredList.filter((a) => a.b).length, [filteredList])
  const totalRkbmd = useMemo(() => filteredList.filter((a) => a.r).length, [filteredList])
  const maxLevel = useMemo(
    () => (filteredList.length > 0 ? Math.max(...filteredList.map((a) => a.level)) : 0),
    [filteredList]
  )

  // Pagination client-side (hindari render 3.301 baris sekaligus)
  useEffect(() => {
    setPage(1)
  }, [search, levelFilter, filterB, filterR, filterH, filterT])

  const totalPages = Math.max(1, Math.ceil(filteredList.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filteredList.slice((safePage - 1) * perPage, safePage * perPage),
    [filteredList, safePage, perPage]
  )

  const hasActiveFilters = Boolean(
    search ||
    levelFilter !== null ||
    filterB !== undefined ||
    filterR !== undefined ||
    filterH !== undefined ||
    filterT !== undefined
  )

  const handleResetFilters = () => {
    setSearch("")
    setLevelFilter(null)
    setFilterB(undefined)
    setFilterR(undefined)
    setFilterH(undefined)
    setFilterT(undefined)
    setPage(1)
  }

  // Toggle filter boolean state: undefined -> true -> undefined
  const toggleFlag = (
    current: boolean | undefined,
    setter: (val: boolean | undefined) => void
  ) => {
    if (current === undefined) {
      setter(true)
    } else {
      setter(undefined)
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ListTree className="h-4 w-4" />
            </span>
            <h1 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Master Data Kode Akun
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Struktur rekening belanja dan indikator RKBMD dari API (<code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">GET /api/v1/ref-akun</code>).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/sipd/kode-akun/view"
            className="h-8 px-2.5 flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Beralih ke tampilan flat berjenjang sejajar per baris"
          >
            <Table2 className="h-3.5 w-3.5" />
            <span>Mode Flat (View)</span>
          </Link>
          <button
            type="button"
            onClick={() => reload()}
            className="h-8 px-2.5 flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Muat ulang data dari server"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-500" : ""}`} />
            <span>Sinkronkan</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Total Kode Akun
          </p>
          <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-1.5 font-mono">
            {totalAkun}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            Belanja Pengadaan (b)
          </p>
          <p className="font-display text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1.5 font-mono">
            {totalBelanja}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            RKBMD Pengadaan (r)
          </p>
          <p className="font-display text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5 font-mono">
            {totalRkbmd}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Kedalaman Level
          </p>
          <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-1.5 font-mono">
            {maxLevel > 0 ? `L${maxLevel}` : "—"}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
        {/* Table Control Bar: Search & Level Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
              <ListTree className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                Daftar Kode Akun Berjenjang
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">dev.ref_akun &bull; dev.akun_indikator_rkbmd</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode / nama akun…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter === null ? "" : String(levelFilter)}
              onChange={(e) => setLevelFilter(e.target.value ? Number(e.target.value) : null)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            >
              <option value="">Semua Level</option>
              <option value="1">Level 1 (Akun)</option>
              <option value="2">Level 2 (Kelompok)</option>
              <option value="3">Level 3 (Jenis)</option>
              <option value="4">Level 4 (Objek)</option>
              <option value="5">Level 5 (Rincian Objek)</option>
              <option value="6">Level 6 (Sub Rincian)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 py-1 flex items-center gap-1"
                title="Bersihkan semua filter"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: 4 Indikator RKBMD (b, r, h, t) */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter Indikator:
          </span>

          {/* Filter Belanja Pengadaan (b) */}
          <button
            type="button"
            onClick={() => toggleFlag(filterB, setFilterB)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              filterB === true
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50/50 dark:hover:bg-blue-500/10"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterB === true ? "bg-white" : "bg-blue-500"}`}></span>
            <span>Belanja Pengadaan</span>
            {filterB === true && <Check className="h-3 w-3 stroke-[3]" />}
          </button>

          {/* Filter RKBMD Pengadaan (r) */}
          <button
            type="button"
            onClick={() => toggleFlag(filterR, setFilterR)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              filterR === true
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterR === true ? "bg-white" : "bg-indigo-500"}`}></span>
            <span>RKBMD Pengadaan</span>
            {filterR === true && <Check className="h-3 w-3 stroke-[3]" />}
          </button>

          {/* Filter Pemeliharaan Rehab (h) */}
          <button
            type="button"
            onClick={() => toggleFlag(filterH, setFilterH)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              filterH === true
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-amber-500/10"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterH === true ? "bg-white" : "bg-amber-500"}`}></span>
            <span>Pemeliharaan Rehab</span>
            {filterH === true && <Check className="h-3 w-3 stroke-[3]" />}
          </button>

          {/* Filter Pemeliharaan Rutin (t) */}
          <button
            type="button"
            onClick={() => toggleFlag(filterT, setFilterT)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
              filterT === true
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${filterT === true ? "bg-white" : "bg-emerald-500"}`}></span>
            <span>Pemeliharaan Rutin</span>
            {filterT === true && <Check className="h-3 w-3 stroke-[3]" />}
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 select-none">
                <th className="font-semibold px-4 py-2.5">Kode Akun</th>
                <th className="font-semibold px-4 py-2.5">Nama Akun</th>
                <th className="font-semibold px-4 py-2.5 text-center">Level</th>
                <th className="font-semibold px-4 py-2.5">Parent</th>
                <th className="font-semibold px-4 py-2.5">Indikator RKBMD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center text-xs text-slate-400 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Memuat data kode akun dari API...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center text-xs text-red-500 py-10">
                    {error}
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-xs text-slate-400 py-10">
                    Tidak ada kode akun yang cocok dengan pencarian atau filter aktif.
                  </td>
                </tr>
              ) : (
                paginated.map((a) => {
                  return (
                    <tr
                      key={a.kode}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap font-medium text-[11px]">
                        {a.kode}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          style={{ paddingLeft: `${(a.level - 1) * 14}px` }}
                          className="inline-block font-medium text-slate-800 dark:text-slate-100"
                        >
                          {a.level > 1 && (
                            <span className="text-slate-300 dark:text-slate-600 mr-1.5">└</span>
                          )}
                          <span className={a.level <= 2 ? "font-bold text-slate-900 dark:text-white" : ""}>
                            {a.nama}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400">
                          {a.level}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-400 text-[11px]">
                        {a.parent || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {a.b && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                              Belanja Pengadaan
                            </span>
                          )}
                          {a.r && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              RKBMD Pengadaan
                            </span>
                          )}
                          {a.h && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Pemeliharaan Rehab
                            </span>
                          )}
                          {a.t && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Pemeliharaan Rutin
                            </span>
                          )}
                          {!a.b && !a.r && !a.h && !a.t && (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && !error && filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Menampilkan{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filteredList.length)}
                </span>{" "}
                dari{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {filteredList.length}
                </span>{" "}
                kode akun
              </span>
              <select
                value={String(perPage)}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2 text-[11px] text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              >
                <option value="25">25 / hal</option>
                <option value="50">50 / hal</option>
                <option value="100">100 / hal</option>
                <option value="200">200 / hal</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              <span className="px-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Hal. {safePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

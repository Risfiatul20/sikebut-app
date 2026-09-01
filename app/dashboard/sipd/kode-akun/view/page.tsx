"use client"

import { useState } from "react"
import Link from "next/link"
import { ListTree, Search, RotateCcw, Filter, Loader2, Check, ChevronLeft, ChevronRight, Table2 } from "lucide-react"
import { useAkunView } from "@/hooks/useAkunView"

export default function KodeAkunViewPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)

  // Filter boolean untuk 4 indikator RKBMD
  const [filterB, setFilterB] = useState<boolean | undefined>(undefined)
  const [filterR, setFilterR] = useState<boolean | undefined>(undefined)
  const [filterH, setFilterH] = useState<boolean | undefined>(undefined)
  const [filterT, setFilterT] = useState<boolean | undefined>(undefined)

  const { data, meta, isLoading, error, reload } = useAkunView({
    search,
    b: filterB,
    r: filterR,
    h: filterH,
    t: filterT,
    page,
    perPage,
  })

  const hasActiveFilters = Boolean(search || filterB !== undefined || filterR !== undefined || filterH !== undefined || filterT !== undefined)

  const handleResetFilters = () => {
    setSearch("")
    setFilterB(undefined)
    setFilterR(undefined)
    setFilterH(undefined)
    setFilterT(undefined)
    setPage(1)
  }

  const toggleFlag = (current: boolean | undefined, setter: (val: boolean | undefined) => void) => {
    setPage(1)
    if (current === undefined) setter(true)
    else setter(undefined)
  }

  const totalPages = meta?.last_page ?? 1
  const total = meta?.total ?? 0

  // Konteks hirarki digabung untuk sel "Struktur Akun"
  const renderHierarki = (item: (typeof data)[0]) => (
    <div className="space-y-0.5 text-[11px] leading-snug">
      {item.nama_2 && (
        <p className="text-slate-500 dark:text-slate-400">
          <span className="font-mono text-slate-400 mr-1">{item.kode_2}</span>
          {item.nama_2}
        </p>
      )}
      {item.nama_3 && (
        <p className="text-slate-500 dark:text-slate-400 pl-2">
          <span className="font-mono text-slate-400 mr-1">{item.kode_3}</span>
          {item.nama_3}
        </p>
      )}
      {item.nama_4 && (
        <p className="text-slate-600 dark:text-slate-300 pl-4">
          <span className="font-mono text-slate-400 mr-1">{item.kode_4}</span>
          {item.nama_4}
        </p>
      )}
      {item.nama_5 && (
        <p className="text-slate-700 dark:text-slate-200 pl-6">
          <span className="font-mono text-slate-400 mr-1">{item.kode_5}</span>
          {item.nama_5}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Table2 className="h-4 w-4" />
            </span>
            <h1 className="font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Master Kode Akun (Tampilan Flat)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Format berjenjang sejajar per baris dari{" "}
            <code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">GET /api/v1/ref-akun/view</code>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/sipd/kode-akun"
            className="h-8 px-2.5 flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ListTree className="h-3.5 w-3.5" />
            <span>Mode Berjenjang</span>
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

      {/* Main Table Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
              <ListTree className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                Daftar Akun Level 6 + Konteks Induk
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {total > 0 ? `${meta?.from}–${meta?.to} dari ${total} akun` : `${total} akun`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode_6 / nama level 2–6…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            <select
              value={String(perPage)}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/40"
              title="Baris per halaman"
            >
              <option value="10">10 / halaman</option>
              <option value="15">15 / halaman</option>
              <option value="25">25 / halaman</option>
              <option value="50">50 / halaman</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 py-1 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: 4 Indikator RKBMD */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filter Indikator:
          </span>

          {[
            { key: filterB, setter: setFilterB, label: "Belanja Pengadaan", color: "blue", dot: "bg-blue-500", active: "bg-blue-600 border-blue-600" },
            { key: filterR, setter: setFilterR, label: "RKBMD Pengadaan", color: "indigo", dot: "bg-indigo-500", active: "bg-indigo-600 border-indigo-600" },
            { key: filterH, setter: setFilterH, label: "Pemeliharaan Rehab", color: "amber", dot: "bg-amber-500", active: "bg-amber-600 border-amber-600" },
            { key: filterT, setter: setFilterT, label: "Pemeliharaan Rutin", color: "emerald", dot: "bg-emerald-500", active: "bg-emerald-600 border-emerald-600" },
          ].map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => toggleFlag(f.key, f.setter)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                f.key === true
                  ? `text-white ${f.active} shadow-xs`
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${f.key === true ? "bg-white" : f.dot}`}></span>
              <span>{f.label}</span>
              {f.key === true && <Check className="h-3 w-3 stroke-[3]" />}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 select-none">
                <th className="font-semibold px-4 py-2.5 min-w-[260px]">Struktur Akun (Level 2 → 5)</th>
                <th className="font-semibold px-4 py-2.5 min-w-[200px]">Akun Level 6 (Rekening)</th>
                <th className="font-semibold px-4 py-2.5">Indikator RKBMD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center text-xs text-slate-400 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Memuat data dari API...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="text-center text-xs text-red-500 py-10">
                    {error}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-xs text-slate-400 py-10">
                    Tidak ada kode akun yang cocok dengan pencarian atau filter aktif.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.kode_6} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 align-top">{renderHierarki(item)}</td>
                    <td className="px-4 py-2.5 align-top">
                      <p className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {item.kode_6}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 leading-snug">
                        {item.nama_6}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <div className="flex flex-wrap gap-1">
                        {item.b && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            Belanja Pengadaan
                          </span>
                        )}
                        {item.r && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                            RKBMD Pengadaan
                          </span>
                        )}
                        {item.h && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                            Pemeliharaan Rehab
                          </span>
                        )}
                        {item.t && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Pemeliharaan Rutin
                          </span>
                        )}
                        {!item.b && !item.r && !item.h && !item.t && (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Halaman {meta?.current_page ?? page} dari {totalPages}
            {total > 0 && ` — menampilkan ${meta?.from}–${meta?.to} dari ${total} akun`}
          </p>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={(meta?.current_page ?? page) <= 1 || isLoading}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={(meta?.current_page ?? page) >= totalPages || isLoading}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

"use client"

import { useState } from "react"
import { RkbmdPengadaanItem } from "@/types/rkbmd"
import { RkbmdImportDropzone } from "@/components/rkbmd/rkbmd-import-dropzone"
import { RkbmdManualForm } from "@/components/rkbmd/rkbmd-manual-form"
import { useRkbmdList } from "@/hooks/useRkbmdList"
import { useSkpd } from "@/hooks/useSkpd"
import {
  Package,
  UploadCloud,
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  PackagePlus,
} from "lucide-react"

export default function RkbmdPengadaanPage() {
  const { skpdList } = useSkpd()

  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RkbmdPengadaanItem | null>(null)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedSkpd, setSelectedSkpd] = useState("ALL")
  const [selectedPeriode, setSelectedPeriode] = useState<number>(2026)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortBy, setSortBy] = useState("id_pengadaan")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Server-side pagination Laravel (membaca meta)
  const { data: items, meta, isLoading, reload } = useRkbmdList<RkbmdPengadaanItem>({
    endpoint: "pengadaan",
    search,
    kode_skpd: selectedSkpd,
    periode: selectedPeriode,
    page,
    perPage,
    sortBy,
    sortDirection,
  })

  const total = meta?.total ?? items.length
  const totalPages = meta?.last_page ?? Math.max(1, Math.ceil(total / perPage))

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearch("")
    setSelectedSkpd("ALL")
    setSelectedPeriode(2026)
    setPage(1)
  }

  const hasActiveFilters = Boolean(search || selectedSkpd !== "ALL" || selectedPeriode !== 2026)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Disetujui Penelaah":
      case "Disetujui":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
      case "Dalam Proses Review":
      case "Draft":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Package className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              RKBMD Pengadaan
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data Rencana Kebutuhan Barang Milik Daerah (RKBMD) Pengadaan dari tabel <code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">dev.rkbmd_pengadaan</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => reload()}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-500" : "text-slate-400"}`} />
            <span>Sinkronkan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManualOpen(true)}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PackagePlus className="h-3.5 w-3.5" />
            <span>Tambah Manual</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen((prev) => !prev)}
            className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-colors ${
              isImportOpen
                ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                : "border-blue-600 bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{isImportOpen ? "Tutup Form Impor" : "Form Impor RKBMD Pengadaan"}</span>
            {isImportOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Import Section Dropzone */}
      {isImportOpen && (
        <RkbmdImportDropzone
          type="pengadaan"
          title="RKBMD Pengadaan"
          onImportSuccess={() => reload()}
        />
      )}

      {/* Main Table Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Control Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama barang, kode fikasi, SKPD..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            <select
              value={selectedSkpd}
              onChange={(e) => {
                setSelectedSkpd(e.target.value)
                setPage(1)
              }}
              className="h-8 max-w-[200px] truncate rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="ALL">Semua Perangkat Daerah</option>
              {skpdList.map((s) => (
                <option key={s.kode_skpd} value={s.kode_skpd}>
                  {s.is_sub_unit ? `↳ ${s.nama_skpd}` : s.nama_skpd}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriode}
              onChange={(e) => {
                setSelectedPeriode(Number(e.target.value))
                setPage(1)
              }}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value={2027}>Periode 2027</option>
              <option value={2026}>Periode 2026</option>
              <option value={2025}>Periode 2025</option>
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

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end md:self-auto">
            <span>Baris per halaman:</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Database Schema Tag */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold">
              dev.rkbmd_pengadaan
            </span>
            <span>Rencana kebutuhan barang hasil impor & penelaahan RKBMD.</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
            {total} data ditemukan
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 select-none">
                <th
                  className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[200px]"
                  onClick={() => handleSort("nama_barang")}
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Barang / Kode Fikasi</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="font-semibold px-4 py-3 text-center min-w-[100px]">Jumlah Kebutuhan</th>
                <th className="font-semibold px-4 py-3 min-w-[150px]">Cara Pemenuhan</th>
                <th
                  className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[180px]"
                  onClick={() => handleSort("nama_skpd")}
                >
                  <div className="flex items-center gap-1">
                    <span>SKPD / Unit Kerja</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="font-semibold px-4 py-3 min-w-[180px]">Sub Kegiatan</th>
                <th className="font-semibold px-4 py-3 min-w-[120px]">Status RKBMD</th>
                <th className="font-semibold px-4 py-3 text-right min-w-[80px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center text-xs text-slate-400 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Memuat data RKBMD Pengadaan...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-xs text-slate-400 py-12">
                    Tidak ada data RKBMD Pengadaan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id_pengadaan}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                        {item.nama_barang}
                      </p>
                      <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                        Kode Fikasi: {item.kode_fikasi}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <p className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {item.jumlah_barang} {item.satuan}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Maks: {item.jumlah_maksimum} {item.satuan}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {item.cara_pemenuhan}
                      </p>
                      {item.keterangan && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={item.keterangan}>
                          {item.keterangan}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-[11px] text-slate-900 dark:text-slate-100 truncate max-w-[200px]" title={item.nama_skpd}>
                        {item.nama_skpd}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {item.kode_skpd}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={item.nama_sub_giat_nama_sub_giat}>
                        {item.nama_sub_giat_nama_sub_giat || "-"}
                      </p>
                      {item.kode_sub_giat && (
                        <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                          {item.kode_sub_giat}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(item.nm_status)}`}>
                        {item.nm_status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="h-7 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:text-slate-300 dark:hover:text-blue-300 text-[11px] font-medium transition-colors"
                        title="Lihat Detail RKBMD Pengadaan"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer - server-side Laravel meta */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Halaman {meta?.current_page ?? page} dari {totalPages}
            {total > 0 && ` — menampilkan ${meta?.from ?? 0}–${meta?.to ?? 0} dari ${total} item`}
          </div>

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

      {/* Modal Tambah Manual */}
      <RkbmdManualForm
        type="pengadaan"
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSaved={() => reload()}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    Detail RKBMD Pengadaan
                  </h2>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ID #{selectedItem.id_pengadaan} • Periode {selectedItem.periode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/40 dark:bg-blue-950/30">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Nama Barang & Fikasi</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm mt-1">{selectedItem.nama_barang}</p>
                <p className="font-mono text-xs text-blue-600 dark:text-blue-400 mt-0.5">Kode: {selectedItem.kode_fikasi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah Kebutuhan</p>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedItem.jumlah_barang} {selectedItem.satuan}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah Maksimum</p>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1">{selectedItem.jumlah_maksimum} {selectedItem.satuan}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SKPD & Sub Kegiatan</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedItem.nama_skpd}</p>
                <p className="font-mono text-[10px] text-slate-400">Kode SKPD: {selectedItem.kode_skpd}</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-100 dark:border-slate-800">{selectedItem.nama_sub_giat_nama_sub_giat}</p>
                <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400">Kode Sub Giat: {selectedItem.kode_sub_giat}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cara Pemenuhan & Keterangan</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedItem.cara_pemenuhan}</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{selectedItem.keterangan || "-"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-3.5 overflow-x-auto">
                <p className="text-[10px] font-mono text-slate-400 mb-1">Raw Database Payload (dev.rkbmd_pengadaan)</p>
                <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap">
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

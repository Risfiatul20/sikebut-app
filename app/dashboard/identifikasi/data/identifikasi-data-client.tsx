"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthSubKegiatan } from "@/types/next-auth"
import { usePermission } from "@/hooks/usePermission"
import { useIdentifikasiList } from "@/hooks/useIdentifikasiList"
import { IdentifikasiKebutuhan } from "@/types/identifikasi"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"
import { DetailReviewModal } from "@/components/identifikasi/detail-review-modal"
import {
  FileText,
  Plus,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Tag,
  ArrowUpDown,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Inbox,
  ShieldCheck
} from "lucide-react"

export interface IdentifikasiDataClientSession {
  user?: {
    id?: string
    name?: string | null
    username?: string
    role?: string
    kodeSkpd?: string
    namaSkpd?: string
    subkegiatans?: AuthSubKegiatan[]
    subKegiatan?: AuthSubKegiatan[]
  }
}

export function IdentifikasiDataClient({ session }: { session: IdentifikasiDataClientSession }) {
    const { can } = usePermission()

  const userRole = (session?.user?.role || "").toLowerCase()
  const isUserPpk = userRole === "ppk"
  const isUserAdmin = userRole === "admin"
  const isUserVerifikator = userRole === "verifikator"
  const userSubKegiatans = session?.user?.subkegiatans || session?.user?.subKegiatan || []
  const ppkSubCodes = userSubKegiatans.map((s) => s.kode_sub_kegiatan)

  // Filter & pagination state
  const [search, setSearch] = useState("")
  // Default tab: Verifikator -> "Diajukan" (label: Menunggu Review), lainnya -> "ALL"
  const [statusReview, setStatusReview] = useState<string>(() => (isUserVerifikator ? "Diajukan" : "ALL"))
  const [caraPengadaan, setCaraPengadaan] = useState("ALL")
  const [jenisPengadaan, setJenisPengadaan] = useState("ALL")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [sortBy, setSortBy] = useState("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Modal terpadu Detail & Review (1 state untuk semua role)
  const [selectedItem, setSelectedItem] = useState<IdentifikasiKebutuhan | null>(null)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Panggil data dari API
  const { data, meta, isLoading, error, reload } = useIdentifikasiList({
    search,
    statusReview,
    caraPengadaan,
    jenisPengadaan,
    sortBy,
    sortDirection,
    page,
    perPage,
  })

  const total = meta?.total ?? data.length
  const totalPages = meta?.last_page ?? Math.max(1, Math.ceil(total / perPage))

  const fmt = (v: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v ?? 0))

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const handleResetFilters = () => {
    setSearch("")
    setStatusReview(isUserVerifikator ? "Diajukan" : "ALL")
    setCaraPengadaan("ALL")
    setJenisPengadaan("ALL")
    setPage(1)
  }

  const hasActiveFilters = Boolean(
    search || (isUserVerifikator ? statusReview !== "Diajukan" : statusReview !== "ALL") || caraPengadaan !== "ALL" || jenisPengadaan !== "ALL"
  )

  // Aksi Ajukan Review (PPK & Admin)
  const handleAjukanReview = async (item: IdentifikasiKebutuhan) => {
    if (!confirm(`Apakah Anda yakin ingin mengajukan paket "${item.nama_paket}" ke Verifikator?`)) {
      return
    }

    setIsActionLoading(item.id)
    try {
      const res = await fetch(`/api/identifikasi/${item.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
        }),
      })

      const json = await res.json()
      if (res.ok) {
        showToast(`Paket "${item.nama_paket}" berhasil diajukan ke Verifikator`)
        reload()
      } else {
        showToast(json.error || json.message || "Gagal mengajukan paket", "error")
      }
    } catch {
      showToast("Gagal mengajukan paket, terjadi kesalahan jaringan", "error")
    } finally {
      setIsActionLoading(null)
    }
  }

  // Aksi Hapus Paket (PPK untuk status Draft, Admin untuk semua status)
  const handleDeletePaket = async (item: IdentifikasiKebutuhan) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${item.nama_paket}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    setIsActionLoading(item.id)
    try {
      const res = await fetch(`/api/identifikasi?id=${item.id}`, {
        method: "DELETE",
      })

      const json = await res.json()
      if (res.ok) {
        showToast(`Paket "${item.nama_paket}" berhasil dihapus`)
        reload()
      } else {
        showToast(json.error || json.message || "Gagal menghapus paket", "error")
      }
    } catch {
      showToast("Gagal menghapus paket, terjadi kesalahan jaringan", "error")
    } finally {
      setIsActionLoading(null)
    }
  }

  // Verifikator hanya boleh melihat paket yang SUDAH DIAJUKAN (menunggu review).
  // Paket Draft (belum final) milik PPK tidak ditampilkan & tidak bisa diakses.
  const STATUS_TABS = isUserVerifikator
    ? [{ key: "Diajukan", label: "Menunggu Review", icon: AlertCircle }]
    : [
        { key: "ALL", label: "Semua Status" },
        { key: "Draft", label: "Draft", icon: Clock },
        { key: "Diajukan", label: "Menunggu Review", icon: AlertCircle },
        { key: "Disetujui", label: "Disetujui", icon: CheckCircle2 },
        { key: "Perlu Perbaikan", label: "Perlu Perbaikan", icon: XCircle },
      ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-[120] flex items-center gap-2.5 text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-200 ${
            toastMsg.type === "success"
              ? "bg-slate-900 dark:bg-slate-800 text-white border-emerald-500"
              : "bg-red-950 text-white border-red-500"
          }`}
        >
          {toastMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Daftar Identifikasi Kebutuhan
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola, ajukan, verifikasi, dan pantau status usulan paket pengadaan PBJ terintegrasi SIPD-RI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isUserVerifikator && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-500/10 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Hanya paket Menunggu Review — Draft PPK tidak ditampilkan
            </span>
          )}
          <button
            type="button"
            onClick={() => reload()}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Muat ulang data dari server"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-500" : "text-slate-400"}`} />
            <span>Sinkronkan</span>
          </button>

          {can("paket:create") && (
            <Link
              href="/dashboard/identifikasi"
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Usulan Baru</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden">
        {/* Status Tab Navigation */}
        <div className="px-4 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 min-w-max pb-2.5">
            {STATUS_TABS.map((tab) => {
              const isActive = statusReview === tab.key
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setStatusReview(tab.key)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {TabIcon && <TabIcon className="h-3.5 w-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama paket, subkegiatan, PPK..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filter Cara Pengadaan */}
            <select
              value={caraPengadaan}
              onChange={(e) => {
                setCaraPengadaan(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="ALL">Semua Cara Pengadaan</option>
              <option value="Penyedia">Penyedia</option>
              <option value="Swakelola">Swakelola</option>
            </select>

            {/* Filter Jenis Pengadaan */}
            <select
              value={jenisPengadaan}
              onChange={(e) => {
                setJenisPengadaan(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="ALL">Semua Jenis Pengadaan</option>
              <option value="Barang">Barang</option>
              <option value="Konstruksi">Konstruksi</option>
              <option value="Jasa Lainnya">Jasa Lainnya</option>
              <option value="Konsultansi">Konsultansi</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 py-1 flex items-center gap-1"
                title="Bersihkan filter"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* Baris per Halaman */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-end md:self-auto">
            <span>Tampilkan:</span>
            <select
              value={String(perPage)}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 px-2.5 text-xs text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="10">10 / hal</option>
              <option value="15">15 / hal</option>
              <option value="25">25 / hal</option>
              <option value="50">50 / hal</option>
            </select>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              {isUserAdmin
                ? "Hak Akses Admin: Anda dapat melihat, memverifikasi, mengajukan, maupun menghapus paket usulan."
                : isUserVerifikator
                ? "Hak Akses Verifikator: Lakukan review dan berikan keputusan verifikasi pada paket usulan."
                : isUserPpk
                ? "Hak Akses PPK: Usulan difilter otomatis sesuai Sub Kegiatan Anda."
                : "Menampilkan daftar usulan identifikasi kebutuhan."}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
            {total} total paket usulan
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 select-none">
                {/* 1. Nama Paket */}
                <th
                  className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[220px]"
                  onClick={() => handleSort("nama_paket")}
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Paket</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>

                {/* 2. Pagu */}
                <th
                  className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 text-right min-w-[130px]"
                  onClick={() => handleSort("total_pagu")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Pagu</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>

                {/* 3. Jenis Pengadaan */}
                <th className="font-semibold px-4 py-3 min-w-[110px]">
                  Jenis Pengadaan
                </th>

                {/* 4. Metode Pengadaan */}
                <th className="font-semibold px-4 py-3 min-w-[120px]">
                  Metode Pengadaan
                </th>

                {/* 5. Status Review */}
                <th
                  className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 min-w-[120px]"
                  onClick={() => handleSort("status_review")}
                >
                  <div className="flex items-center gap-1">
                    <span>Status Review</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>

                {/* 6. PPK (Hanya jika user login BUKAN PPK) */}
                {!isUserPpk && (
                  <th className="font-semibold px-4 py-3 min-w-[160px]">
                    PPK / Pembuat
                  </th>
                )}

                {/* Aksi Kolom */}
                <th className="font-semibold px-4 py-3 text-right min-w-[180px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {isLoading ? (
                <tr>
                  <td colSpan={!isUserPpk ? 7 : 6} className="text-center text-xs text-slate-400 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Memuat daftar identifikasi kebutuhan...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={!isUserPpk ? 7 : 6} className="text-center text-xs text-red-500 py-10">
                    {error}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={!isUserPpk ? 7 : 6} className="text-center text-xs text-slate-400 py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                      <span>Tidak ada data identifikasi kebutuhan yang cocok dengan filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const fd = (item.form_data || {}) as Record<string, unknown>
                  const metodePengadaan = String(fd.metode_pengadaan || item.cara_pengadaan || "-")
                  const pembuatNama = item.pembuat?.nama || item.nama_user || "PPK"
                  const pembuatUsername = item.pembuat?.username || "—"
                  const isDraft = item.status_review === "Draft"
                  const isPerluPerbaikan = item.status_review === "Perlu Perbaikan"
                  // Cek izin aksi via permissions
                  const canReview = can("paket:review")
                  const canAjukan = can("paket:ajukan") && (isDraft || isPerluPerbaikan)
                  const canDelete = isUserAdmin || (can("paket:delete") && isDraft)
                  const canEdit = can("paket:edit") && (isDraft || isPerluPerbaikan) && (isUserAdmin || item.user_id === Number(session?.user?.id) || ppkSubCodes.includes(item.kode_sub_kegiatan))

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Nama Paket */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 max-w-xs sm:max-w-sm">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                            {item.nama_paket}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="font-mono text-amber-700 dark:text-amber-400 font-medium">
                              {item.kode_sub_kegiatan}
                            </span>
                            <span>&bull;</span>
                            <span className="truncate" title={item.nama_sub_kegiatan || ""}>
                              {item.nama_sub_kegiatan || "Sub Kegiatan"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Pagu */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <p className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {fmt(item.total_pagu || 0)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.anggaran?.length || item.jumlah_anggaran || 0} item RKA
                        </p>
                      </td>

                      {/* 3. Jenis Pengadaan */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.jenis_pengadaan ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30">
                            <Tag className="h-3 w-3" />
                            {item.jenis_pengadaan}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Swakelola
                          </span>
                        )}
                      </td>

                      {/* 4. Metode Pengadaan */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {metodePengadaan}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Cara: {item.cara_pengadaan}
                        </p>
                      </td>

                      {/* 5. Status Review */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(
                            item.status_review
                          )}`}
                        >
                          {statusLabel(item.status_review)}
                        </span>
                      </td>

                      {/* 6. PPK (Hanya jika user login bukan PPK) */}
                      {!isUserPpk && (
                        <td className="px-4 py-3">
                          <div className="max-w-[160px] truncate">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-[11px] truncate" title={pembuatNama}>
                              {pembuatNama}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 truncate">
                              @{pembuatUsername}
                            </p>
                          </div>
                        </td>
                      )}

                      {/* Aksi Kolom (Role-Based) */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Detail (Semua Role — Verifikator/Admin: detail + review terpadu) */}
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className={`h-7 px-2 inline-flex items-center gap-1 rounded transition-colors text-[11px] font-medium ${
                              canReview
                                ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800"
                                : "bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:text-slate-300 dark:hover:text-blue-300"
                            }`}
                            title={canReview ? "Detail & Review Paket (catatan + keputusan)" : "Lihat Detail Usulan & Anggaran"}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Detail</span>
                          </button>

                          
                          {/* Tombol Edit (PPK & Admin jika Draft/Ditolak) */}
                          {canEdit && (
                            <Link
                              href={`/dashboard/identifikasi?id=${item.id}`}
                              className="h-7 px-2 inline-flex items-center gap-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-[11px] font-medium transition-colors"
                              title="Edit Usulan Paket"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Link>
                          )}
                          {/* Tombol Ajukan Review (PPK & Admin jika Draft/Ditolak) */}
                          {canAjukan && (
                            <button
                              type="button"
                              onClick={() => handleAjukanReview(item)}
                              disabled={isActionLoading === item.id}
                              className="h-7 px-2.5 inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-[11px] font-semibold shadow-2xs transition-colors"
                              title="Ajukan usulan paket ini ke Verifikator"
                            >
                              {isActionLoading === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Send className="h-3.5 w-3.5" />
                              )}
                              <span>Ajukan</span>
                            </button>
                          )}

                          {/* Tombol Hapus (Admin untuk semua, PPK jika Draft) */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeletePaket(item)}
                              disabled={isActionLoading === item.id}
                              className="h-7 w-7 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              title="Hapus Usulan Paket"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Halaman {meta?.current_page ?? page} dari {totalPages}
            {total > 0 && ` — menampilkan ${meta?.from ?? ((page - 1) * perPage + 1)}–${meta?.to ?? Math.min(page * perPage, total)} dari ${total} paket`}
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

      {/* Modal Terpadu: Detail Paket + Catatan Verifikator + Keputusan Review */}
      <DetailReviewModal
        item={selectedItem}
        canReview={can("paket:review")}
        onClose={() => setSelectedItem(null)}
        onSuccess={() => {
          reload()
        }}
      />
    </div>
  )
}
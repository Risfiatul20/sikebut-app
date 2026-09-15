"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useYear } from "@/context/year-context"
import { SipdVersionInfo } from "@/types/sipd"
import { useSipdList } from "@/hooks/useSipdList"
import { SipdImportDropzone } from "@/components/sipd/sipd-import-dropzone"
import { SipdDataTable } from "@/components/sipd/sipd-data-table"
import {
  UploadCloud,
  Layers,
  DollarSign,
  FileCheck2,
  Calendar,
  Sparkles,
  Database,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Loader2,
} from "lucide-react"

export default function SipdImportPage() {
  const { data: session } = useSession()
  const { year } = useYear()
  const isAdmin = (session?.user?.role || "").toLowerCase() === "admin"

  // Daftar versi Penetapan APBD dari DATABASE (backend: GET /api/v1/sipd-versions)
  const [versions, setVersions] = useState<SipdVersionInfo[]>([])
  // Year override lokal jika user memilih tahun lain di tabel SIPD
  const [selectedYearOverride, setSelectedYearOverride] = useState<number | null>(null)
  const activeYear = selectedYearOverride ?? year
  const [activeVersion, setActiveVersion] = useState<number>(0) // 0 = semua versi
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [isImportPanelOpen, setIsImportPanelOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Muat daftar versi dari database saat halaman dibuka & setelah impor
  const loadVersions = async () => {
    try {
      const res = await fetch("/api/sipd/versions", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      setVersions(json.data ?? [])
    } catch {
      // biarkan kosong — halaman tetap bisa dipakai
    }
  }

  useEffect(() => {
    let active = true
    fetch("/api/sipd/versions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (active && json?.data) {
          setVersions(json.data)
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const { data: apiItems, meta, isLoading: isLoadingItems, reload: reloadItems } = useSipdList({
    tahun: activeYear,
    versi: activeVersion,
    page,
    per_page: pageSize,
  })

  // Semua item berasal dari DATABASE (backend), bukan memori lokal
  const items = apiItems

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const handleImportSuccess = async (_version: SipdVersionInfo, count: number) => {
    // Data sudah tersimpan di database oleh backend — muat ulang dari API
    await Promise.all([loadVersions(), reloadItems()])
    setSelectedYearOverride(null)
    setActiveVersion(0)
    setPage(1)
    setIsImportPanelOpen(false) // collapse form after success to show table immediately
    showToast(
      `Impor berhasil diproses dan tersimpan di database (${count > 0 ? count + " rincian" : "versi baru"}). Data dimuat ulang.`
    )
  }

  // Summary Calculations for active year
  const yearItems = items.filter((it) => it.tahun === activeYear)
  const currentVersionItems =
    activeVersion > 0
      ? items.filter((it) => it.tahun === activeYear && it.versi === activeVersion)
      : yearItems

  const totalPaguYear = currentVersionItems.reduce((acc, curr) => acc + curr.pagu, 0)
  const uniqueSubKegiatan = new Set(currentVersionItems.map((it) => it.kode_sub_kegiatan)).size
  const uniquePrograms = new Set(currentVersionItems.map((it) => it.kode_program)).size

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <FileCheck2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Database className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Impor & Data Penetapan APBD (SIPD-RI)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sinkronisasi rincian anggaran, rekening belanja, dan standar harga dari SIPD-RI.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsImportPanelOpen(!isImportPanelOpen)}
              className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold shadow-xs transition-colors ${
                isImportPanelOpen
                  ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  : "border-blue-600 bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>{isImportPanelOpen ? "Tutup Form Impor" : "Form Impor Berkas SIPD"}</span>
              {isImportPanelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-blue-500" /> Total Pagu APBD {activeYear}
          </p>
          <p className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">
            {formatRupiah(totalPaguYear)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {activeVersion > 0 ? `Versi ${activeVersion}` : "Semua versi"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-500" /> Sub Kegiatan Aktif
          </p>
          <p className="font-display text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1.5 font-mono">
            {uniqueSubKegiatan}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Dari {uniquePrograms} Program Kerja
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" /> Rincian Rekening RKA
          </p>
          <p className="font-display text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
            {currentVersionItems.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Item belanja siap identifikasi
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Total Versi APBD
          </p>
          <p className="font-display text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5 font-mono">
            {versions.filter((v) => v.tahun === activeYear).length} Versi
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Tersimpan pada skema versioning
          </p>
        </div>
      </div>

      {/* Import Section (Collapsible - Hanya Admin) */}
      {isAdmin && isImportPanelOpen && (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" /> Formulir Unggah Berkas & Versioning SIPD
            </p>
          </div>

          <SipdImportDropzone
            existingVersions={versions}
            onImportSuccess={handleImportSuccess}
          />
        </div>
      )}

      {/* Data Table Section (Displayed after import & for all versions) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => {
              reloadItems()
              loadVersions()
              showToast("Data disinkronkan ulang dari API SIPD-RI")
            }}
            className="h-7 px-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className={`h-3 w-3 ${isLoadingItems ? "animate-spin text-blue-500" : "text-slate-400"}`} />
            Sinkronkan
          </button>
        </div>

        {isLoadingItems && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>Memuat rincian Penetapan APBD dari API SIPD-RI...</span>
          </div>
        )}

        <SipdDataTable
          items={items}
          versions={versions}
          activeVersion={activeVersion}
          activeYear={activeYear}
          onChangeVersion={(v) => {
            setActiveVersion(v)
            setPage(1)
          }}
          onChangeYear={(y) => {
            setSelectedYearOverride(y)
            setActiveVersion(0) // reset to all versions on year switch
            setPage(1)
          }}
          page={page}
          pageSize={pageSize}
          totalItems={meta?.total ?? items.length}
          isLoading={isLoadingItems}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
        />
      </div>
    </div>
  )
}

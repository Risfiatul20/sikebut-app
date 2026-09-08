import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getApi } from "@/lib/api"
import { LaporanRekapResponse } from "@/types/laporan"
import { LaporanTreeTable } from "@/components/laporan/laporan-tree-table"
import { PieChart, Calendar, Database, Layers, FileSpreadsheet } from "lucide-react"

export const metadata = {
  title: "Laporan Rekapitulasi Identifikasi Kebutuhan — Sikebut PBJ",
  description: "Tabel laporan berjenjang (Hierarchical Tree Table) rekapitulasi identifikasi kebutuhan OPD s/d Sub Kegiatan.",
}

export default async function LaporanRekapPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Data diambil dari API backend (Laravel) — rekap berjenjang 5 level dari pagu RKA SIPD.
  let dataRekap: LaporanRekapResponse["data"]["tree"] = []
  let totalPagu = 0
  let totalPengadaan = 0
  let totalTeridentifikasi = 0
  let totalPaket = 0
  const tahunAnggaran = 2026
  let errorMessage: string | null = null

  try {
    const res = await getApi<LaporanRekapResponse>("/api/v1/laporan/rekap?tahun=" + tahunAnggaran)
    dataRekap = res?.data?.tree ?? []
    const s = res?.data?.summary
    if (s) {
      totalPagu = s.total_pagu || 0
      totalPengadaan = s.total_pengadaan || 0
      totalTeridentifikasi = s.total_pagu_paket || 0
      totalPaket = s.total_paket || 0
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Gagal memuat laporan rekapitulasi"
    console.error("[laporan/rekap] Gagal memuat data dari backend:", err)
  }

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val || 0)
  }

  // Format ringkas untuk angka besar (Triliun/Miliar/Juta) agar kartu tetap rapi,
  // nilai lengkap tetap tersedia via tooltip (title).
  const formatRupiahRingkas = (val: number): string => {
    const v = val || 0
    const abs = Math.abs(v)
    const fmt = (n: number) =>
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n)
    if (abs >= 1e12) return `Rp ${fmt(v / 1e12)} T`
    if (abs >= 1e9) return `Rp ${fmt(v / 1e9)} M`
    if (abs >= 1e6) return `Rp ${fmt(v / 1e6)} Jt`
    return formatRupiah(v)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {errorMessage && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data dari server:</strong> {errorMessage}. Menampilkan data kosong.
        </div>
      )}
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <PieChart className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Rekapitulasi Identifikasi Kebutuhan
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Laporan berjenjang perbandingan pagu RKA SIPD-RI dengan hasil entri identifikasi kebutuhan paket (Penyedia &amp; Swakelola).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tombol Ekspor Excel */}
          <a
            href={`/api/laporan/rekap/export?tahun=${tahunAnggaran}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold border border-blue-600 shadow-sm transition-colors"
            title="Unduh rekapitulasi dalam format Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Ekspor Excel
          </a>

          {/* Badge Tahun Anggaran */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span>T.A. {tahunAnggaran}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SIPD-RI Sinkron
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-slate-500" /> Total Pagu APBD
          </p>
          <p
            title={formatRupiah(totalPagu)}
            className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {formatRupiahRingkas(totalPagu)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Seluruh perangkat daerah</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-500" /> Belanja Pengadaan
          </p>
          <p
            title={formatRupiah(totalPengadaan)}
            className="font-display text-xl font-bold text-blue-600 dark:text-blue-400 mt-1.5 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {formatRupiahRingkas(totalPengadaan)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Pagu pengadaan tervalidasi</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Pagu Teridentifikasi
          </p>
          <p
            title={formatRupiah(totalTeridentifikasi)}
            className="font-display text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {formatRupiahRingkas(totalTeridentifikasi)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            {totalPengadaan > 0 ? ((totalTeridentifikasi / totalPengadaan) * 100).toFixed(1) : 0}% dari pagu pengadaan
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <PieChart className="h-3.5 w-3.5 text-indigo-500" /> Total Paket Terdaftar
          </p>
          <p className="font-display text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 font-mono">
            {totalPaket} Paket
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Penyedia &amp; Swakelola</p>
        </div>
      </div>

      {/* Main Hierarchical Tree Table Component */}
      <LaporanTreeTable data={dataRekap} tahun={tahunAnggaran} />
    </div>
  )
}

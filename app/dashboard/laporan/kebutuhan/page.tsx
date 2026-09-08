"use client"

import { useState, useEffect } from "react"
import { PieChart, BarChart3, TrendingUp, Download, FileText, Layers } from "lucide-react"
import { LaporanKebutuhanResponse } from "@/types/laporan"

type ViewMode = "ringkasan" | "per-program" | "per-sumber-dana"

export default function LaporanKebutuhanPage() {
  const [selectedYear, setSelectedYear] = useState(2026)
  const [viewMode, setViewMode] = useState<ViewMode>("ringkasan")

  // Data agregat diambil dari backend (Laravel) melalui route proxy Next.js.
  const [laporan, setLaporan] = useState<LaporanKebutuhanResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/laporan/kebutuhan?tahun=${selectedYear}`)
        if (!res.ok) throw new Error(`Gagal memuat data laporan (HTTP ${res.status})`)
        const json: LaporanKebutuhanResponse = await res.json()
        if (!cancelled) setLaporan(json.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [selectedYear])

  const summary = laporan?.summary
  const yearVersions = (laporan?.versi_list ?? []).map((v) => v.versi)
  const latestVersion =
    yearVersions.length > 0
      ? { nama_versi: `Versi ${yearVersions.join(" & ")}` }
      : undefined

  const totalPagu = summary?.total_pagu ?? 0
  const totalRincian = summary?.total_rincian ?? 0
  const uniqueSKPD = summary?.total_skpd ?? 0
  const uniquePrograms = summary?.total_program ?? 0
  const byProgram = laporan?.program ?? []
  const bySumberDana = laporan?.sumber_dana ?? []
  const bySKPD = laporan?.skpd ?? []

  const fmt = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v)
  const pct = (val: number, total: number) => total > 0 ? ((val / total) * 100).toFixed(1) : "0"

  const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-indigo-500", "bg-purple-500", "bg-rose-500", "bg-cyan-500"]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <PieChart className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Laporan Kebutuhan Pengadaan</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Analisis dan ringkasan pagu anggaran per program, sumber dana, dan perangkat daerah.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/laporan/kebutuhan/export?tahun=${selectedYear}`}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold border border-blue-600 shadow-sm transition-colors"
            title="Unduh laporan kebutuhan dalam format Excel (3 sheet)"
          >
            <Download className="h-3.5 w-3.5" /> Export Excel
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500/40">
          <option value={2026}>Tahun 2026</option>
          <option value={2025}>Tahun 2025</option>
        </select>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(["ringkasan", "per-program", "per-sumber-dana"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${viewMode === mode ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"}`}>
              {mode === "ringkasan" ? "Ringkasan" : mode === "per-program" ? "Per Program" : "Per Sumber Dana"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { icon: <Layers className="h-3.5 w-3.5 text-blue-500" />, label: "Total Pagu", value: fmt(totalPagu), sub: `${latestVersion?.nama_versi || "Semua versi"}` },
          { icon: <FileText className="h-3.5 w-3.5 text-emerald-500" />, label: "Rincian RKA", value: totalRincian, sub: `${uniquePrograms} Program aktif` },
          { icon: <BarChart3 className="h-3.5 w-3.5 text-amber-500" />, label: "OPD Terlibat", value: uniqueSKPD, sub: `${yearVersions.length} versi APBD` },
          { icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />, label: "Sumber Dana", value: bySumberDana.length, sub: "Sumber pendanaan aktif" },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">{card.icon} {card.label}</p>
            <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1.5 font-mono">{card.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Ringkasan View */}
      {viewMode === "ringkasan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Per SKPD */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pagu per Perangkat Daerah</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bySKPD.map((item, idx) => (
                <div key={item.kode} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${COLORS[idx % COLORS.length]}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{item.nama}</p>
                      <p className="text-[10px] font-mono text-slate-400">{item.kode}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">{fmt(item.total)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`} style={{ width: `${pct(item.total, totalPagu)}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{pct(item.total, totalPagu)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Per Sumber Dana */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pagu per Sumber Dana</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bySumberDana.map((item, idx) => (
                <div key={item.nama} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${COLORS[idx % COLORS.length]}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{item.nama}</p>
                      <p className="text-[10px] text-slate-400">{item.count} rincian</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">{fmt(item.total)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-1 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`} style={{ width: `${pct(item.total, totalPagu)}%` }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{pct(item.total, totalPagu)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Per Program View */}
      {viewMode === "per-program" && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Rincian Pagu per Program</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="font-semibold px-4 py-2.5 text-left">Program</th>
                  <th className="font-semibold px-4 py-2.5 text-center">Rincian</th>
                  <th className="font-semibold px-4 py-2.5 text-right">Total Pagu</th>
                  <th className="font-semibold px-4 py-2.5 text-right">% Pagu</th>
                  <th className="font-semibold px-4 py-2.5">Proporsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {byProgram.map((prog) => (
                  <tr key={prog.kode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{prog.nama}</p>
                      <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{prog.kode}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">{prog.count}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{fmt(prog.total)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{pct(prog.total, totalPagu)}%</td>
                    <td className="px-4 py-2.5">
                      <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct(prog.total, totalPagu)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-2.5 text-[11px]">Total</td>
                  <td className="px-4 py-2.5 text-center text-[11px]">{totalRincian}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-blue-700 dark:text-blue-300">{fmt(totalPagu)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[11px]">100%</td>
                  <td className="px-4 py-2.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* Per Sumber Dana View */}
      {viewMode === "per-sumber-dana" && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Rincian Pagu per Sumber Dana</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="font-semibold px-4 py-2.5 text-left">Sumber Dana</th>
                  <th className="font-semibold px-4 py-2.5 text-center">Rincian</th>
                  <th className="font-semibold px-4 py-2.5 text-right">Total Pagu</th>
                  <th className="font-semibold px-4 py-2.5 text-right">% Pagu</th>
                  <th className="font-semibold px-4 py-2.5">Proporsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bySumberDana.map((sd) => (
                  <tr key={sd.nama} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{sd.nama}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-slate-600 dark:text-slate-400">{sd.count}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{fmt(sd.total)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{pct(sd.total, totalPagu)}%</td>
                    <td className="px-4 py-2.5">
                      <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct(sd.total, totalPagu)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-bold border-t border-slate-200 dark:border-slate-700">
                  <td className="px-4 py-2.5 text-[11px]">Total</td>
                  <td className="px-4 py-2.5 text-center text-[11px]">{totalRincian}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-blue-700 dark:text-blue-300">{fmt(totalPagu)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[11px]">100%</td>
                  <td className="px-4 py-2.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

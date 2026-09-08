"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Inbox, Wallet, Building2, Layers, FileText } from "lucide-react"
import { LaporanPaketResponse } from "@/types/laporan-paket"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"

const fmtRp = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0))

const fmtWaktu = (iso: string | null) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return iso
  }
}

interface Props {
  jenis: "penyedia" | "swakelola"
  title: string
  description: string
}

export function LaporanPaketView({ jenis, title, description }: Props) {
  const [data, setData] = useState<LaporanPaketResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/laporan/${jenis}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json?.data ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }, [jenis])

  useEffect(() => {
    load()
  }, [load])

  const stats = [
    { label: "Total Paket", value: data ? String(data.summary.total_paket) : "—", icon: Inbox, color: "blue" },
    { label: "Total Pagu", value: data ? fmtRp(data.summary.total_pagu) : "—", icon: Wallet, color: "indigo" },
    { label: "Jumlah SKPD", value: data ? String(data.summary.total_skpd) : "—", icon: Building2, color: "emerald" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-xl font-mono font-semibold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`h-9 w-9 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Breakdown: per status + per jenis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <FileText className="h-3.5 w-3.5 text-blue-600" /> Paket per Status
          </p>
          <div className="space-y-2">
            {["Draft", "Diajukan", "Disetujui", "Perlu Perbaikan"].map((s) => (
              <div key={s} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(s)}`}>
                  {statusLabel(s)}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {data?.per_status?.find((p) => p.status_review === s)?.jumlah_paket ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <Layers className="h-3.5 w-3.5 text-indigo-600" /> Paket per Jenis Pengadaan
          </p>
          <div className="space-y-2">
            {(data?.per_jenis ?? []).length > 0 ? (
              data!.per_jenis.map((j) => (
                <div key={j.jenis_pengadaan ?? "-"} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{j.jenis_pengadaan || "—"}</p>
                    <p className="text-[10px] text-slate-400">{fmtRp(j.total_pagu)}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{j.jumlah_paket}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Paket */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">Daftar Paket ({data?.paket.length ?? 0})</p>
        </div>
        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !data || data.paket.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">Belum ada paket {jenis === "penyedia" ? "Penyedia" : "Swakelola"}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-[10px] uppercase text-slate-400 text-left">
                  <th className="font-semibold px-4 py-2.5">Paket</th>
                  <th className="font-semibold px-4 py-2.5">SKPD</th>
                  <th className="font-semibold px-4 py-2.5">Jenis</th>
                  <th className="font-semibold px-4 py-2.5">Status</th>
                  <th className="font-semibold px-4 py-2.5 text-right">Pagu</th>
                  <th className="font-semibold px-4 py-2.5">Pembuat</th>
                  <th className="font-semibold px-4 py-2.5">Diperbarui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.paket.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{p.nama_paket}</p>
                      <p className="font-mono text-[10px] text-slate-400">#{p.id}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{p.nama_skpd || p.kode_skpd}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.jenis_pengadaan || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(p.status_review)}`}>
                        {statusLabel(p.status_review)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-900 dark:text-white">{fmtRp(p.total_pagu)}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{p.nama_user || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{fmtWaktu(p.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
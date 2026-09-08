import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getApi } from "@/lib/api"
import { DashboardSummary } from "@/types/dashboard"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Layers, ClipboardList, Clock, Wallet, CheckCircle2, Inbox, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Dashboard — Sikebut PBJ",
  description: "Ikhtisar kebutuhan pengadaan provinsi Sumatera Barat.",
}

const fmtRp = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v || 0)

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  let summary: DashboardSummary | null = null
  let errorMessage: string | null = null

  try {
    const res = await getApi<{ data: DashboardSummary }>("/api/v1/dashboard/summary")
    summary = res?.data ?? null
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Gagal memuat ringkasan dashboard"
    console.error("[dashboard] Gagal memuat data:", err)
  }

  const perStatus = summary?.paket_per_status ?? {}
  const perJenis = summary?.paket_per_jenis ?? {}
  const disetujui = perStatus["Disetujui"] ?? 0
  const draft = perStatus["Draft"] ?? 0

  const stats = [
    {
      label: "Total Usulan",
      value: summary ? String(summary.total_paket) : "—",
      sub: `${draft} draft · ${disetujui} disetujui`,
      color: "blue",
      icon: Inbox,
    },
    {
      label: "Perlu Review",
      value: summary ? String(summary.perlu_review) : "—",
      sub: "Menunggu persetujuan verifikator",
      color: "amber",
      icon: Clock,
    },
    {
      label: "Total Pagu Paket",
      value: summary ? fmtRp(summary.total_pagu_paket) : "—",
      sub: "Rencana anggaran seluruh paket",
      color: "indigo",
      icon: Wallet,
    },
    {
      label: "Paket Disetujui",
      value: summary ? String(disetujui) : "—",
      sub: "Status final (Disetujui)",
      color: "emerald",
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">Ikhtisar Kebutuhan</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ringkasan usulan pengadaan dari data asli ({new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/laporan/rekap" passHref>
            <Button variant="outline" size="sm" className="h-8 text-[11px]">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Lihat Laporan
            </Button>
          </Link>
          <Link href="/dashboard/identifikasi" passHref>
            <Button size="sm" className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 text-white">
              <Layers className="h-3.5 w-3.5 mr-1.5" /> Buat Usulan Baru
            </Button>
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data dari server:</strong> {errorMessage}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-${stat.color}-500`}></span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.sub}</p>
                  </div>
                </div>
                <div className={`h-9 w-9 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Breakdown cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Per Status */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" /> Paket per Status
            </CardTitle>
            <CardDescription className="text-[11px]">Sebaran status review seluruh paket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Draft", "Diajukan", "Disetujui", "Perlu Perbaikan"].map((s) => (
              <div
                key={s}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              >
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(s)}`}>
                  {statusLabel(s)}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{perStatus[s] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Per Jenis Pengadaan */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" /> Paket per Jenis Pengadaan
            </CardTitle>
            <CardDescription className="text-[11px]">Barang / Konstruksi / Jasa / Konsultansi / Swakelola</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {["Barang", "Konstruksi", "Jasa Lainnya", "Konsultansi", "Swakelola"].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{j}</span>
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{perJenis[j] ?? 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Paket Terbaru */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" /> Usulan Terbaru
            </CardTitle>
            <CardDescription className="text-[11px]">5 paket yang terakhir diperbarui</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary && summary.paket_terbaru.length > 0 ? (
              summary.paket_terbaru.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.nama_paket}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border whitespace-nowrap ${statusBadgeClass(p.status_review)}`}>
                      {statusLabel(p.status_review)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    #{p.id} · {p.jenis_pengadaan || p.cara_pengadaan} · {p.nama_user || "—"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
                Belum ada paket teridentifikasi.
              </div>
            )}
            <Link href="/dashboard/identifikasi/data" className="block pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Lihat semua usulan <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
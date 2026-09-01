import { UserTable } from "@/components/user-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, Filter } from "lucide-react"

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">Ikhtisar Kebutuhan</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ringkasan data usulan dan pengguna aktif.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[11px]">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Ekspor
          </Button>
          <Button size="sm" className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Sinkron SIPD
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Usulan", value: "1,248", sub: "+12% dari bulan lalu", color: "blue" },
          { label: "Sinkron SIPD", value: "856", sub: "Tervalidasi", color: "emerald" },
          { label: "Perlu Review", value: "34", sub: "Menunggu persetujuan", color: "amber" },
          { label: "Total Anggaran", value: "Rp 12.4M", sub: "Estimasi pagu", color: "indigo" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="mt-2 text-2xl font-mono font-semibold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-block h-1.5 w-1.5 rounded-full bg-${stat.color}-500`}></span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs !pt-0">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Daftar Pengguna Sistem</CardTitle>
              <CardDescription className="text-[11px] mt-1">Data dikelola secara terpusat (Saat ini menggunakan <b>Data Dummy</b> karena API belum siap).</CardDescription>
            </div>
            <CardAction>
              <Button variant="outline" size="xs" className="h-7 text-[10px]">
                <Filter className="h-3 w-3 mr-1" /> Filter
              </Button>
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4">
            <UserTable />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

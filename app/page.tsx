import Link from "next/link"
import { cn } from "@/lib/utils"
import { auth } from "@/auth"
import { buttonVariants } from "@/components/ui/button"
import { Landmark, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-full flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-10 h-20 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-lg tracking-tight text-slate-900 dark:text-white">Sikebut PBJ</p>
            <p className="text-[10px] text-slate-500">Pemerintah Daerah</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Masuk
          </Link>
          <Link href={session ? "/dashboard" : "/login"} className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 shadow-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100")}>
            {session ? "Buka Dashboard" : "Mulai"} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-500/20 blur-3xl rounded-full pointer-events-none -z-10"></div>
        <div className="absolute inset-0 opacity-40 dark:opacity-20 bg-[radial-gradient(rgba(148,163,184,0.3)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Sistem Terintegrasi SIPD-RI
        </div>

        <h1 className="max-w-3xl font-display text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">
          Identifikasi Kebutuhan Daerah Lebih <span className="text-blue-600 dark:text-blue-400">Cepat & Akurat.</span>
        </h1>
        
        <p className="mt-6 max-w-xl text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both">
          Platform administrasi multi-langkah untuk menyusun, memverifikasi, dan mensinkronkan usulan pengadaan langsung ke RKA SIPD-RI.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
          <Link href={session ? "/dashboard" : "/login"} className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-sm")}>
            {session ? "Masuk ke Dashboard" : "Masuk sebagai OPD"}
          </Link>
          <Link href="https://sipd.go.id" target="_blank" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800")}>
            Pelajari SIPD-RI
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl text-left animate-in fade-in duration-1000 delay-500 fill-mode-both">
          {[
            { title: "Formulir Dinamis", desc: "Input terspesialisasi untuk Barang, Konstruksi, dan Jasa." },
            { title: "Katalog Terpadu", desc: "Akses standar harga dan kode rekening langsung." },
            { title: "Sinkronisasi Real-time", desc: "Data usulan otomatis terhubung ke sistem pusat." },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{feature.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

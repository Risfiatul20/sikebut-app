import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Landmark, ShieldCheck } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="relative min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* dekorasi latar halus */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-40 dark:opacity-15 [background-image:radial-gradient(rgba(100,116,139,0.18)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      {/* bar atas */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 h-16 shrink-0">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          ← Beranda
        </a>
        <ThemeToggle />
      </div>

      {/* area konten */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-[25rem] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* merek */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <p className="mt-4 font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">SIKEBUT</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Identifikasi Kebutuhan Barang & Jasa · Provinsi Sumatera Barat
            </p>
          </div>

          {/* kartu form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/[0.05] p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Masuk ke akun
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gunakan akun operator yang diberikan admin daerah.
              </p>
            </div>

            <LoginForm />

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">atau</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/15 text-sm font-bold py-2.5 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" /> Masuk dengan SIPD-RI
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
            Belum punya akun?{" "}
            <a href="#" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Hubungi admin daerah
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { Landmark, Check, ShieldCheck } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-full">
      {/* ============ LEFT BRAND PANEL ============ */}
      <aside className="hidden lg:flex lg:w-[42%] xl:w-[44%] relative bg-slate-900 text-white overflow-hidden flex-col">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:22px_22px]"></div>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-semibold text-base tracking-tight">Sikebut PBJ</p>
              <p className="text-[10px] text-slate-400">Identifikasi Kebutuhan & SIPD-RI</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-14 xl:mt-20 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SIPD-RI Terhubung
            </span>
            <h1 className="mt-5 font-display text-3xl xl:text-4xl font-semibold leading-tight tracking-tight">
              Satu pintu untuk identifikasi kebutuhan pemerintah daerah.
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Susun, verifikasi, dan sinkronkan usulan pengadaan barang, konstruksi, jasa, dan swakelola ke dalam RKA melalui SIPD-RI.
            </p>
          </div>

          {/* Wizard steps preview */}
          <div className="mt-auto pt-10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Alur Identifikasi (4 Langkah)</p>
            <ol className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-slate-200">Identitas & OPD</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-slate-200">Klasifikasi Kebutuhan</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold ring-4 ring-blue-500/20">3</span>
                <span className="text-sm text-white font-medium">Spesifikasi & Pagu</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-[10px] font-semibold">4</span>
                <span className="text-sm text-slate-400">Review & Sinkronisasi</span>
              </li>
            </ol>
          </div>

          <p className="mt-10 text-[8px] text-slate-600">© 2026 Pemerintah Daerah — Modul PBJ Terintegrasi</p>
        </div>
      </aside>

      {/* ============ RIGHT LOGIN FORM ============ */}
      <main className="flex-1 flex flex-col">
        {/* top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 h-16 shrink-0">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold text-sm">Sikebut PBJ</span>
          </div>
          <div className="flex-1"></div>
          <ThemeToggle />
        </div>

        {/* form card */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Masuk ke akun</h2>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Gunakan akun operator OPD untuk melanjutkan.</p>
            </div>

            <LoginForm />

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-[8px] font-medium uppercase tracking-wider text-slate-400">atau</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {/* SIPD-RI SSO */}
            <button type="button" className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-sm font-semibold py-2.5 transition-colors">
              <ShieldCheck className="h-4 w-4" /> Masuk dengan SIPD-RI
            </button>

            <p className="mt-6 text-center text-[10px] text-slate-400">
              Belum punya akses? <a href="#" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Hubungi admin daerah</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

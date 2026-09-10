import Link from "next/link"
import { cn } from "@/lib/utils"
import { auth } from "@/auth"
import { buttonVariants } from "@/components/ui/button"
import {
  Landmark,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Database,
  Boxes,
  Layers,
  BellRing,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  MapPin,
  Search,
} from "lucide-react"

const FITUR = [
  {
    icon: ClipboardList,
    title: "Formulir Dinamis 5 Jenis",
    desc: "Formulir terspesialisasi untuk Barang, Konstruksi, Jasa Lainnya, Konsultansi, dan Swakelola — setiap jenis punya isian yang sesuai kebutuhan.",
  },
  {
    icon: Database,
    title: "Terpadu dengan SIPD-RI",
    desc: "Program, kegiatan, sub kegiatan, dan pagu APBD diambil langsung dari data SIPD-RI sehingga selalu konsisten dengan perencanaan daerah.",
  },
  {
    icon: Boxes,
    title: "Identifikasi RKBMD",
    desc: "Cek ketersediaan aset (pengadaan & pemeliharaan) sebelum mengusulkan, untuk mencegah pembelian ganda yang tidak perlu.",
  },
  {
    icon: Layers,
    title: "Pagu & Standar Harga",
    desc: "Pilih standar harga dan isi pagu paket dengan jaminan tidak melebihi sisa anggaran pada sub kegiatan terkait.",
  },
  {
    icon: BellRing,
    title: "Review & Notifikasi",
    desc: "Alur verifikasi berjenjang PPK → Verifikator dengan catatan per-field dan notifikasi real-time di setiap perubahan status.",
  },
  {
    icon: FileSpreadsheet,
    title: "Laporan & Ekspor Excel",
    desc: "Rekap kebutuhan, laporan penyedia & swakelola, hingga berita acara — siap ekspor ke Excel untuk arsip dan pembahasan.",
  },
]

const LANGKAH = [
  { n: "1", title: "Identitas & OPD", desc: "Pilih OPD, program, kegiatan, dan sub kegiatan dari SIPD." },
  { n: "2", title: "Klasifikasi Kebutuhan", desc: "Lengkapi form sesuai jenis & cara pengadaan yang dipilih." },
  { n: "3", title: "Pagu & Standar Harga", desc: "Tentukan pagu paket berdasarkan standar harga dan sisa anggaran." },
  { n: "4", title: "Review & Ajukan", desc: "Periksa ulang lalu ajukan untuk diverifikasi oleh verifikator." },
]

export default async function Home() {
  const session = await auth()
  const dashboardHref = session ? "/dashboard" : "/login"
  const dashboardLabel = session ? "Buka Dashboard" : "Masuk ke Aplikasi"

  return (
    <div className="min-h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Landmark className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold tracking-tight">SIKEBUT</p>
              <p className="text-[9px] text-slate-500 -mt-0.5">Sistem Identifikasi Kebutuhan Barang & Jasa</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            <a href="#fitur" className="hover:text-slate-900 dark:hover:text-white transition-colors">Fitur</a>
            <a href="#alur" className="hover:text-slate-900 dark:hover:text-white transition-colors">Alur Kerja</a>
            <a href="#tentang" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tentang</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={dashboardHref}
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 text-[13px]"
              )}
            >
              {dashboardLabel} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* dekorasi latar */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl" />
          <div className="absolute top-40 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-20 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [background-image:radial-gradient(rgba(100,116,139,0.22)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-8 lg:pt-14 pb-10 lg:pb-16 grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Kolom teks */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-3 w-3" />
              Identifikasi Kebutuhan Pengadaan · Provinsi Sumatera Barat
            </span>

            <h1 className="mt-6 font-display text-4xl sm:text-5xl xl:text-[3.4rem] font-extrabold tracking-tight leading-[1.12]">
              Usulan pengadaan yang{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                cepat, akurat,
              </span>{" "}
              dan siap RKA.
            </h1>

            <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-[15px] lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              SIKEBUT menyusun, memverifikasi, dan menyinkronkan usulan pengadaan barang, konstruksi, dan jasa
              langsung dari data SIPD-RI — dari identifikasi kebutuhan hingga pagu yang terjamin tidak melampaui
              anggaran.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                href={dashboardHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-7 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/25 text-sm w-full sm:w-auto"
                )}
              >
                {dashboardLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="#alur"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full px-7 text-sm bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 w-full sm:w-auto"
                )}
              >
                Lihat Alur Kerja
              </a>
            </div>

            {/* poin kepercayaan */}
            <div className="mt-9 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0">
              {[
                { icon: CheckCircle2, label: "5 Jenis Pengadaan" },
                { icon: Database, label: "Data APBD SIPD" },
                { icon: ShieldCheck, label: "Review Berjenjang" },
              ].map((it, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start gap-1.5">
                  <it.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center lg:text-left leading-tight">
                    {it.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom visual — mockup panel */}
          <div className="relative hidden sm:block">
            <div className="absolute -inset-6 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-transparent rounded-[2rem] blur-xl" />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
              {/* bar jendela */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
                  <Search className="h-2.5 w-2.5" /> sikebut.sumbarprov.go.id/dashboard
                </div>
              </div>

              {/* isi mockup */}
              <div className="p-5 space-y-4">
                {/* kartu stat */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Paket Diajukan", val: "—", color: "text-blue-600 dark:text-blue-400" },
                    { label: "Menunggu Review", val: "—", color: "text-amber-600 dark:text-amber-400" },
                    { label: "Disetujui", val: "—", color: "text-emerald-600 dark:text-emerald-400" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${s.color.replace("text-", "bg-").split(" ")[0]}`} />
                        <span className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</span>
                      </div>
                      <div className={`font-display text-xl font-bold ${s.color}`}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* baris paket */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { nama: "Pengadaan Laptop & PC Pengelolaan SPSE", ket: "Barang · Penyedia", status: "Disetujui", ok: true },
                    { nama: "Jasa Konsultansi Pengawasan Gedung", ket: "Konsultansi · Penyedia", status: "Menunggu Review", ok: false },
                    { nama: "Pengadaan Server Aplikasi", ket: "Barang · Swakelola", status: "Diajukan", ok: false },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-3">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Boxes className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">{row.nama}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{row.ket}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full",
                          row.ok
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                        )}
                      >
                        <span className="h-1 w-1 rounded-full bg-current" /> {row.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ringkasan hierarki */}
                <div className="rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/5 p-3.5">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 mb-2">
                    Ringkasan RKA — Biro Pengadaan Barang & Jasa
                  </p>
                  <div className="space-y-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                    {[
                      "Program 4.01.07 · Pengelolaan Layanan PBJ",
                      "↳ Kegiatan · Pelaksanaan Pengadaan",
                      "↳ Sub Kegiatan · Pengadaan Perangkat Pengolah Data",
                    ].map((t, i) => (
                      <p key={i} className={cn("flex items-center gap-1.5", i > 0 && "pl-3 text-slate-500 dark:text-slate-400")}>
                        <MapPin className="h-2.5 w-2.5 text-indigo-400 shrink-0" /> {t}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* chip melayang */}
            <div className="absolute -left-5 top-24 hidden xl:flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">SIPD-RI Terhubung</span>
            </div>
            <div className="absolute -right-3 bottom-28 hidden xl:flex items-center gap-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg px-3.5 py-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Pagu Terjaga</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ALUR ===== */}
      <section id="alur" className="border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/40 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Alur Kerja</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Empat langkah dari usulan menuju verifikasi
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Setiap langkah memakai data SIPD-RI sehingga usulan konsisten dengan pagu dan hierarki perencanaan daerah.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LANGKAH.map((l, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
              >
                {i < LANGKAH.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-[13px] z-10 h-6 w-6 rotate-45 border-t border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
                )}
                <div className="flex items-center justify-between">
                  <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-display font-bold text-sm flex items-center justify-center shadow-md shadow-blue-600/20">
                    {l.n}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 lg:hidden" />
                </div>
                <h3 className="mt-4 font-display text-sm font-bold text-slate-900 dark:text-white">{l.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section id="fitur" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Fitur Unggulan</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Semua yang dibutuhkan untuk identifikasi kebutuhan
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Dirancang mengikuti alur Biro Pengadaan Barang dan Jasa — dari form dinamis hingga laporan siap ekspor.
            </p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FITUR.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-600 dark:group-hover:bg-blue-600 transition-colors">
                  <f.icon className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="mt-4 font-display text-[15px] font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA / TENTANG ===== */}
      <section id="tentang" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 pb-12 lg:pb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white px-6 py-12 lg:px-14 lg:py-14 text-center">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-2xl sm:text-3xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
                Siap menyusun usulan pengadaan daerah secara tertib?
              </h2>
              <p className="mt-3 text-sm text-blue-100/90 max-w-xl mx-auto">
                SIKEBUT dikembangkan untuk Biro Pengadaan Barang dan Jasa Provinsi Sumatera Barat sebagai bagian
                dari ekosistem perencanaan SIPD-RI.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={dashboardHref}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full px-7 bg-white text-blue-700 hover:bg-blue-50 shadow-lg text-sm w-full sm:w-auto"
                  )}
                >
                  {dashboardLabel} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200 dark:border-slate-800/70">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              SIKEBUT — Biro Pengadaan Barang dan Jasa Provinsi Sumatera Barat
            </p>
          </div>
          <p className="text-[10px] text-slate-400">Terintegrasi SIPD-RI · © 2026 Pemerintah Provinsi Sumatera Barat</p>
        </div>
      </footer>
    </div>
  )
}

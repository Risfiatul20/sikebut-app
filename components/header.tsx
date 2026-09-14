"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"
import { NotificationBell } from "@/components/notification-bell"
import { useTahunAktif } from "@/components/tahun-provider"

export function Header() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { tahun, setTahun, tahunOptions } = useTahunAktif()

  // Format breadcrumb from pathname
  const paths = pathname.split("/").filter(Boolean)
  const breadcrumbs = paths.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "))

  // Ambil data user dari session yang sedang login
  const userName = session?.user?.name || session?.user?.username || "[username]"
  const userRole = session?.user?.role || "-"
  const userSkpd = session?.user?.namaSkpd || "-"

  // Inisial untuk avatar (misal: "Bambang Sudibyo" -> "BS")
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "US"

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span>SIPD-RI</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100">{breadcrumbs[breadcrumbs.length - 1] || "Dashboard"}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Pemilih Tahun Anggaran — data di semua halaman mengikuti tahun ini */}
        <div className="relative hidden sm:block">
          <Calendar className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            title="Tahun Anggaran"
            aria-label="Tahun Anggaran"
            className="h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-8 pr-7 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors cursor-pointer appearance-none"
          >
            {tahunOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <svg
            className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="relative hidden md:block">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="h-8 w-48 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <NotificationBell />

        <ThemeToggle />

        <div className="ml-1 pl-3 border-l border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="text-right hidden sm:block max-w-[180px]">
            <p className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 leading-none truncate" title={userName}>
              {userName}
            </p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 truncate" title={`${userRole} • ${userSkpd}`}>
              {userRole} • {userSkpd}
            </p>
          </div>
          <div
            className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 text-xs font-bold shrink-0"
            title={userName}
          >
            {initials}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}

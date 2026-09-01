import { UserManagementTable } from "@/components/users/user-management-table"
import { Users } from "lucide-react"

export const metadata = {
  title: "Manajemen Pengguna — Sikebut PBJ (SIPD-RI)",
  description: "Kelola data akun pengguna, peran sistem, dan unit kerja SKPD (dev.users).",
}

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Manajemen Pengguna
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengelolaan akun operator OPD, verifikator, dan administrator terintegrasi SIPD-RI (<code className="font-mono text-[11px]">dev.users</code>).
          </p>
        </div>
      </div>

      {/* Main Table Component */}
      <UserManagementTable />
    </div>
  )
}

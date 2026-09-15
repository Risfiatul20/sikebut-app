import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AksesDitolak } from "@/components/akses-ditolak"
import { hasAction } from "@/lib/permissions"

/**
 * Penjaga halaman Manajemen Pengguna (`/dashboard/users` + `/dashboard/users/mapping`).
 *
 * Menu sidebar sudah menyembunyikan menu ini untuk peran lain, tetapi URL tetap
 * bisa diketik langsung — karena itu pembatasan dilakukan lagi di sisi server.
 * Izinnya memakai `hasAction("user:manage")` yang sama dengan sidebar, sehingga
 * peran yang berhak (Admin, Kepala OPD, Kepala Sub Unit) tidak terpengaruh.
 */
export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!hasAction(session.user.role, "user:manage")) {
    return <AksesDitolak fitur="Manajemen Pengguna" role={session.user.role} />
  }

  return <>{children}</>
}

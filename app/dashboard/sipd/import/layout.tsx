import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AksesDitolak } from "@/components/akses-ditolak"

/**
 * Penjaga halaman Impor Data SIPD (`/dashboard/sipd/import`).
 *
 * Sejalan dengan pembatasan pada `app/api/sipd/import/route.ts` (hanya Administrator)
 * dan `role:Admin` pada rute backend `import/sipd-penetapan-apbd`, sehingga halaman
 * tidak lagi bisa dibuka lewat URL langsung oleh peran lain.
 */
export default async function SipdImportLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if ((session.user.role || "").toLowerCase().trim() !== "admin") {
    return <AksesDitolak fitur="Impor Data SIPD" role={session.user.role} />
  }

  return <>{children}</>
}

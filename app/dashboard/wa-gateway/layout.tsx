import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AksesDitolak } from "@/components/akses-ditolak"

/**
 * Penjaga halaman WhatsApp Gateway (`/dashboard/wa-gateway`).
 *
 * Sidebar hanya menampilkan menu ini untuk Administrator; halaman & API-nya
 * (`role:Admin` di backend) juga dibatasi agar tidak bisa dibuka lewat URL langsung.
 */
export default async function WaGatewayLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if ((session.user.role || "").toLowerCase().trim() !== "admin") {
    return <AksesDitolak fitur="WhatsApp Gateway" role={session.user.role} />
  }

  return <>{children}</>
}

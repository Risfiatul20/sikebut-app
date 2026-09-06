import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { IdentifikasiDataClient } from "./identifikasi-data-client"

export default async function IdentifikasiDataPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <IdentifikasiDataClient
      session={{
        user: {
          id: session.user.id,
          name: session.user.name,
          username: session.user.username,
          role: session.user.role || "",
          kodeSkpd: session.user.kodeSkpd || "",
          namaSkpd: session.user.namaSkpd || "-",
          subKegiatan: session.user.subkegiatans ?? session.user.subKegiatan ?? [],
        },
      }}
    />
  )
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"

const VALID = ["program", "kegiatan", "sub-kegiatan"] as const
type RefType = (typeof VALID)[number]

// Catatan: route ini TIDAK punya data cadangan (mock). Referensi program/kegiatan/
// sub-kegiatan harus selalu dari backend Laravel (database SIPD). Kalau backend
// tidak terjangkau → error ditampilkan ke pengguna, bukan data palsu.

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type } = await params
  if (!VALID.includes(type as RefType)) {
    return NextResponse.json({ error: "Tipe referensi tidak valid" }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const finalParams = new URLSearchParams(searchParams)

  // Jika kode_skpd belum dikirim via query param, otomatis ambil dari session user login
  if (!finalParams.get("kode_skpd") && session.user.kodeSkpd) {
    finalParams.set("kode_skpd", session.user.kodeSkpd)
  }

  // Meneruskan request ke backend Laravel: /api/v1/ref-program | ref-kegiatan | ref-sub-kegiatan
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-${type}?${finalParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        next: { revalidate: 3600, tags: [`ref-${type}`] },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  if (backendRes.ok) {
    return NextResponse.json(await backendRes.json())
  }

  // Teruskan error backend apa adanya — jangan pernah memakai data cadangan.
  const errText = await backendRes.text()
  return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
}
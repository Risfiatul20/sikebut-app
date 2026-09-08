import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua data SKPD harus
// dari backend Laravel (database). Kalau backend tidak terjangkau → error
// ditampilkan ke pengguna, bukan data palsu.

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Meneruskan request ke backend Laravel
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-skpd?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        // Cache 1 jam (3600 detik) dengan tag untuk invalidasi manual
        next: {
          revalidate: 3600,
          tags: ["ref-skpd"],
        },
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
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { RefAkunListResponse } from "@/types/akun"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua data akun harus
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
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-akun?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        next: {
          revalidate: 3600,
          tags: ["ref-akun"],
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
    const data: RefAkunListResponse = await backendRes.json()
    return NextResponse.json(data)
  }

  // Teruskan error backend apa adanya — jangan pernah memakai data cadangan.
  const errText = await backendRes.text()
  return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
}

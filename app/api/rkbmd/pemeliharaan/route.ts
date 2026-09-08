import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua data RKBMD harus
// dari backend Laravel (database). Kalau backend tidak terjangkau → error
// ditampilkan ke pengguna, bukan data palsu.

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Ambil data langsung dari backend Laravel — TANPA fallback data dummy.
  let res: Response
  try {
    res = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/rkbmd-pemeliharaan?${searchParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        cache: "no-store",
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  if (res.ok) {
    return NextResponse.json(await res.json())
  }

  // Teruskan error backend apa adanya — jangan pernah memakai data cadangan.
  const errText = await res.text()
  return new NextResponse(errText, { status: res.status, headers: { "Content-Type": "application/json" } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "Berkas file wajib diunggah" }, { status: 400 })
    }

    // Kirim langsung ke backend Laravel — TANPA respons mock.
    let res: Response
    try {
      const backendFormData = new FormData()
      backendFormData.append("file", file)

      res = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/import/rkbmd-pemeliharaan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.apiToken}`,
          Accept: "application/json",
        },
        body: backendFormData,
      })
    } catch {
      return NextResponse.json(
        { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
        { status: 502 }
      )
    }

    const json = await res.json()
    if (res.ok) {
      return NextResponse.json(json)
    }

    return NextResponse.json(json, { status: res.status })
  } catch {
    return NextResponse.json({ error: "Gagal memproses impor berkas pemeliharaan" }, { status: 400 })
  }
}
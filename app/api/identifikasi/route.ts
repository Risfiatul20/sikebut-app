import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { IdentifikasiListResponse } from "@/types/identifikasi"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua data harus dari
// backend Laravel (database). Kalau backend tidak terjangkau → error ditampilkan
// ke pengguna, bukan data palsu.

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const singleIdStr = searchParams.get("id")
  if (singleIdStr) {
    const singleId = parseInt(singleIdStr, 10)
    let backendRes: Response
    try {
      backendRes = await fetch(
        `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${singleId}`,
        {
          headers: { Accept: "application/json", Authorization: `Bearer ${session.user.apiToken}` },
          cache: "no-store",
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

  // Ambil data langsung dari backend Laravel — TANPA fallback data dummy.
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan?${searchParams.toString()}`,
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

  if (backendRes.ok) {
    const data: IdentifikasiListResponse = await backendRes.json()
    return NextResponse.json(data)
  }

  // Teruskan error backend apa adanya — jangan pernah memakai data cadangan.
  const errText = await backendRes.text()
  return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validasi SKPD: hanya Admin yang boleh memilih SKPD selain miliknya
    const isAdmin = (session.user.role || "").toLowerCase() === "admin"
    if (!isAdmin && session.user.kodeSkpd) {
      body.kode_skpd = session.user.kodeSkpd
    }

    // Mencoba kirim langsung ke backend Laravel (POST /api/v1/identifikasi-kebutuhan)
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan`
      const backendRes = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })

      const bodyText = await backendRes.text()

      if (backendRes.ok) {
        const json = bodyText ? JSON.parse(bodyText) : {}
        return NextResponse.json(
          {
            success: true,
            message: json.message || "Identifikasi kebutuhan berhasil disimpan sebagai Draft ke database",
            data: json.data || json,
          },
          { status: backendRes.status }
        )
      } else {
        // Teruskan error dari backend (misal 422, 403, 404)
        return new NextResponse(bodyText, {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      return NextResponse.json(
        { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
        { status: 502 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan identifikasi kebutuhan" }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const idStr = searchParams.get("id")
  const id = parseInt(idStr || "", 10)

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 })
  }

  // Hapus langsung ke backend Laravel DELETE /api/v1/identifikasi-kebutuhan/{id}
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
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
export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const idStr = searchParams.get("id")
  const id = parseInt(idStr || "", 10)

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 })
  }

  try {
    const body = await req.json()

    // Validasi SKPD: hanya Admin yang boleh memilih SKPD selain miliknya
    const isAdmin = (session.user.role || "").toLowerCase() === "admin"
    if (!isAdmin && session.user.kodeSkpd) {
      body.kode_skpd = session.user.kodeSkpd
    }

    // Mencoba kirim langsung ke backend Laravel (PUT /api/v1/identifikasi-kebutuhan/{id})
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${id}`
      const backendRes = await fetch(backendUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })

      const bodyText = await backendRes.text()

      if (backendRes.ok) {
        const json = bodyText ? JSON.parse(bodyText) : {}
        return NextResponse.json({
          success: true,
          message: json.message || "Identifikasi kebutuhan berhasil diperbarui",
          data: json.data || json,
        })
      } else {
        return new NextResponse(bodyText, {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      return NextResponse.json(
        { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
        { status: 502 }
      )
    }
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui identifikasi kebutuhan" }, { status: 400 })
  }
}
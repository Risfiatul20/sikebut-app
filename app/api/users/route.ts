import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { UserListResponse } from "@/types/user"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua data pengguna harus
// dari backend Laravel (database). Kalau backend tidak terjangkau → error
// ditampilkan ke pengguna, bukan data palsu.

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Ambil data langsung dari backend Laravel — TANPA fallback data dummy.
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users?${searchParams.toString()}`,
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
    const data: UserListResponse = await backendRes.json()
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

    // Kirim langsung ke backend Laravel
    let backendRes: Response
    try {
      backendRes = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })
    } catch {
      return NextResponse.json(
        { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
        { status: 502 }
      )
    }

    if (backendRes.ok) {
      return NextResponse.json(await backendRes.json(), { status: 201 })
    }

    // Teruskan error backend apa adanya.
    const errText = await backendRes.text()
    return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data pengguna" }, { status: 400 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 })
    }

    // Kirim langsung ke backend Laravel
    let backendRes: Response
    try {
      backendRes = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        body: JSON.stringify(body),
      })
    } catch {
      return NextResponse.json(
        { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
        { status: 502 }
      )
    }

    if (backendRes.ok) {
      return NextResponse.json(await backendRes.json())
    }

    // Teruskan error backend apa adanya.
    const errText = await backendRes.text()
    return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui data pengguna" }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get("id") || "", 10)

  if (!id) {
    return NextResponse.json({ error: "ID pengguna diperlukan" }, { status: 400 })
  }

  // Hapus langsung ke backend Laravel
  let backendRes: Response
  try {
    backendRes = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/users/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  if (backendRes.ok) {
    return NextResponse.json(await backendRes.json())
  }

  // Teruskan error backend apa adanya.
  const errText = await backendRes.text()
  return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
}
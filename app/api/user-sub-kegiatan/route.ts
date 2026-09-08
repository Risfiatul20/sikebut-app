import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

/**
 * Proxy mapping PPK ↔ sub kegiatan.
 * Error backend (403/404/422/500) SELALU diteruskan — tidak jatuh ke mock.
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/user-sub-kegiatan${qs}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    const text = await backendRes.text()
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke server. Silakan coba lagi." }, { status: 502 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const backendRes = await fetch(`${API_URL}/api/v1/user-sub-kegiatan`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const text = await backendRes.text()
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 502 })
  }
}
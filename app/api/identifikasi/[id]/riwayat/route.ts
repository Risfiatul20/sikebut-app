import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

/**
 * Proxy riwayat/audit trail paket identifikasi.
 * Error backend (401/403/404/422/500) SELALU diteruskan — tidak jatuh ke mock,
 * agar masalah nyata terlihat, bukan disembunyikan data tiruan.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const backendUrl = `${API_URL}/api/v1/identifikasi-kebutuhan/${id}/riwayat`
    const backendRes = await fetch(backendUrl, {
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
    return NextResponse.json(
      { error: "Gagal terhubung ke server. Silakan coba lagi." },
      { status: 502 }
    )
  }
}
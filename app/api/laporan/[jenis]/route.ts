import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

const VALID = [
  "penyedia",
  "swakelola",
  "ba-pembahasan-penyedia",
  "ba-pembahasan-swakelola",
  "ba-rkbmd-pengadaan",
  "ba-rkbmd-pemeliharaan",
] as const

/**
 * Proxy generik laporan paket (Penyedia/Swakelola) & Berita Acara.
 * Error backend SELALU diteruskan — tidak jatuh ke mock.
 */
export async function GET(req: Request, { params }: { params: Promise<{ jenis: string }> }) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jenis } = await params
  if (!VALID.includes(jenis as (typeof VALID)[number])) {
    return NextResponse.json({ error: "Jenis laporan tidak valid" }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/laporan/${jenis}${qs}`, {
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
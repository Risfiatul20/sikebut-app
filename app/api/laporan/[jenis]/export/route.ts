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
 * Proxy ekspor Excel laporan (Penyedia/Swakelola/BA) — meneruskan file .xlsx
 * dari backend Laravel ke browser pengguna.
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
    const backendRes = await fetch(`${API_URL}/api/v1/laporan/${jenis}/export${qs}`, {
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Gagal membuat file Excel." }, { status: backendRes.status })
    }

    const buf = Buffer.from(await backendRes.arrayBuffer())
    const disposition = backendRes.headers.get("content-disposition") || "attachment"
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": backendRes.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": disposition,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke server. Silakan coba lagi." }, { status: 502 })
  }
}
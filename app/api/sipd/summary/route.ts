import { auth } from "@/auth"
import { NextResponse } from "next/server"

/**
 * Proxy ringkasan agregat SIPD (total baris & pagu SELURUH data terfilter,
 * bukan hanya halaman yang sedang tampil).
 * Backend: GET /api/v1/sipd-penetapan-apbd/summary
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams(searchParams)

  let res: Response
  try {
    res = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-penetapan-apbd/summary?${params.toString()}`,
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

  const errText = await res.text()
  return new NextResponse(errText, { status: res.status, headers: { "Content-Type": "application/json" } })
}

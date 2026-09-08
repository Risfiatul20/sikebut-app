import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ""

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/laporan/kebutuhan/export${qs}`, {
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "")
      return NextResponse.json({ error: `Export gagal (HTTP ${backendRes.status})`, detail: text.slice(0, 300) }, { status: backendRes.status })
    }

    const buf = await backendRes.arrayBuffer()
    const filename = backendRes.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/)?.[1] || "laporan-kebutuhan.xlsx"

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 502 })
  }
}
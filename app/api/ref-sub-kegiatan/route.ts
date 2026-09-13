import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { getSelectedYear } from "@/lib/year"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const finalParams = new URLSearchParams(searchParams)
  if (!finalParams.get("tahun")) {
    finalParams.set("tahun", await getSelectedYear())
  }
  const qs = `?${finalParams.toString()}`

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/ref-sub-kegiatan${qs}`, {
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
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 502 })
  }
}
import { NextResponse } from "next/server"

const BASE_URL = "https://wilayah.id/api"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path")
  if (!path) {
    return NextResponse.json({ error: "Missing 'path' query param" }, { status: 400 })
  }

  try {
    const res = await fetch(`${BASE_URL}/${path}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 86400 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Failed to fetch wilayah data" }, { status: 502 })
  }
}

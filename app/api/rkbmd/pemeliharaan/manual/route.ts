import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Tambah data RKBMD Pemeliharaan secara manual (tanpa file Excel).
// Meneruskan body JSON apa adanya ke backend Laravel — tanpa fallback mock.

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 })
  }

  let res: Response
  try {
    res = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/rkbmd-pemeliharaan/manual`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  const json = await res.json()
  if (res.ok) {
    return NextResponse.json(json)
  }
  return NextResponse.json(json, { status: res.status })
}
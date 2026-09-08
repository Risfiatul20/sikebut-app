import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let res: Response
  try {
    res = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-versions`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })
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
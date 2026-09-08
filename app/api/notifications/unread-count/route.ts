import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

export async function GET() {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const backendUrl = `${API_URL}/api/v1/notifications/unread-count`
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
    return NextResponse.json({ error: "Gagal terhubung ke server." }, { status: 502 })
  }
}
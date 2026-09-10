import { auth } from "@/auth"
import { NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

/**
 * Proxy aksi per-device WA Gateway:
 *  GET  /api/wa-gateway/devices/{deviceId}/qr
 *  POST /api/wa-gateway/devices/{deviceId}/logout
 *  POST /api/wa-gateway/devices/{deviceId}/priority
 */
export async function GET(_req: Request, ctx: { params: Promise<{ deviceId: string; action: string }> }) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { deviceId, action } = await ctx.params

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/wa-gateway/devices/${deviceId}/${action}`, {
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

export async function POST(req: Request, ctx: { params: Promise<{ deviceId: string; action: string }> }) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { deviceId, action } = await ctx.params
  const body = await req.json().catch(() => ({}))

  try {
    const backendRes = await fetch(`${API_URL}/api/v1/wa-gateway/devices/${deviceId}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      body: JSON.stringify(body),
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
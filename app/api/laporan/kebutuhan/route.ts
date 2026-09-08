import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Route proxy Next.js: meneruskan GET /api/laporan/kebutuhan ke backend Laravel
// (token Sanctum dari session NextAuth). Tanpa fallback mock — data harus asli.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/laporan/kebutuhan?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    const bodyText = await backendRes.text()

    if (backendRes.ok) {
      return new NextResponse(bodyText, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Teruskan error bisnis backend apa adanya (401/403/422/dll) agar terlihat.
    return new NextResponse(bodyText, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke server laporan. Coba lagi beberapa saat." },
      { status: 502 }
    )
  }
}

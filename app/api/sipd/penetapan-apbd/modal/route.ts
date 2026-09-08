import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Catatan: route ini TIDAK punya data cadangan (mock). Data modal RKA SIPD harus
// selalu dari backend Laravel (database). Kalau backend tidak terjangkau → error
// ditampilkan ke pengguna, bukan data palsu.

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const kodeSubKegiatan =
    searchParams.get("kode_sub_kegiatan") ?? searchParams.get("subkegiatan") ?? ""

  // kode_sub_kegiatan wajib
  if (!kodeSubKegiatan) {
    return NextResponse.json({ error: "Parameter kode_sub_kegiatan wajib diisi" }, { status: 400 })
  }

  // Meneruskan ke backend: GET /api/v1/sipd-penetapan-apbd/modal
  let backendRes: Response
  try {
    const params = new URLSearchParams(searchParams)
    // Jika kode_skpd/kode_sub_unit tidak dikirim, isi dari session user login
    if (!params.get("kode_skpd") && !params.get("kode_sub_unit") && session.user.kodeSkpd) {
      params.set("kode_skpd", session.user.kodeSkpd)
    }
    if (!params.get("tahun")) params.set("tahun", "2026")

    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-penetapan-apbd/modal?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        next: { revalidate: 300, tags: ["sipd-modal"] },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  const bodyText = await backendRes.text()

  // Teruskan status error asli (403 Forbidden, 404 Not Found, dll)
  if (!backendRes.ok) {
    return new NextResponse(bodyText, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    })
  }

  return NextResponse.json(bodyText ? JSON.parse(bodyText) : {})
}

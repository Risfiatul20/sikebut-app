import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file")

  if (!file) {
    return NextResponse.json({ error: "Berkas file wajib diunggah" }, { status: 400 })
  }

  // Teruskan multipart ke backend Laravel: POST /api/v1/import/sipd-penetapan-apbd
  let res: Response
  try {
    const backendFormData = new FormData()
    backendFormData.append("file", file)
    const tahun = formData.get("tahun")
    const namaVersi = formData.get("nama_versi")
    if (tahun) backendFormData.append("tahun", String(tahun))
    if (namaVersi) backendFormData.append("nama_versi", String(namaVersi))

    res = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/import/sipd-penetapan-apbd`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.user.apiToken}`,
        Accept: "application/json",
      },
      body: backendFormData,
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
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { IdentifikasiKebutuhan } from "@/types/identifikasi"
import { INITIAL_IDENTIFIKASI_LIST } from "@/lib/mock-identifikasi"

// In-memory fallback state for development when backend is offline
const identifikasiStore: IdentifikasiKebutuhan[] = [...INITIAL_IDENTIFIKASI_LIST]

interface ReviewPayload {
  status_review: "Disetujui" | "Ditolak" | "Menunggu Review" | "Draft"
  catatan_reviewer?: string | null
  catatan_reviewer_detail?: Record<string, unknown> | null
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = (session.user.role || "").toLowerCase()
  const isVerifikator = userRole === "verifikator"
  const isAdmin = userRole === "admin"
  const isPpk = userRole === "ppk"

  const { id: paketIdStr } = await params
  const paketId = parseInt(paketIdStr, 10)
  if (!paketId || isNaN(paketId)) {
    return NextResponse.json({ error: "ID paket tidak valid." }, { status: 400 })
  }

  let body: ReviewPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 })
  }

  // Jika PPK melakukan aksi "Ajukan Review", boleh mengubah status ke "Menunggu Review"
  if (isPpk && body.status_review !== "Menunggu Review") {
    return NextResponse.json(
      { error: "PPK hanya dapat mengajukan usulan ke status Menunggu Review." },
      { status: 403 }
    )
  }

  // Jika bukan Verifikator, Admin, atau PPK
  if (!isVerifikator && !isAdmin && !isPpk) {
    return NextResponse.json(
      { error: "Anda tidak memiliki hak akses untuk mengubah status review ini." },
      { status: 403 }
    )
  }

  // Meneruskan ke backend Laravel PATCH /api/v1/identifikasi-kebutuhan/{id}/review
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${paketId}/review`
    const backendRes = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      body: JSON.stringify(body),
    })

    const bodyText = await backendRes.text()
    if (backendRes.ok) {
      const json = bodyText ? JSON.parse(bodyText) : {}
      return NextResponse.json(
        {
          success: true,
          message: json.message || "Hasil review / status berhasil disimpan",
          data: json.data || json,
        },
        { status: backendRes.status }
      )
    }
    return new NextResponse(bodyText, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    // Backend offline -> fallback in-memory update
  }

  const idx = identifikasiStore.findIndex((i) => i.id === paketId)
  if (idx === -1) {
    return NextResponse.json({ error: "Paket identifikasi tidak ditemukan." }, { status: 404 })
  }

  const allowed = ["Disetujui", "Ditolak", "Menunggu Review", "Draft"]
  if (!allowed.includes(body.status_review)) {
    return NextResponse.json({ error: "status_review tidak valid." }, { status: 422 })
  }

  const updated: IdentifikasiKebutuhan = {
    ...identifikasiStore[idx],
    status_review: body.status_review,
    catatan_reviewer: body.catatan_reviewer !== undefined ? body.catatan_reviewer : identifikasiStore[idx].catatan_reviewer,
    catatan_reviewer_detail: body.catatan_reviewer_detail !== undefined ? body.catatan_reviewer_detail : (identifikasiStore[idx].catatan_reviewer_detail ?? null),
    updated_at: new Date().toISOString(),
  }

  identifikasiStore[idx] = updated

  return NextResponse.json({
    success: true,
    message: `Status usulan diperbarui menjadi ${body.status_review}.`,
    data: updated,
  })
}
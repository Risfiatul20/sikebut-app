import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Catatan: route ini TIDAK punya data cadangan (mock). Semua aksi review harus
// diteruskan ke backend Laravel (database). Kalau backend tidak terjangkau →
// error ditampilkan ke pengguna, bukan hasil review palsu di memori.

type ReviewAction = "submit" | "approve" | "return" | "note"

interface ReviewPayload {
  action?: ReviewAction
  // Legacy: terima status_review lama agar pemanggil lama tetap bekerja.
  status_review?: string | null
  catatan_reviewer?: string | null
  catatan_reviewer_detail?: Record<string, unknown> | null
}

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

/**
 * Petakan payload (action / status_review legacy) ke aksi kanonik.
 */
function resolveAction(body: ReviewPayload): ReviewAction {
  if (body.action) return body.action

  switch (body.status_review) {
    case "Diajukan":
    case "Menunggu Review":
      return "submit"
    case "Disetujui":
      return "approve"
    case "Perlu Perbaikan":
    case "Ditolak":
      return "return"
    default:
      return "note"
  }
}

/**
 * Teruskan aksi ke endpoint backend Laravel yang sesuai.
 */
async function forwardToBackend(
  action: ReviewAction,
  paketId: number,
  token: string,
  body: ReviewPayload
): Promise<{ ok: boolean; status: number; text: string }> {
  const pathMap: Record<ReviewAction, string> = {
    submit: `/api/v1/identifikasi-kebutuhan/${paketId}/submit`,
    approve: `/api/v1/identifikasi-kebutuhan/${paketId}/verify`,
    return: `/api/v1/identifikasi-kebutuhan/${paketId}/return`,
    note: `/api/v1/identifikasi-kebutuhan/${paketId}/note`,
  }

  const payload: Record<string, unknown> = {}
  if (action !== "submit") {
    if (body.catatan_reviewer !== undefined) payload.catatan_reviewer = body.catatan_reviewer
    if (body.catatan_reviewer_detail !== undefined) payload.catatan_reviewer_detail = body.catatan_reviewer_detail
  }

  const res = await fetch(`${API_URL}${pathMap[action]}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  return { ok: res.ok, status: res.status, text: await res.text() }
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

  const action = resolveAction(body)

  // ---- Role check (sama dengan kebijakan backend) ----
  if (isPpk && action !== "submit") {
    return NextResponse.json(
      { error: "PPK hanya dapat mengajukan usulan (submit)." },
      { status: 403 }
    )
  }

  if (!isPpk && !isVerifikator && !isAdmin) {
    return NextResponse.json(
      { error: "Anda tidak memiliki hak akses untuk mengubah status review ini." },
      { status: 403 }
    )
  }

  if (isVerifikator && action === "submit") {
    return NextResponse.json(
      { error: "Verifikator tidak dapat mengajukan paket." },
      { status: 403 }
    )
  }

  // ---- Teruskan ke backend Laravel ----
  try {
    const result = await forwardToBackend(action, paketId, session.user.apiToken, body)

    if (result.ok) {
      const json = result.text ? JSON.parse(result.text) : {}
      return NextResponse.json(
        {
          success: true,
          message: json.message || "Hasil review / status berhasil disimpan",
          data: json.data || json,
        },
        { status: result.status }
      )
    }

    // Error bisnis dari backend (403/404/422/dll) DITERUSKAN apa adanya.
    return new NextResponse(result.text, {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    // Backend tidak terjangkau (network error) → error jujur, bukan hasil palsu.
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }
}

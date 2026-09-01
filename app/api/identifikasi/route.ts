import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { IdentifikasiKebutuhan, StatusReview } from "@/types/identifikasi"

// In-memory fallback state for development when backend is offline
const identifikasiStore: IdentifikasiKebutuhan[] = []

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Mencoba fetch langsung ke backend Laravel jika aktif
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline: fallback ke data lokal
  }

  return NextResponse.json({ data: identifikasiStore })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Validasi SKPD: hanya Admin yang boleh memilih SKPD selain miliknya
    const isAdmin = (session.user.role || "").toLowerCase() === "admin"
    if (!isAdmin && session.user.kodeSkpd) {
      body.kode_skpd = session.user.kodeSkpd
    }

    // Mencoba kirim langsung ke backend Laravel (POST /api/v1/identifikasi-kebutuhan)
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan`
      const backendRes = await fetch(backendUrl, {
        method: "POST",
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
            message: json.message || "Identifikasi kebutuhan berhasil disimpan sebagai Draft ke database",
            data: json.data || json,
          },
          { status: backendRes.status }
        )
      } else {
        // Teruskan error dari backend (misal 422, 403, 404)
        return new NextResponse(bodyText, {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      // Backend offline: fallback simpan ke in-memory store
    }

    // Fallback Offline Mode
    const id = identifikasiStore.length > 0 ? Math.max(...identifikasiStore.map((i) => i.id)) + 1 : 1
    const totalPagu = (body.anggaran || []).reduce((s: number, a: { pagu?: number }) => s + (Number(a.pagu) || 0), 0)

    const record: IdentifikasiKebutuhan = {
      id,
      user_id: session.user.id ? Number(session.user.id) : 1,
      nama_user: session.user.name || session.user.username || "Operator",
      kode_skpd: body.kode_skpd || "",
      nama_skpd: session.user.namaSkpd || "",
      kode_program: body.kode_program || "",
      nama_program: "",
      kode_kegiatan: body.kode_kegiatan || "",
      nama_kegiatan: "",
      kode_sub_kegiatan: body.kode_sub_kegiatan || "",
      nama_sub_kegiatan: "",
      cara_pengadaan: body.cara_pengadaan,
      jenis_pengadaan: body.jenis_pengadaan || null,
      nama_paket: body.nama_paket || "",
      waktu_pemanfaatan_awal: body.waktu_pemanfaatan_awal || null,
      waktu_pemanfaatan_akhir: body.waktu_pemanfaatan_akhir || null,
      waktu_pemilihan_awal: body.waktu_pemilihan_awal || null,
      waktu_pemilihan_akhir: body.waktu_pemilihan_akhir || null,
      waktu_pelaksanaan_kontrak_awal: body.waktu_pelaksanaan_kontrak_awal || null,
      waktu_pelaksanaan_kontrak_akhir: body.waktu_pelaksanaan_kontrak_akhir || null,
      waktu_pelaksanaan_pekerjaan_awal: body.waktu_pelaksanaan_pekerjaan_awal || null,
      waktu_pelaksanaan_pekerjaan_akhir: body.waktu_pelaksanaan_pekerjaan_akhir || null,
      status_review: (body.status_review as StatusReview) || "Draft",
      form_data: body.form_data || {},
      catatan_reviewer: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      anggaran: (body.anggaran || []).map((a: { id_sipd_penetapan: number; kode_standar_harga?: string; pagu: number }, idx: number) => ({
        id: idx + 1,
        identifikasi_kebutuhan_id: id,
        id_sipd_penetapan: a.id_sipd_penetapan,
        kode_standar_harga: a.kode_standar_harga || "",
        nama_standar_harga: "",
        kode_rekening: "",
        nama_rekening: "",
        pagu: Number(a.pagu) || 0,
        created_at: new Date().toISOString(),
      })),
    }

    identifikasiStore.unshift(record)

    return NextResponse.json({
      success: true,
      message: `Identifikasi kebutuhan berhasil disimpan sebagai Draft (Total Pagu: Rp ${totalPagu.toLocaleString("id-ID")})`,
      data: record,
    })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan identifikasi kebutuhan" }, { status: 400 })
  }
}

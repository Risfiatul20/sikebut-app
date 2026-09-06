import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { IdentifikasiKebutuhan, IdentifikasiListResponse, StatusReview } from "@/types/identifikasi"
import { INITIAL_IDENTIFIKASI_LIST } from "@/lib/mock-identifikasi"

// In-memory fallback state for development when backend is offline
const identifikasiStore: IdentifikasiKebutuhan[] = [...INITIAL_IDENTIFIKASI_LIST]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const singleIdStr = searchParams.get("id")
  if (singleIdStr) {
    const singleId = parseInt(singleIdStr, 10)
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${singleId}`
      const backendRes = await fetch(backendUrl, {
        headers: { Accept: "application/json", Authorization: `Bearer ${session.user.apiToken}` },
        cache: "no-store",
      })
      if (backendRes.ok) {
        const json = await backendRes.json()
        return NextResponse.json(json)
      }
    } catch {}
    const found = identifikasiStore.find(i => i.id === singleId)
    if (found) return NextResponse.json({ data: found })
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
  }

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
      const data: IdentifikasiListResponse = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline: fallback ke data lokal
  }

  // Fallback filtering lokal
  const search = searchParams.get("search")?.toLowerCase().trim() || ""
  const statusReview = searchParams.get("status_review") || ""
  const caraPengadaan = searchParams.get("cara_pengadaan") || ""
  const jenisPengadaan = searchParams.get("jenis_pengadaan") || ""
  const kodeProgram = searchParams.get("kode_program") || ""
  const kodeKegiatan = searchParams.get("kode_kegiatan") || ""
  const kodeSubKegiatan = searchParams.get("kode_sub_kegiatan") || ""
  const kodeSkpd = searchParams.get("kode_skpd") || ""
  const sortBy = searchParams.get("sort_by") || "id"
  const sortDirection = searchParams.get("sort_direction") || "desc"
  const perPage = parseInt(searchParams.get("per_page") || "15", 10)
  const page = parseInt(searchParams.get("page") || "1", 10)

  const isPpk = (session.user.role || "").toLowerCase() === "ppk"
  const userSubKegiatans = session.user.subkegiatans || session.user.subKegiatan || []
  const ppkSubCodes = userSubKegiatans.map(s => s.kode_sub_kegiatan)

  let filtered = identifikasiStore.filter((item) => {
    // Scoping PPK
    if (isPpk && ppkSubCodes.length > 0) {
      if (!ppkSubCodes.includes(item.kode_sub_kegiatan)) return false
    }

    if (kodeSkpd && item.kode_skpd !== kodeSkpd) return false
    if (statusReview && item.status_review !== statusReview) return false
    if (caraPengadaan && item.cara_pengadaan !== caraPengadaan) return false
    if (jenisPengadaan && item.jenis_pengadaan !== jenisPengadaan) return false
    if (kodeProgram && item.kode_program !== kodeProgram) return false
    if (kodeKegiatan && item.kode_kegiatan !== kodeKegiatan) return false
    if (kodeSubKegiatan && item.kode_sub_kegiatan !== kodeSubKegiatan) return false

    if (search) {
      const matchPaket = item.nama_paket.toLowerCase().includes(search)
      const matchSub = item.kode_sub_kegiatan.toLowerCase().includes(search) || (item.nama_sub_kegiatan?.toLowerCase().includes(search) ?? false)
      const matchUser = item.pembuat?.nama.toLowerCase().includes(search) || item.nama_user?.toLowerCase().includes(search) || false
      if (!matchPaket && !matchSub && !matchUser) return false
    }

    return true
  })

  // Sorting
  filtered = filtered.sort((a, b) => {
    let aVal: string | number = a.id
    let bVal: string | number = b.id

    if (sortBy === "nama_paket") {
      aVal = a.nama_paket
      bVal = b.nama_paket
    } else if (sortBy === "status_review") {
      aVal = a.status_review
      bVal = b.status_review
    } else if (sortBy === "total_pagu") {
      aVal = Number(a.total_pagu ?? 0)
      bVal = Number(b.total_pagu ?? 0)
    } else if (sortBy === "created_at") {
      aVal = a.created_at
      bVal = b.created_at
    } else if (sortBy === "updated_at") {
      aVal = a.updated_at
      bVal = b.updated_at
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  if (perPage <= 0) {
    return NextResponse.json({ data: filtered })
  }

  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total > 0 ? (page - 1) * perPage + 1 : 0
  const to = Math.min(page * perPage, total)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const payload: IdentifikasiListResponse = {
    data: paginated,
    links: {
      first: `http://localhost:8000/api/v1/identifikasi-kebutuhan?page=1`,
      last: `http://localhost:8000/api/v1/identifikasi-kebutuhan?page=${lastPage}`,
      prev: page > 1 ? `http://localhost:8000/api/v1/identifikasi-kebutuhan?page=${page - 1}` : null,
      next: page < lastPage ? `http://localhost:8000/api/v1/identifikasi-kebutuhan?page=${page + 1}` : null,
    },
    meta: {
      current_page: page,
      from,
      last_page: lastPage,
      per_page: perPage,
      to,
      total,
    },
  }

  return NextResponse.json(payload)
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
      pembuat: {
        id: session.user.id ? Number(session.user.id) : 1,
        nama: session.user.name || session.user.username || "Operator",
        username: session.user.username || "operator",
      },
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
      total_pagu: String(totalPagu.toFixed(2)),
      jumlah_anggaran: (body.anggaran || []).length,
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

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const singleIdStr = searchParams.get("id")
  if (singleIdStr) {
    const singleId = parseInt(singleIdStr, 10)
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${singleId}`
      const backendRes = await fetch(backendUrl, {
        headers: { Accept: "application/json", Authorization: `Bearer ${session.user.apiToken}` },
        cache: "no-store",
      })
      if (backendRes.ok) {
        const json = await backendRes.json()
        return NextResponse.json(json)
      }
    } catch {}
    const found = identifikasiStore.find(i => i.id === singleId)
    if (found) return NextResponse.json({ data: found })
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 })
  }
  const idStr = searchParams.get("id")
  const id = parseInt(idStr || "", 10)

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 })
  }

  // Coba hapus langsung ke backend Laravel DELETE /api/v1/identifikasi-kebutuhan/{id}
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${id}`
    const backendRes = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
    })

    if (backendRes.ok) {
      const json = await backendRes.json()
      return NextResponse.json(json)
    }
  } catch {
    // Fallback lokal
  }

  const idx = identifikasiStore.findIndex((i) => i.id === id)
  if (idx !== -1) {
    identifikasiStore.splice(idx, 1)
  }

  return NextResponse.json({
    message: "Data identifikasi kebutuhan berhasil dihapus",
  })
}
export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const idStr = searchParams.get("id")
  const id = parseInt(idStr || "", 10)

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 })
  }

  try {
    const body = await req.json()

    // Validasi SKPD: hanya Admin yang boleh memilih SKPD selain miliknya
    const isAdmin = (session.user.role || "").toLowerCase() === "admin"
    if (!isAdmin && session.user.kodeSkpd) {
      body.kode_skpd = session.user.kodeSkpd
    }

    // Mencoba kirim langsung ke backend Laravel (PUT /api/v1/identifikasi-kebutuhan/{id})
    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/identifikasi-kebutuhan/${id}`
      const backendRes = await fetch(backendUrl, {
        method: "PUT",
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
        return NextResponse.json({
          success: true,
          message: json.message || "Identifikasi kebutuhan berhasil diperbarui",
          data: json.data || json,
        })
      } else {
        return new NextResponse(bodyText, {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        })
      }
    } catch {
      // Backend offline: fallback update in-memory
    }

    const idx = identifikasiStore.findIndex((i) => i.id === id)
    if (idx === -1) {
      return NextResponse.json({ error: "Data paket tidak ditemukan" }, { status: 404 })
    }

    const totalPagu = (body.anggaran || []).reduce((s: number, a: { pagu?: number }) => s + (Number(a.pagu) || 0), 0)

    const updatedRecord: IdentifikasiKebutuhan = {
      ...identifikasiStore[idx],
      kode_skpd: body.kode_skpd || identifikasiStore[idx].kode_skpd,
      kode_program: body.kode_program || identifikasiStore[idx].kode_program,
      kode_kegiatan: body.kode_kegiatan || identifikasiStore[idx].kode_kegiatan,
      kode_sub_kegiatan: body.kode_sub_kegiatan || identifikasiStore[idx].kode_sub_kegiatan,
      cara_pengadaan: body.cara_pengadaan || identifikasiStore[idx].cara_pengadaan,
      jenis_pengadaan: body.jenis_pengadaan !== undefined ? body.jenis_pengadaan : identifikasiStore[idx].jenis_pengadaan,
      nama_paket: body.nama_paket || identifikasiStore[idx].nama_paket,
      waktu_pemanfaatan_awal: body.waktu_pemanfaatan_awal || null,
      waktu_pemanfaatan_akhir: body.waktu_pemanfaatan_akhir || null,
      waktu_pemilihan_awal: body.waktu_pemilihan_awal || null,
      waktu_pemilihan_akhir: body.waktu_pemilihan_akhir || null,
      waktu_pelaksanaan_kontrak_awal: body.waktu_pelaksanaan_kontrak_awal || null,
      waktu_pelaksanaan_kontrak_akhir: body.waktu_pelaksanaan_kontrak_akhir || null,
      waktu_pelaksanaan_pekerjaan_awal: body.waktu_pelaksanaan_pekerjaan_awal || null,
      waktu_pelaksanaan_pekerjaan_akhir: body.waktu_pelaksanaan_pekerjaan_akhir || null,
      form_data: body.form_data || identifikasiStore[idx].form_data,
      total_pagu: String(totalPagu.toFixed(2)),
      jumlah_anggaran: (body.anggaran || []).length,
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

    identifikasiStore[idx] = updatedRecord

    return NextResponse.json({
      success: true,
      message: `Identifikasi kebutuhan (#${id}) berhasil diperbarui`,
      data: updatedRecord,
    })
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui identifikasi kebutuhan" }, { status: 400 })
  }
}
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { INITIAL_RKBMD_PEMELIHARAAN } from "@/lib/mock-rkbmd"
import { RkbmdPemeliharaanItem } from "@/types/rkbmd"

const pemeliharaanStore: RkbmdPemeliharaanItem[] = [...INITIAL_RKBMD_PEMELIHARAAN]

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search")?.toLowerCase().trim() ?? ""
  const kode_skpd = searchParams.get("kode_skpd") ?? ""
  const periode = searchParams.get("periode") ? parseInt(searchParams.get("periode")!, 10) : 2026
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("per_page") ?? searchParams.get("limit") ?? "10", 10)
  const sort_by = searchParams.get("sort_by") ?? "id_pemeliharaan"
  const sort_direction = searchParams.get("sort_direction") ?? "desc"

  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/rkbmd-pemeliharaan?${searchParams.toString()}`
    const res = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }
  } catch {
    // Fallback lokal
  }

  const filtered = pemeliharaanStore.filter((item) => {
    if (periode && item.periode !== periode) return false
    if (kode_skpd && kode_skpd !== "ALL" && item.kode_skpd !== kode_skpd) return false

    if (search) {
      const matchNama = item.nama_barang.toLowerCase().includes(search) || item.nama_pemeliharaan.toLowerCase().includes(search)
      const matchFikasi = item.kode_fikasi.toLowerCase().includes(search)
      const matchSkpd = item.nama_skpd.toLowerCase().includes(search) || item.kode_skpd.toLowerCase().includes(search)
      if (!matchNama && !matchFikasi && !matchSkpd) return false
    }

    return true
  })

  filtered.sort((a, b) => {
    let aVal = (a as unknown as Record<string, unknown>)[sort_by]
    let bVal = (b as unknown as Record<string, unknown>)[sort_by]
    if (aVal === undefined || aVal === null) aVal = ""
    if (bVal === undefined || bVal === null) bVal = ""

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sort_direction === "asc" ? aVal - bVal : bVal - aVal
    }
    if (String(aVal) < String(bVal)) return sort_direction === "asc" ? -1 : 1
    if (String(aVal) > String(bVal)) return sort_direction === "asc" ? 1 : -1
    return 0
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    data: paginated,
    meta: {
      current_page: page,
      from: total > 0 ? start + 1 : 0,
      last_page: totalPages,
      per_page: limit,
      to: Math.min(start + limit, total),
      total,
    },
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "Berkas file wajib diunggah" }, { status: 400 })
    }

    try {
      const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/import/rkbmd-pemeliharaan`
      const backendFormData = new FormData()
      backendFormData.append("file", file)

      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.apiToken}`,
          Accept: "application/json",
        },
        body: backendFormData,
      })

      const json = await res.json()
      if (res.ok) {
        return NextResponse.json(json)
      } else {
        return NextResponse.json(json, { status: res.status })
      }
    } catch {
      // Backend offline -> Fallback mock response
      const mockImportId = `rkbmd-pemeliharaan-${Date.now()}`
      
      const mockNewItem: RkbmdPemeliharaanItem = {
        id_pemeliharaan: Date.now(),
        kode_skpd: session.user.kodeSkpd || "1.03.0.00.0.00.01.0000",
        nama_skpd: session.user.namaSkpd || "Dinas Pekerjaan Umum",
        kode_program: "1.03.02",
        nama_program: "Program Penyelenggaraan Jalan",
        kode_kegiatan: "1.03.02.1.01",
        nama_giat_nama_giat: "Penyelenggaraan Jalan Kabupaten/Kota",
        kode_sub_kegiatan: "1.03.02.1.01.0004",
        nama_sub_giat_nama_sub_giat: "Hasil Impor Berkas RKBMD Pemeliharaan",
        kode_fikasi: "1.3.3.01.09",
        nama_barang: `Barang Pemeliharaan (${(file as File).name})`,
        jumlah_barang: 5,
        satuan: "Unit",
        kondisi_b: 3,
        kondisi_rr: 2,
        kondisi_rb: 0,
        nama_pemeliharaan: "Pemeliharaan Rutin / Periodic Maintenance Hasil Impor",
        jumlah_pemeliharaan: 5,
        satuan_pemeliharaan: "Unit",
        keterangan: "Data diimpor melalui simulasi unggah berkas pemeliharaan",
        nm_status: "Disetujui Penelaah",
        periode: 2026,
        created_at: new Date().toISOString(),
      }

      pemeliharaanStore.unshift(mockNewItem)

      return NextResponse.json({
        success: true,
        message: `Berkas "${(file as File).name}" berhasil diunggah dan sedang diproses.`,
        import_id: mockImportId,
      })
    }
  } catch {
    return NextResponse.json({ error: "Gagal memproses impor berkas pemeliharaan" }, { status: 400 })
  }
}

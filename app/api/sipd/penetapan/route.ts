import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { INITIAL_SIPD_ITEMS, MOCK_SIPD_VERSIONS } from "@/lib/mock-sipd"
import { SipdItem, SipdVersionInfo } from "@/types/sipd"

// In-memory state for dev dummy API
let sipdStore: SipdItem[] = [...INITIAL_SIPD_ITEMS]
const sipdVersionsStore: SipdVersionInfo[] = [...MOCK_SIPD_VERSIONS]

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tahun = searchParams.get("tahun") ? parseInt(searchParams.get("tahun")!, 10) : 2026
  const versi = searchParams.get("versi") ? parseInt(searchParams.get("versi")!, 10) : 0
  const kode_skpd = searchParams.get("kode_skpd") ?? ""
  const sumber_dana = searchParams.get("sumber_dana") ?? ""
  const q = searchParams.get("q")?.toLowerCase().trim() ?? ""
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "10", 10)
  const sort = searchParams.get("sort") // e.g., "pagu:desc"

  const filtered = sipdStore.filter((item) => {
    if (tahun && item.tahun !== tahun) return false
    if (versi && versi > 0 && item.versi !== versi) return false
    if (kode_skpd && kode_skpd !== "ALL" && item.kode_skpd !== kode_skpd) return false
    if (sumber_dana && sumber_dana !== "ALL" && item.kode_sumber_dana !== sumber_dana) return false

    if (q) {
      const matchProgram = item.nama_program.toLowerCase().includes(q) || item.kode_program.toLowerCase().includes(q)
      const matchKegiatan = item.nama_kegiatan.toLowerCase().includes(q) || item.kode_kegiatan.toLowerCase().includes(q)
      const matchSub = item.nama_sub_kegiatan.toLowerCase().includes(q) || item.kode_sub_kegiatan.toLowerCase().includes(q)
      const matchRekening = item.nama_rekening.toLowerCase().includes(q) || item.kode_rekening.toLowerCase().includes(q)
      const matchStandar = item.nama_standar_harga.toLowerCase().includes(q) || item.kode_standar_harga.toLowerCase().includes(q)
      const matchSkpd = item.nama_skpd.toLowerCase().includes(q) || item.kode_skpd.toLowerCase().includes(q)

      if (!matchProgram && !matchKegiatan && !matchSub && !matchRekening && !matchStandar && !matchSkpd) {
        return false
      }
    }

    return true
  })

  // Sorting
  if (sort) {
    const [key, order] = sort.split(":")
    filtered.sort((a, b) => {
      const aRaw = (a as unknown as Record<string, unknown>)[key]
      const bRaw = (b as unknown as Record<string, unknown>)[key]

      if (typeof aRaw === "number" && typeof bRaw === "number") {
        return order === "asc" ? aRaw - bRaw : bRaw - aRaw
      }

      const aVal = aRaw !== undefined && aRaw !== null ? String(aRaw) : ""
      const bVal = bRaw !== undefined && bRaw !== null ? String(bRaw) : ""

      if (aVal < bVal) return order === "asc" ? -1 : 1
      if (aVal > bVal) return order === "asc" ? 1 : -1
      return 0
    })
  }

  // Pagination
  const start = (page - 1) * limit
  const paginatedData = filtered.slice(start, start + limit)

  // Total Pagu for active filtered set
  const totalPaguFiltered = filtered.reduce((acc, curr) => acc + curr.pagu, 0)

  return NextResponse.json({
    data: paginatedData,
    total: filtered.length,
    totalPagu: totalPaguFiltered,
    versions: sipdVersionsStore,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  })
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tahun, nama_versi, items } = body

    const nextVersi =
      sipdVersionsStore.filter((v) => v.tahun === tahun).length + 1

    const newVersionInfo: SipdVersionInfo = {
      versi: nextVersi,
      nama_versi: nama_versi || `Versi ${nextVersi} - Import ${new Date().toLocaleDateString("id-ID")}`,
      tahun: tahun || 2026,
      total_pagu: (items || []).reduce((acc: number, item: SipdItem) => acc + (item.pagu || 0), 0),
      total_rincian: (items || []).length,
      tanggal_impor: new Date().toISOString(),
      status: "Aktif",
    }

    sipdVersionsStore.unshift(newVersionInfo)

    if (Array.isArray(items) && items.length > 0) {
      const formattedItems: SipdItem[] = items.map((it, idx) => ({
        ...it,
        id: sipdStore.length + idx + 1,
        tahun: tahun || 2026,
        versi: nextVersi,
        nama_versi: newVersionInfo.nama_versi,
        created_at: new Date().toISOString(),
      }))

      sipdStore = [...formattedItems, ...sipdStore]
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor data SIPD versi ${nextVersi}`,
      version: newVersionInfo,
      count: items ? items.length : 0,
    })
  } catch {
    return NextResponse.json(
      { error: "Gagal memproses impor data SIPD" },
      { status: 400 }
    )
  }
}

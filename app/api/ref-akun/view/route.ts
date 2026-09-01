import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MOCK_AKUN_VIEW_DATA } from "@/lib/mock-akun-v2"
import { RefAkunViewListResponse } from "@/types/akun-v2"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Meneruskan request ke backend Laravel jika aktif
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-akun/view?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      next: {
        revalidate: 3600,
        tags: ["ref-akun-view"],
      },
    })

    if (backendRes.ok) {
      const data: RefAkunViewListResponse = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline: fallback ke data mock
  }

  // Fallback filtering lokal
  const search = searchParams.get("search")?.toLowerCase().trim() ?? ""
  const kode2 = searchParams.get("kode_2") ?? ""
  const kode3 = searchParams.get("kode_3") ?? ""
  const kode4 = searchParams.get("kode_4") ?? ""
  const kode5 = searchParams.get("kode_5") ?? ""
  const b = searchParams.get("b") ?? searchParams.get("belanja_pengadaan")
  const r = searchParams.get("r") ?? searchParams.get("rkbmd_pengadaan")
  const h = searchParams.get("h") ?? searchParams.get("pemeliharaan_rehab")
  const t = searchParams.get("t") ?? searchParams.get("pemeliharaan_rutin")
  const perPage = parseInt(searchParams.get("per_page") ?? "15", 10)
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  const filtered = MOCK_AKUN_VIEW_DATA.filter((a) => {
    if (search) {
      const fields = [a.kode_6, a.nama_6, a.nama_5, a.nama_4, a.nama_3, a.nama_2]
      if (!fields.some((f) => f?.toLowerCase().includes(search))) return false
    }
    if (kode2 && a.kode_2 !== kode2) return false
    if (kode3 && a.kode_3 !== kode3) return false
    if (kode4 && a.kode_4 !== kode4) return false
    if (kode5 && a.kode_5 !== kode5) return false
    if (b === "true" && !a.b) return false
    if (b === "false" && a.b) return false
    if (r === "true" && !a.r) return false
    if (r === "false" && a.r) return false
    if (h === "true" && !a.h) return false
    if (h === "false" && a.h) return false
    if (t === "true" && !a.t) return false
    if (t === "false" && a.t) return false
    return true
  })

  // Tanpa paginasi jika per_page = 0
  if (!perPage || perPage <= 0) {
    return NextResponse.json({ data: filtered })
  }

  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const from = total > 0 ? (page - 1) * perPage + 1 : 0
  const to = Math.min(page * perPage, total)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const payload: RefAkunViewListResponse = {
    data: paginated,
    links: {
      first: `http://localhost:8000/api/v1/ref-akun/view?page=1`,
      last: `http://localhost:8000/api/v1/ref-akun/view?page=${lastPage}`,
      prev: page > 1 ? `http://localhost:8000/api/v1/ref-akun/view?page=${page - 1}` : null,
      next: page < lastPage ? `http://localhost:8000/api/v1/ref-akun/view?page=${page + 1}` : null,
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

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MOCK_SKPD } from "@/lib/mock-users"
import { RefSkpd } from "@/types/skpd"

// Fallback dev data mengikuti format docs/skpd.md
const FALLBACK_SKPD: RefSkpd[] = MOCK_SKPD.map((s) => ({
  kode_skpd: s.kode_skpd,
  nama_skpd: s.nama_skpd,
  parent_kode_skpd: null,
  is_sub_unit: false,
}))

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Meneruskan request ke backend Laravel jika aktif
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-skpd?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      // Cache 1 jam (3600 detik) dengan tag untuk invalidasi manual
      next: {
        revalidate: 3600,
        tags: ["ref-skpd"],
      },
    })

    if (backendRes.ok) {
      const data = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline: fallback ke data lokal
  }

  // Fallback filtering lokal
  const search = searchParams.get("search")?.toLowerCase().trim() ?? ""
  const isSubUnit = searchParams.get("is_sub_unit")
  const parentKode = searchParams.get("parent_kode_skpd") ?? ""
  const sortBy = searchParams.get("sort_by") ?? "kode_skpd"
  const sortDirection = searchParams.get("sort_direction") ?? "asc"
  const perPage = parseInt(searchParams.get("per_page") ?? "0", 10)
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  let filtered = FALLBACK_SKPD.filter((skpd) => {
    if (search) {
      const matchKode = skpd.kode_skpd.toLowerCase().includes(search)
      const matchNama = skpd.nama_skpd.toLowerCase().includes(search)
      if (!matchKode && !matchNama) return false
    }
    if (isSubUnit === "true" && !skpd.is_sub_unit) return false
    if (isSubUnit === "false" && skpd.is_sub_unit) return false
    if (parentKode && skpd.parent_kode_skpd !== parentKode) return false
    return true
  })

  filtered = filtered.sort((a, b) => {
    const key = sortBy as keyof RefSkpd
    const aVal = String(a[key] ?? "")
    const bVal = String(b[key] ?? "")
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1
    return 0
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

  const payload = {
    data: paginated,
    links: {
      first: `http://localhost:8000/api/v1/ref-skpd?page=1`,
      last: `http://localhost:8000/api/v1/ref-skpd?page=${lastPage}`,
      prev: page > 1 ? `http://localhost:8000/api/v1/ref-skpd?page=${page - 1}` : null,
      next: page < lastPage ? `http://localhost:8000/api/v1/ref-skpd?page=${page + 1}` : null,
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
    // Cache 1 jam juga untuk fallback lokal
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
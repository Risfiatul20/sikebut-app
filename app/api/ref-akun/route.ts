import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MOCK_AKUN_DATA } from "@/lib/mock-akun"
import { RefAkunListResponse } from "@/types/akun"

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)

  // Meneruskan request ke backend Laravel jika aktif
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-akun?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      next: {
        revalidate: 3600,
        tags: ["ref-akun"],
      },
    })

    if (backendRes.ok) {
      const data: RefAkunListResponse = await backendRes.json()
      return NextResponse.json(data)
    }
  } catch {
    // Backend offline: fallback ke data mock
  }

  // Fallback filtering lokal
  const search = searchParams.get("search")?.toLowerCase().trim() ?? ""
  const level = searchParams.get("level") ? parseInt(searchParams.get("level")!, 10) : null
  const parent = searchParams.get("parent") ?? ""
  const b = searchParams.get("b")
  const r = searchParams.get("r")
  const h = searchParams.get("h")
  const t = searchParams.get("t")
  const perPage = parseInt(searchParams.get("per_page") ?? "0", 10)
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  const filtered = MOCK_AKUN_DATA.filter((a) => {
    if (search) {
      const matchKode = a.kode.toLowerCase().includes(search)
      const matchNama = a.nama.toLowerCase().includes(search)
      if (!matchKode && !matchNama) return false
    }
    if (level !== null && a.level !== level) return false
    if (parent && a.parent !== parent) return false
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

  const payload: RefAkunListResponse = {
    data: paginated,
    links: {
      first: `http://localhost:8000/api/v1/ref-akun?page=1`,
      last: `http://localhost:8000/api/v1/ref-akun?page=${lastPage}`,
      prev: page > 1 ? `http://localhost:8000/api/v1/ref-akun?page=${page - 1}` : null,
      next: page < lastPage ? `http://localhost:8000/api/v1/ref-akun?page=${page + 1}` : null,
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

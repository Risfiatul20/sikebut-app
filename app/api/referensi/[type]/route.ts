import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { MOCK_PROGRAMS, MOCK_KEGIATAN, MOCK_SUB_KEGIATAN_LIST } from "@/lib/mock-identifikasi"

const VALID = ["program", "kegiatan", "sub-kegiatan"] as const
type RefType = (typeof VALID)[number]

function filterMock(type: RefType, searchParams: URLSearchParams) {
  const search = searchParams.get("search")?.toLowerCase().trim() ?? ""

  if (type === "program") {
    return MOCK_PROGRAMS.filter(
      (p) =>
        !search ||
        p.kode_program.toLowerCase().includes(search) ||
        p.nama_program.toLowerCase().includes(search)
    )
  }

  if (type === "kegiatan") {
    const kodeProgram = searchParams.get("kode_program") ?? ""
    return MOCK_KEGIATAN.filter(
      (k) =>
        (!kodeProgram || k.kode_program === kodeProgram) &&
        (!search ||
          k.kode_kegiatan.toLowerCase().includes(search) ||
          k.nama_kegiatan.toLowerCase().includes(search))
    )
  }

  const kodeKegiatan = searchParams.get("kode_kegiatan") ?? ""
  return MOCK_SUB_KEGIATAN_LIST.filter(
    (s) =>
      (!kodeKegiatan || s.kode_kegiatan === kodeKegiatan) &&
      (!search ||
        s.kode_sub_kegiatan.toLowerCase().includes(search) ||
        s.nama_sub_kegiatan.toLowerCase().includes(search))
  )
}

export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type } = await params
  if (!VALID.includes(type as RefType)) {
    return NextResponse.json({ error: "Tipe referensi tidak valid" }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)

  // Meneruskan request ke backend Laravel: /api/v1/ref-program | ref-kegiatan | ref-sub-kegiatan
  try {
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/ref-${type}?${searchParams.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      next: { revalidate: 3600, tags: [`ref-${type}`] },
    })

    if (backendRes.ok) {
      return NextResponse.json(await backendRes.json())
    }
  } catch {
    // Backend offline: fallback ke data mock
  }

  const data = filterMock(type as RefType, searchParams)

  return NextResponse.json(
    { data },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  )
}

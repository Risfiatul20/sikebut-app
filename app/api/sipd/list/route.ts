import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { SipdItem } from "@/types/sipd"

interface RawSipdRow {
  id: number | string
  kode_daerah?: string | null
  nama_daerah?: string | null
  tahun?: number | string | null
  versi?: number | string | null
  kode_skpd?: string | null
  nama_skpd?: string | null
  kode_opd?: string | null
  nama_opd?: string | null
  kode_sub_unit?: string | null
  nama_sub_unit?: string | null
  kode_urusan?: string | null
  nama_urusan?: string | null
  kode_bidang_urusan?: string | null
  nama_bidang_urusan?: string | null
  kode_program?: string | null
  nama_program?: string | null
  kode_kegiatan?: string | null
  nama_kegiatan?: string | null
  kode_sub_kegiatan?: string | null
  nama_sub_kegiatan?: string | null
  kode_sumber_dana?: string | null
  nama_sumber_dana?: string | null
  kode_rekening?: string | null
  nama_rekening?: string | null
  kode_standar_harga?: string | null
  nama_standar_harga?: string | null
  pagu?: number | string | null
  indikator_rkb?: {
    is_belanja_pengadaan?: boolean
    is_rkbmd_pengadaan?: boolean
    is_rkbmd_pemeliharaan_rehab?: boolean
    is_rkbmd_pemeliharaan_rutin?: boolean
  } | null
  indikator_rkbmd?: { b?: boolean; r?: boolean; h?: boolean; t?: boolean } | null
  created_at?: string | null
}

/**
 * Normalisasi baris dari GET /api/v1/sipd-penetapan-apbd ke bentuk SipdItem.
 */
function normalizeRow(r: RawSipdRow): SipdItem {
  const versiNum = Number(r.versi ?? 0)
  const ind = r.indikator_rkbmd
    ? { b: !!r.indikator_rkbmd.b, r: !!r.indikator_rkbmd.r, h: !!r.indikator_rkbmd.h, t: !!r.indikator_rkbmd.t }
    : r.indikator_rkb
      ? { b: !!r.indikator_rkb.is_belanja_pengadaan, r: !!r.indikator_rkb.is_rkbmd_pengadaan, h: !!r.indikator_rkb.is_rkbmd_pemeliharaan_rehab, t: !!r.indikator_rkb.is_rkbmd_pemeliharaan_rutin }
      : undefined
  return {
    id: Number(r.id),
    kode_daerah: r.kode_daerah ?? "",
    nama_daerah: r.nama_daerah ?? "",
    tahun: Number(r.tahun ?? 0),
    versi: Number.isFinite(versiNum) ? versiNum : 0,
    nama_versi: `Versi ${r.versi ?? "-"}`,
    kode_skpd: r.kode_skpd ?? r.kode_opd ?? "",
    nama_skpd: r.nama_skpd ?? r.nama_opd ?? "",
    kode_opd: r.kode_opd ?? r.kode_skpd ?? "",
    nama_opd: r.nama_opd ?? r.nama_skpd ?? "",
    kode_sub_unit: r.kode_sub_unit ?? "",
    nama_sub_unit: r.nama_sub_unit ?? "",
    kode_urusan: r.kode_urusan ?? "",
    nama_urusan: r.nama_urusan ?? "",
    kode_bidang_urusan: r.kode_bidang_urusan ?? "",
    nama_bidang_urusan: r.nama_bidang_urusan ?? "",
    kode_program: r.kode_program ?? "",
    nama_program: r.nama_program ?? "",
    kode_kegiatan: r.kode_kegiatan ?? "",
    nama_kegiatan: r.nama_kegiatan ?? "",
    kode_sub_kegiatan: r.kode_sub_kegiatan ?? "",
    nama_sub_kegiatan: r.nama_sub_kegiatan ?? "",
    kode_sumber_dana: r.kode_sumber_dana ?? "",
    nama_sumber_dana: r.nama_sumber_dana ?? "",
    kode_rekening: r.kode_rekening ?? "",
    nama_rekening: r.nama_rekening ?? "",
    kode_standar_harga: r.kode_standar_harga ?? "",
    nama_standar_harga: r.nama_standar_harga ?? "",
    pagu: Number(r.pagu ?? 0),
    indikator_rkbmd: ind,
    created_at: r.created_at ?? "",
  }
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const finalParams = new URLSearchParams(searchParams)
  if (!finalParams.get("per_page")) finalParams.set("per_page", "0")

  // Teruskan ke backend: GET /api/v1/sipd-penetapan-apbd (list rincian) — TANPA fallback mock.
  let backendRes: Response
  try {
    backendRes = await fetch(
      `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-penetapan-apbd?${finalParams.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.user.apiToken}`,
        },
        next: { revalidate: 3600, tags: ["sipd-list"] },
      }
    )
  } catch {
    return NextResponse.json(
      { error: "Backend tidak dapat dijangkau. Pastikan server API (Laravel) berjalan." },
      { status: 502 }
    )
  }

  if (backendRes.ok) {
    const json = await backendRes.json()
    const rows: RawSipdRow[] = json.data ?? []
    const normalized = rows.map(normalizeRow)
    return NextResponse.json({
      data: normalized,
      links: json.links,
      meta: json.meta,
    })
  }

  // Teruskan error backend apa adanya — jangan pernah memakai data cadangan.
  const errText = await backendRes.text()
  return new NextResponse(errText, { status: backendRes.status, headers: { "Content-Type": "application/json" } })
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { INITIAL_SIPD_ITEMS } from "@/lib/mock-sipd"
import { SipdItem } from "@/types/sipd"

interface RawSipdRow {
  id: number | string
  kode_daerah?: string | null
  nama_daerah?: string | null
  tahun?: number | string | null
  versi?: number | string | null
  nama_versi?: string | null
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
  indikator_rkbmd?: { b: boolean; r: boolean; h: boolean; t: boolean } | null
  created_at?: string | null
}

/**
 * Normalisasi response /api/v1/sipd-penetapan-apbd ke bentuk SipdItem.
 * - pagu & versi dikirim backend sebagai string -> dikonversi ke number
 * - nama/kode SKPD dipetakan dari kode_opd/nama_opd
 * - pagu string "15000000.00" -> 15000000
 */
function normalizeRow(r: RawSipdRow): SipdItem {
  const versiNum = Number(r.versi ?? 0)
  return {
    id: Number(r.id),
    kode_daerah: r.kode_daerah ?? "",
    nama_daerah: r.nama_daerah ?? "",
    tahun: Number(r.tahun ?? 0),
    versi: Number.isFinite(versiNum) ? versiNum : 0,
    nama_versi: r.nama_versi ?? `Versi ${r.versi ?? "-"}`,
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
    indikator_rkbmd: r.indikator_rkbmd ?? undefined,
    created_at: r.created_at ?? "",
  }
}

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const kodeSubKegiatan = searchParams.get("kode_sub_kegiatan") ?? ""

  // kode_sub_kegiatan wajib: tanpa ini tidak ada data diambil
  if (!kodeSubKegiatan) {
    return NextResponse.json({ data: [] })
  }

  // Teruskan ke backend Laravel: /api/v1/sipd-penetapan-apbd
  try {
    const params = new URLSearchParams({ per_page: "0", kode_sub_kegiatan: kodeSubKegiatan })
    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-penetapan-apbd?${params.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      next: { revalidate: 3600, tags: ["sipd-penetapan-apbd"] },
    })

    if (backendRes.ok) {
      const json = await backendRes.json()
      const rows: RawSipdRow[] = json.data ?? []
      return NextResponse.json({ data: rows.map(normalizeRow) })
    }
  } catch {
    // Backend offline: fallback ke data mock
  }

  const fallback = INITIAL_SIPD_ITEMS.filter((it) => it.kode_sub_kegiatan === kodeSubKegiatan)
  return NextResponse.json({ data: fallback })
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { SipdModalData, SipdModalApiResponse } from "@/types/sipd-modal"

// Fallback data offline sesuai struktur docs/modal_sipd.md
const MOCK_MODAL: SipdModalData = {
  skpd: {
    kode_skpd: "1.01.0.00.0.00.01.0000",
    nama_skpd: "DINAS PENDIDIKAN DAN KEBUDAYAAN",
    total_pagu: "150000000000.00",
    total_pagu_pengadaan: "45000000000.00",
    total_pagu_non_pengadaan: "105000000000.00",
    total_kebutuhan_anggaran: "38000000000.00",
    sisa_pagu_pengadaan: "7000000000.00",
  },
  sub_unit: {
    kode_sub_unit: "1.01.0.00.0.00.01.0001",
    nama_sub_unit: "Bidang Pembinaan SMP",
    total_pagu: "25000000000.00",
    total_pagu_pengadaan: "12000000000.00",
    total_pagu_non_pengadaan: "13000000000.00",
    total_kebutuhan_anggaran: "10000000000.00",
    sisa_pagu_pengadaan: "2000000000.00",
  },
  program: {
    kode_program: "1.01.02",
    nama_program: "PROGRAM PENGELOLAAN PENDIDIKAN",
    total_pagu: "18000000000.00",
    total_pagu_pengadaan: "9000000000.00",
    total_pagu_non_pengadaan: "9000000000.00",
    total_kebutuhan_anggaran: "7500000000.00",
    sisa_pagu_pengadaan: "1500000000.00",
  },
  kegiatan: {
    kode_kegiatan: "1.01.02.1.01",
    nama_kegiatan: "Pengelolaan Pendidikan Sekolah Menengah Pertama",
    total_pagu: "5000000000.00",
    total_pagu_pengadaan: "3500000000.00",
    total_pagu_non_pengadaan: "1500000000.00",
    total_kebutuhan_anggaran: "3000000000.00",
    sisa_pagu_pengadaan: "500000000.00",
  },
  sub_kegiatan: {
    kode_sub_kegiatan: "1.01.02.1.01.0036",
    nama_sub_kegiatan: "Pengadaan Mebel Sekolah",
    total_pagu: "1200000000.00",
    total_pagu_pengadaan: "1200000000.00",
    total_pagu_non_pengadaan: "0.00",
    total_kebutuhan_anggaran: "950000000.00",
    sisa_pagu_pengadaan: "250000000.00",
  },
  standar_harga: [
    {
      id_sipd_penetapan: 14205,
      kode_rekening: "5.1.02.01.01.0024",
      nama_rekening: "Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor",
      kode_standar_harga: "1.1.7.01.01.01.001",
      nama_standar_harga: "Kertas HVS A4 80gr",
      kode_sumber_dana: "1.02.01",
      nama_sumber_dana: "PAD",
      is_belanja_pengadaan: true,
      pagu: "15000000.00",
      total_kebutuhan_anggaran: "12500000.00",
      sisa_pagu: "2500000.00",
    },
    {
      id_sipd_penetapan: 14206,
      kode_rekening: "5.1.02.01.01.0024",
      nama_rekening: "Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor",
      kode_standar_harga: "1.1.7.01.01.01.002",
      nama_standar_harga: "Pulpen Standard AE7",
      kode_sumber_dana: "1.02.01",
      nama_sumber_dana: "PAD",
      is_belanja_pengadaan: true,
      pagu: "5000000.00",
      total_kebutuhan_anggaran: "3000000.00",
      sisa_pagu: "2000000.00",
    },
  ],
}

export async function GET(req: Request) {
  const session = await auth()

  if (!session?.user?.apiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const kodeSubKegiatan =
    searchParams.get("kode_sub_kegiatan") ?? searchParams.get("subkegiatan") ?? ""

  // kode_sub_kegiatan wajib
  if (!kodeSubKegiatan) {
    return NextResponse.json({ error: "Parameter kode_sub_kegiatan wajib diisi" }, { status: 400 })
  }

  // Meneruskan ke backend: GET /api/v1/sipd-penetapan-apbd/modal
  try {
    const params = new URLSearchParams(searchParams)
    // Jika kode_skpd/kode_sub_unit tidak dikirim, isi dari session user login
    if (!params.get("kode_skpd") && !params.get("kode_sub_unit") && session.user.kodeSkpd) {
      params.set("kode_skpd", session.user.kodeSkpd)
    }
    if (!params.get("tahun")) params.set("tahun", "2026")

    const backendUrl = `${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/sipd-penetapan-apbd/modal?${params.toString()}`
    const backendRes = await fetch(backendUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.user.apiToken}`,
      },
      next: { revalidate: 300, tags: ["sipd-modal"] },
    })

    const bodyText = await backendRes.text()

    // Teruskan status error asli (403 Forbidden, 404 Not Found, dll) agar tester melihatnya
    if (!backendRes.ok) {
      return new NextResponse(bodyText, {
        status: backendRes.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    return NextResponse.json(bodyText ? JSON.parse(bodyText) : {})
  } catch {
    // Backend offline: fallback data mock bertanda _mock
    const payload: SipdModalApiResponse = { status: "success", data: MOCK_MODAL, _mock: true }
    return NextResponse.json(payload)
  }
}

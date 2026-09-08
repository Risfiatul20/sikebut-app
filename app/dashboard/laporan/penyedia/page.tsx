import { LaporanPaketView } from "@/components/laporan/laporan-paket-view"

export const metadata = {
  title: "Laporan Penyedia — Sikebut PBJ",
  description: "Daftar & ringkasan paket pengadaan melalui penyedia.",
}

export default function LaporanPenyediaPage() {
  return (
    <LaporanPaketView
      jenis="penyedia"
      title="Laporan Pengadaan Penyedia"
      description="Ringkasan dan daftar paket identifikasi kebutuhan dengan cara pengadaan melalui Penyedia."
    />
  )
}
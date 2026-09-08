import { LaporanPaketView } from "@/components/laporan/laporan-paket-view"

export const metadata = {
  title: "Laporan Swakelola — Sikebut PBJ",
  description: "Daftar & ringkasan paket pengadaan swakelola.",
}

export default function LaporanSwakelolaPage() {
  return (
    <LaporanPaketView
      jenis="swakelola"
      title="Laporan Pengadaan Swakelola"
      description="Ringkasan dan daftar paket identifikasi kebutuhan dengan cara pengadaan Swakelola."
    />
  )
}
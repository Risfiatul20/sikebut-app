import { LaporanRincianView } from "@/components/laporan/laporan-rincian-view"

export const metadata = {
  title: "Laporan Swakelola — Sikebut PBJ",
  description: "Rincian paket pengadaan swakelola sesuai template laporan.",
}

export default function LaporanSwakelolaPage() {
  return (
    <LaporanRincianView
      jenis="swakelola"
      title="Laporan Rencana Kebutuhan — Swakelola"
      description="Rincian paket identifikasi kebutuhan dengan cara Swakelola (lokasi, volume, spesifikasi, tipe, jadwal & anggaran)."
    />
  )
}
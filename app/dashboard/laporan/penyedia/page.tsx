import { LaporanRincianView } from "@/components/laporan/laporan-rincian-view"

export const metadata = {
  title: "Laporan Penyedia — Sikebut PBJ",
  description: "Rincian paket pengadaan melalui penyedia sesuai template laporan.",
}

export default function LaporanPenyediaPage() {
  return (
    <LaporanRincianView
      jenis="penyedia"
      title="Laporan Rencana Kebutuhan — Penyedia"
      description="Rincian paket identifikasi kebutuhan dengan cara pengadaan melalui Penyedia (lokasi, volume, spesifikasi, persyaratan, jadwal & anggaran)."
    />
  )
}
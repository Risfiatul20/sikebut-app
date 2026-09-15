import { LaporanPaketTree } from "@/components/laporan/laporan-paket-tree"

export const metadata = {
  title: "Laporan Penyedia — Sikebut PBJ",
  description: "Rincian identifikasi kebutuhan paket pengadaan melalui penyedia.",
}

export default function LaporanPenyediaPage() {
  return (
    <LaporanPaketTree
      jenis="penyedia"
      title="Laporan Rencana Kebutuhan — Penyedia"
      description="Tabel bertingkat OPD › Sub Unit › Program › Kegiatan › Sub Kegiatan › Paket › Rekening, dengan kolom sesuai template Laporan.xlsx (lokasi, volume, uraian, spesifikasi, PDN, SPP, MAK, pagu & jadwal)."
    />
  )
}

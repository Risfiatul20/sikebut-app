import { LaporanPaketTree } from "@/components/laporan/laporan-paket-tree"

export const metadata = {
  title: "Laporan Swakelola — Sikebut PBJ",
  description: "Rincian paket pengadaan swakelola sesuai template laporan.",
}

export default function LaporanSwakelolaPage() {
  return (
    <LaporanPaketTree
      jenis="swakelola"
      title="Laporan Rencana Kebutuhan — Swakelola"
      description="Tabel bertingkat OPD › Sub Unit › Program › Kegiatan › Sub Kegiatan › Paket › Rekening, dengan kolom sesuai template Laporan.xlsx (lokasi, volume, uraian, spesifikasi, tipe, MAK, pagu & jadwal)."
    />
  )
}

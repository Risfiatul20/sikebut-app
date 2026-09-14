import { LaporanPenyediaTreeTable } from "@/components/laporan/laporan-penyedia-tree-table"

export const metadata = {
  title: "Laporan Penyedia — Sikebut PBJ",
  description: "Rincian identifikasi kebutuhan paket pengadaan melalui penyedia.",
}

export default function LaporanPenyediaPage() {
  return <LaporanPenyediaTreeTable />
}

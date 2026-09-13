import { LaporanPenyediaTreeTable } from "@/components/laporan/laporan-penyedia-tree-table"

export const metadata = {
  title: "Laporan Penyedia — Sikebut PBJ",
  description: "Rincian paket pengadaan melalui penyedia dalam format hierarki tree table.",
}

export default function LaporanPenyediaPage() {
  return <LaporanPenyediaTreeTable />
}
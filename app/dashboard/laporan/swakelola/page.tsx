import { LaporanSwakelolaTreeTable } from "@/components/laporan/laporan-swakelola-tree-table"

export const metadata = {
  title: "Laporan Swakelola — Sikebut PBJ",
  description: "Rincian paket pengadaan swakelola dalam format hierarki tree table.",
}

export default function LaporanSwakelolaPage() {
  return <LaporanSwakelolaTreeTable />
}

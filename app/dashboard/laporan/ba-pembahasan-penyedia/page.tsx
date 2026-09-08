import { BaPembahasanView } from "@/components/laporan/ba-pembahasan-view"

export const metadata = {
  title: "BA Pembahasan Penyedia — Sikebut PBJ",
  description: "Berita Acara pembahasan paket pengadaan penyedia.",
}

export default function BaPembahasanPenyediaPage() {
  return (
    <BaPembahasanView
      jenis="ba-pembahasan-penyedia"
      cara="Penyedia"
      judul="Berita Acara Pembahasan — Penyedia"
    />
  )
}
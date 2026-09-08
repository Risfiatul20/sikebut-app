import { BaPembahasanView } from "@/components/laporan/ba-pembahasan-view"

export const metadata = {
  title: "BA Pembahasan Swakelola — Sikebut PBJ",
  description: "Berita Acara pembahasan paket pengadaan swakelola.",
}

export default function BaPembahasanSwakelolaPage() {
  return (
    <BaPembahasanView
      jenis="ba-pembahasan-swakelola"
      cara="Swakelola"
      judul="Berita Acara Pembahasan — Swakelola"
    />
  )
}
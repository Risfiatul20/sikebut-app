import { BaHasilView } from "@/components/laporan/ba-hasil-view"

export const metadata = {
  title: "BA Penetapan Kebutuhan — Sikebut PBJ",
  description: "Berita Acara penetapan kebutuhan (paket disetujui).",
}

export default function BaPenetapanPage() {
  return (
    <BaHasilView
      jenis="ba-penetapan"
      jenisLabel="penetapan"
      judul="Berita Acara Penetapan Kebutuhan"
      deskripsi="Daftar final paket yang telah disetujui untuk ditetapkan sebagai kebutuhan — dapat dicetak dan diekspor."
    />
  )
}

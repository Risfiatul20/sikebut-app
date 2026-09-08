import { BaRkbmdView } from "@/components/laporan/ba-rkbmd-view"

export const metadata = {
  title: "BA Catatan RKBMD Pemeliharaan — Sikebut PBJ",
  description: "Berita Acara catatan RKBMD pemeliharaan.",
}

export default function BaRkbmdPemeliharaanPage() {
  return (
    <BaRkbmdView
      jenis="ba-rkbmd-pemeliharaan"
      tipe="Pemeliharaan"
      judul="Berita Acara Catatan RKBMD — Pemeliharaan"
      deskripsi="Catatan resmi rencana kebutuhan barang pada data RKBMD Pemeliharaan (dapat dicetak)."
    />
  )
}
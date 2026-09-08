import { BaRkbmdView } from "@/components/laporan/ba-rkbmd-view"

export const metadata = {
  title: "BA Catatan RKBMD Pengadaan — Sikebut PBJ",
  description: "Berita Acara catatan RKBMD pengadaan.",
}

export default function BaRkbmdPengadaanPage() {
  return (
    <BaRkbmdView
      jenis="ba-rkbmd-pengadaan"
      tipe="Pengadaan"
      judul="Berita Acara Catatan RKBMD — Pengadaan"
      deskripsi="Catatan resmi rencana kebutuhan barang pada data RKBMD Pengadaan (dapat dicetak)."
    />
  )
}
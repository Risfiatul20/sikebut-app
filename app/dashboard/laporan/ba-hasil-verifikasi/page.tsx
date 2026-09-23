import { BaHasilView } from "@/components/laporan/ba-hasil-view"

export const metadata = {
  title: "BA Hasil Verifikasi & Validasi — Sikebut PBJ",
  description: "Berita Acara hasil verifikasi dan validasi kebutuhan.",
}

export default function BaHasilVerifikasiPage() {
  return (
    <BaHasilView
      jenis="ba-hasil-verifikasi"
      jenisLabel="hasil-verifikasi"
      judul="Berita Acara Hasil Verifikasi & Validasi Kebutuhan"
      deskripsi="Keputusan verifikator per paket beserta catatan verifikasi — dapat dicetak dan diekspor."
    />
  )
}

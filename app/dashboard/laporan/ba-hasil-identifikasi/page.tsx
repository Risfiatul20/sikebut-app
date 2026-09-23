import { BaHasilView } from "@/components/laporan/ba-hasil-view"

export const metadata = {
  title: "BA Hasil Identifikasi Kebutuhan — Sikebut PBJ",
  description: "Berita Acara hasil identifikasi kebutuhan pengadaan.",
}

export default function BaHasilIdentifikasiPage() {
  return (
    <BaHasilView
      jenis="ba-hasil-identifikasi"
      jenisLabel="hasil-identifikasi"
      judul="Berita Acara Hasil Identifikasi Kebutuhan"
      deskripsi="Daftar paket hasil pengisian formulir identifikasi kebutuhan (Diajukan, Disetujui, Perlu Perbaikan) — dapat dicetak dan diekspor."
    />
  )
}

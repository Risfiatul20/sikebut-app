import { SipdItem } from "@/types/sipd"

export interface ProgramRef {
  kode_program: string
  nama_program: string
  kode_bidang_urusan: string
  nama_bidang_urusan: string
}

export interface KegiatanRef {
  kode_kegiatan: string
  nama_kegiatan: string
  kode_program: string
}

export interface SubKegiatanRef {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  kode_kegiatan: string
}

export const MOCK_PROGRAMS: ProgramRef[] = [
  { kode_program: "1.03.02", nama_program: "Program Penyelenggaraan Jalan", kode_bidang_urusan: "1.03", nama_bidang_urusan: "Pekerjaan Umum dan Penataan Ruang" },
  { kode_program: "1.03.03", nama_program: "Program Pengelolaan Gedung dan Bangunan", kode_bidang_urusan: "1.03", nama_bidang_urusan: "Pekerjaan Umum dan Penataan Ruang" },
  { kode_program: "1.02.03", nama_program: "Program Sediaan Farmasi dan Alat Kesehatan", kode_bidang_urusan: "1.02", nama_bidang_urusan: "Kesehatan" },
  { kode_program: "1.01.02", nama_program: "Program Pengelolaan Pendidikan Dasar", kode_bidang_urusan: "1.01", nama_bidang_urusan: "Pendidikan" },
  { kode_program: "2.16.02", nama_program: "Program Aplikasi Informatika dan E-Government", kode_bidang_urusan: "2.16", nama_bidang_urusan: "Komunikasi dan Informatika" },
]

export const MOCK_KEGIATAN: KegiatanRef[] = [
  { kode_kegiatan: "1.03.02.1.01", nama_kegiatan: "Penyelenggaraan Jalan Kabupaten/Kota", kode_program: "1.03.02" },
  { kode_kegiatan: "1.03.03.1.01", nama_kegiatan: "Penyelenggaraan Bangunan Gedung", kode_program: "1.03.03" },
  { kode_kegiatan: "1.02.03.1.01", nama_kegiatan: "Pengadaan Sediaan Farmasi dan BMHP", kode_program: "1.02.03" },
  { kode_kegiatan: "1.02.03.1.02", nama_kegiatan: "Pengadaan Alat Kesehatan", kode_program: "1.02.03" },
  { kode_kegiatan: "1.01.02.1.01", nama_kegiatan: "Pengelolaan Pendidikan Sekolah Dasar", kode_program: "1.01.02" },
  { kode_kegiatan: "2.16.02.1.01", nama_kegiatan: "Pengelolaan Pusat Data dan Infrastruktur SPBE", kode_program: "2.16.02" },
]

export const MOCK_SUB_KEGIATAN_LIST: SubKegiatanRef[] = [
  { kode_sub_kegiatan: "1.03.02.1.01.0003", nama_sub_kegiatan: "Rekonstruksi Jalan Ruas Godean - Seyegan", kode_kegiatan: "1.03.02.1.01" },
  { kode_sub_kegiatan: "1.03.02.1.01.0004", nama_sub_kegiatan: "Rehabilitasi Jembatan Kali Bedog", kode_kegiatan: "1.03.02.1.01" },
  { kode_sub_kegiatan: "1.03.03.1.01.0002", nama_sub_kegiatan: "Pembangunan Gedung Kantor Pelayanan Terpadu", kode_kegiatan: "1.03.03.1.01" },
  { kode_sub_kegiatan: "1.02.03.1.01.0002", nama_sub_kegiatan: "Pengadaan Obat Esensial dan Vaksin 25 Puskesmas", kode_kegiatan: "1.02.03.1.01" },
  { kode_sub_kegiatan: "1.02.03.1.02.0001", nama_sub_kegiatan: "Pengadaan USG 4 Dimensi dan Monitor Bedside RSUD", kode_kegiatan: "1.02.03.1.02" },
  { kode_sub_kegiatan: "1.01.02.1.01.0003", nama_sub_kegiatan: "Penyediaan Sarana Prasarana dan Meubilair SD Negeri", kode_kegiatan: "1.01.02.1.01" },
  { kode_sub_kegiatan: "2.16.02.1.01.0001", nama_sub_kegiatan: "Pengembangan Infrastruktur Jaringan & Server Data Center", kode_kegiatan: "2.16.02.1.01" },
]

export function getMockSipdBySubKegiatan(kode_sub_kegiatan: string, items: SipdItem[]): SipdItem[] {
  return items.filter((it) => it.kode_sub_kegiatan === kode_sub_kegiatan)
}

export function getInitialFormData(tipe: string) {
  const base = {
    nama_paket: "",
    volume: 1,
    volume_satuan: "Unit" as const,
    pdn: "Ya" as const,
    usaha_kecil: "Tidak" as const,
    pra_dpa: "Tidak" as const,
    spp_ekonomi: "Tidak" as const,
    spp_sosial: "Tidak" as const,
    spp_lingkungan: "Tidak" as const,
    lokasi: [] as Array<Record<string, string>>,
    sumber_dana: "DAU",
  }

  switch (tipe) {
    case "Barang":
      return {
        ...base,
        fungsi_kegunaan: "",
        uraian: "",
        spesifikasi: "",
        waktu_pemanfaatan_awal: "",
        waktu_pemanfaatan_akhir: "",
        waktu_pemilihan_awal: "",
        waktu_pemilihan_akhir: "",
        waktu_pelaksanaan_kontrak_awal: "",
        waktu_pelaksanaan_kontrak_akhir: "",
        waktu_pelaksanaan_pekerjaan_awal: "",
        waktu_pelaksanaan_pekerjaan_akhir: "",
        metode_pengadaan: "",
        tersedia_ekatalog: "Tidak" as const,
        jumlah_dibutuhkan: 0,
        jumlah_sejenis: 0,
        kondisi_baik: 0,
        kondisi_rusak_ringan: 0,
        kondisi_rusak_berat: 0,
        mudah_pasaran: "Ya" as const,
        produsen: "Banyak" as const,
        kriteria_barang: [] as string[],
        persyaratan_tkdn: "Tidak" as const,
        nilai_tkdn: 0,
        cara_pengiriman: "",
        cara_operasi: "Manual" as const,
        pelatihan: "Tidak" as const,
        spp_lanjutan: [] as string[],
        pengadaan_sejenis: "Tidak" as const,
        indikasi_konsolidasi: "Tidak" as const,
      }
    case "Konstruksi":
      return {
        ...base,
        fungsi: "",
        target_sasaran: "",
        uraian: "",
        spesifikasi: "",
        waktu_pemanfaatan_awal: "",
        waktu_pemanfaatan_akhir: "",
        waktu_pemilihan_awal: "",
        waktu_pemilihan_akhir: "",
        waktu_pelaksanaan_kontrak_awal: "",
        waktu_pelaksanaan_kontrak_akhir: "",
        waktu_pelaksanaan_pekerjaan_awal: "",
        waktu_pelaksanaan_pekerjaan_akhir: "",
        metode_pengadaan: "",
        tersedia_ekatalog_produk: "Tidak" as const,
        tersedia_ekatalog_material: "Tidak" as const,
        penggunaan_barang_dn: 100,
        penggunaan_barang_ln: 0,
        prioritas: "",
        studi_kelayakan: "Ya" as const,
        dokumen_ded: "Belum" as const,
        kompleksitas: "",
        kontrak_tahun_jamak: "Tidak" as const,
        jumlah_tahun_jamak: 1,
        izin_kontrak_jamak: "Tidak" as const,
        nomor_izin_jamak: "",
        usaha_kecil_dapat: "Ya" as const,
        pembebasan_lahan: "Tidak" as const,
        luas_lahan: 0,
        izin_pemanfaatan_tanah: "Tidak" as const,
        lama_pengurusan_lahan: 0,
        status_pembayaran_ganti_rugi: "Tidak" as const,
        pengadaan_sejenis: "Tidak" as const,
        indikasi_konsolidasi: "Tidak" as const,
      }
    case "Jasa Lainnya":
      return {
        ...base,
        kebutuhan_rutin: "Tidak" as const,
        fungsi_kegunaan: "",
        kompetensi_teknis: "",
        sumberdaya_dimiliki: "",
        jumlah_pelaku: "Banyak" as const,
        uraian: "",
        spesifikasi: "",
        waktu_pemanfaatan_awal: "",
        waktu_pemanfaatan_akhir: "",
        waktu_pemilihan_awal: "",
        waktu_pemilihan_akhir: "",
        waktu_pelaksanaan_kontrak_awal: "",
        waktu_pelaksanaan_kontrak_akhir: "",
        waktu_pelaksanaan_pekerjaan_awal: "",
        waktu_pelaksanaan_pekerjaan_akhir: "",
        metode_pengadaan: "",
        tersedia_ekatalog: "Tidak" as const,
        pengadaan_sejenis: "Tidak" as const,
        indikasi_konsolidasi: "Tidak" as const,
      }
    case "Konsultansi":
      return {
        ...base,
        target_sasaran: "",
        uraian: "",
        spesifikasi: "",
        jenis_penyedia: "",
        jumlah_pelaku: "Banyak" as const,
        waktu_pemanfaatan_awal: "",
        waktu_pemanfaatan_akhir: "",
        waktu_pemilihan_awal: "",
        waktu_pemilihan_akhir: "",
        waktu_pelaksanaan_kontrak_awal: "",
        waktu_pelaksanaan_kontrak_akhir: "",
        waktu_pelaksanaan_pekerjaan_awal: "",
        waktu_pelaksanaan_pekerjaan_akhir: "",
        metode_pengadaan: "",
        tersedia_ekatalog: "Tidak" as const,
        pengadaan_sejenis: "Tidak" as const,
        indikasi_konsolidasi: "Tidak" as const,
      }
    case "Swakelola":
      return {
        ...base,
        uraian_pekerjaan: "",
        spesifikasi_pekerjaan: "",
        tipe_swakelola: "",
        waktu_awal: "",
        waktu_akhir: "",
      }
    default:
      return {}
  }
}

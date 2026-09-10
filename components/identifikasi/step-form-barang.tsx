"use client"

import { useMemo, useEffect, useState, type ReactNode } from "react"
import {
  FormBarang,
  LokasiItem,
  YaTidak,
  BanyakTerbatas,
  MetodePengadaan,
  MetodeOperasi,
  RkbmdItemTerpilih,
  RkbmdMode,
  RkbmdPerAnggaran,
  PaguPaketItem,
} from "@/types/identifikasi"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import { RkbmdPickerModal } from "@/components/identifikasi/rkbmd-picker-modal"
import { WaktuPicker } from "@/components/identifikasi/waktu-picker"
import { useWilayah } from "@/hooks/useWilayah"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  Package,
  MapPin,
  Calendar,
  Layers,
  Banknote,
  Search,
  FileCheck,
  ClipboardList,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormBarang
  onChange: (data: FormBarang) => void
  kodeSubKegiatan?: string
  kodeSkpd?: string
  /** ID identifikasi saat mode edit — riwayat "Diisi" usulan ini dikecualikan. */
  identifikasiId?: number | null
  onOpenPagu?: () => void
  totalPagu?: number
  /** Item Pagu Paket terpilih — acuan pertanyaan RKBMD per kode rekening. */
  anggaran: PaguPaketItem[]
  /** Key field yang kosong (validasi) — sorot merah + "Wajib diisi". */
  missing?: string[]
}

const VOLUME_SATUAN_OPTIONS = ["Unit", "Paket", "Set", "Pcs", "Lot"] as const
const YA_TIDAK_OPTIONS: YaTidak[] = ["Ya", "Tidak"]
const KRITERIA_BARANG_OPTIONS = ["PDN", "Barang Impor", "Pabrikan", "Produksi Manual", "Kerajinan Tangan"]
const SPP_LANJUTAN_OPTIONS = ["Ekonomi", "Sosial", "Lingkungan"]
const PRODUSEN_OPTIONS: BanyakTerbatas[] = ["Banyak", "Terbatas"]
const CARA_OPERASI_OPTIONS: MetodeOperasi[] = ["Otomatis", "Manual"]

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function toggleArrayItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
}

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v)
}

const labelCls = "block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
const inputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
const selectCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors truncate"
const smallInputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
const readonlyInputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 px-3 py-2 text-xs cursor-not-allowed"

function YaTidakSelect({
  label,
  value,
  onChange,
  error,
  errText,
  note,
}: {
  label: string
  value: YaTidak
  onChange: (v: YaTidak) => void
  error?: boolean
  errText?: ReactNode
  note?: string | null
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as YaTidak)}
        className={`${selectCls}${error ? " border-rose-400 dark:border-rose-500/70 ring-1 ring-rose-400/40" : ""}`}
      >
        <option value="">-- Pilih --</option>
        {YA_TIDAK_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {errText}
      <FieldCatatanBadge note={note} />
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Package; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>
    </div>
  )
}

function LokasiRow({
  lokasi,
  index,
  onUpdate,
  onRemove,
}: {
  lokasi: LokasiItem
  index: number
  onUpdate: (index: number, updated: LokasiItem) => void
  onRemove: (index: number) => void
}) {
  const {
    provinsiList,
    kabupatenList,
    kecamatanList,
    loading,
    loadProvinsi,
    loadKabupaten,
    loadKecamatan,
  } = useWilayah()

  
  // Pre-load provinsi + kabupaten & kecamatan saat mount (mode edit): nilai tersimpan
  // langsung tampil tanpa harus diklik dulu (sebelumnya provinsiList hanya dimuat onFocus).
  useEffect(() => {
    loadProvinsi()
    if (lokasi.provinsiCode) {
      loadKabupaten(lokasi.provinsiCode)
      if (lokasi.kabupatenCode) {
        loadKecamatan(lokasi.kabupatenCode)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleProvinsiChange = (code: string) => {
    const prov = provinsiList.find((p) => p.code === code)
    onUpdate(index, {
      ...lokasi,
      provinsiCode: code,
      provinsi: prov?.name || "",
      kabupatenCode: "",
      kabupaten: "",
      kecamatanCode: "",
      kecamatan: "",
    })
    loadKabupaten(code)
  }

  const handleKabupatenChange = (code: string) => {
    const kab = kabupatenList.find((k) => k.code === code)
    onUpdate(index, {
      ...lokasi,
      kabupatenCode: code,
      kabupaten: kab?.name || "",
      kecamatanCode: "",
      kecamatan: "",
    })
    loadKecamatan(code)
  }

  const handleKecamatanChange = (code: string) => {
    const kec = kecamatanList.find((k) => k.code === code)
    onUpdate(index, {
      ...lokasi,
      kecamatanCode: code,
      kecamatan: kec?.name || "",
    })
  }

  return (
    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Lokasi {index + 1}
        </span>
        {index > 0 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            Provinsi
          </label>
          <div className="relative">
            <select
              value={lokasi.provinsiCode}
              onChange={(e) => handleProvinsiChange(e.target.value)}
              onFocus={loadProvinsi}
              className={smallInputCls + " pr-6"}
            >
              <option value="">-- Pilih --</option>
              {provinsiList.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
          {loading.provinsi && (
            <span className="text-[9px] text-blue-500 animate-pulse">Memuat...</span>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            Kab/Kota
          </label>
          <div className="relative">
            <select
              value={lokasi.kabupatenCode}
              onChange={(e) => handleKabupatenChange(e.target.value)}
              disabled={!lokasi.provinsiCode}
              className={smallInputCls + " pr-6 disabled:opacity-50"}
            >
              <option value="">-- Pilih --</option>
              {kabupatenList.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
          {loading.kabupaten && (
            <span className="text-[9px] text-blue-500 animate-pulse">Memuat...</span>
          )}
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            Kecamatan
          </label>
          <div className="relative">
            <select
              value={lokasi.kecamatanCode}
              onChange={(e) => handleKecamatanChange(e.target.value)}
              disabled={!lokasi.kabupatenCode}
              className={smallInputCls + " pr-6 disabled:opacity-50"}
            >
              <option value="">-- Pilih --</option>
              {kecamatanList.map((k) => (
                <option key={k.code} value={k.code}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
          </div>
          {loading.kecamatan && (
            <span className="text-[9px] text-blue-500 animate-pulse">Memuat...</span>
          )}
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
          Detail Alamat
        </label>
        <input
          type="text"
          value={lokasi.detail}
          onChange={(e) => onUpdate(index, { ...lokasi, detail: e.target.value })}
          placeholder="Alamat detail / nama gedung / RT RW"
          className={smallInputCls}
        />
      </div>
    </div>
  )
}

export function StepFormBarang({ data, onChange, catatanReviewerDetail, kodeSubKegiatan, kodeSkpd, identifikasiId, onOpenPagu, totalPagu, anggaran, missing = [] }: Props) {
  const [isRkbmdPickerOpen, setIsRkbmdPickerOpen] = useState(false)
  const [rkbmdBlocked, setRkbmdBlocked] = useState(false)
  const sumberDanaOptions: SearchableSelectOption[] = [
    { value: "DAU", label: "Dana Alokasi Umum (DAU)" },
    { value: "DAK-FISIK", label: "Dana Alokasi Khusus (DAK) Fisik" },
    { value: "DAK-NONFISIK", label: "Dana Alokasi Khusus (DAK) Non-Fisik" },
    { value: "DBH", label: "Dana Bagi Hasil (DBH)" },
    { value: "DBH-CHT", label: "Dana Bagi Hasil Cukai Hasil Tembakau (DBH-CHT)" },
    { value: "PAD", label: "Pendapatan Asli Daerah (PAD)" },
    { value: "BLUD", label: "Badan Layanan Umum Daerah (BLUD)" },
  ]

  // Metode pemilihan penyedia untuk Barang (Perpres PBJ): tender, pengadaan langsung, dll.
  const metodePengadaanOptions: SearchableSelectOption[] = [
    { value: "Tender", label: "Tender" },
    { value: "Tender Cepat", label: "Tender Cepat" },
    { value: "Pengadaan Langsung", label: "Pengadaan Langsung" },
    { value: "Penunjukan Langsung", label: "Penunjukan Langsung" },
    { value: "ePurchasing", label: "ePurchasing" },
  ]

  const update = useMemo(() => {
    return <K extends keyof FormBarang>(field: K, value: FormBarang[K]) => {
      onChange({ ...data, [field]: value })
    }
  }, [data, onChange])

  const updateLokasi = (index: number, updated: LokasiItem) => {
    const next = [...data.lokasi]
    next[index] = updated
    onChange({ ...data, lokasi: next })
  }

  const addLokasi = () => {
    onChange({
      ...data,
      lokasi: [
        ...data.lokasi,
        {
          id: uid(),
          provinsi: "",
          provinsiCode: "",
          kabupaten: "",
          kabupatenCode: "",
          kecamatan: "",
          kecamatanCode: "",
          detail: "",
        },
      ],
    })
  }

  const removeLokasi = (index: number) => {
    onChange({ ...data, lokasi: data.lokasi.filter((_, i) => i !== index) })
  }

  /** Hitung ringkasan skalar (jumlah dibutuhkan/sejenis/kondisi) dari daftar item.
   *  Arahan atasan: kondisi B/RR/RB otomatis dari tabel master rkbmd_kebutuhan;
   *  "Jumlah Barang Sejenis Tersedia" = total Baik + Rusak Ringan + Rusak Berat. */
  const summarizeItems = (items: RkbmdItemTerpilih[]) => {
    const pengadaan = items.filter((i) => i.sumber === "pengadaan")
    const pemeliharaan = items.filter((i) => i.sumber === "pemeliharaan")
    const kondisi_baik = pemeliharaan.reduce((s, i) => s + (i.kondisi_b ?? 0), 0)
    const kondisi_rusak_ringan = pemeliharaan.reduce((s, i) => s + (i.kondisi_rr ?? 0), 0)
    const kondisi_rusak_berat = pemeliharaan.reduce((s, i) => s + (i.kondisi_rb ?? 0), 0)
    return {
      jumlah_dibutuhkan: pengadaan.reduce((s, i) => s + (i.jumlah || 0), 0),
      jumlah_sejenis: kondisi_baik + kondisi_rusak_ringan + kondisi_rusak_berat,
      kondisi_baik,
      kondisi_rusak_ringan,
      kondisi_rusak_berat,
    }
  }

  /** Terapkan jawaban RKBMD PER ITEM pagu paket (arahan: RKBMD mengikuti kode rekening). */
  const applyRkbmdPerAnggaran = (per: RkbmdPerAnggaran[]) => {
    const allItems = per.flatMap((p) => p.items ?? [])
    // Agregat untuk kompatibilitas tampilan lama (rkbmd_mode + rkbmd_items)
    const aktif = per.find((p) => p.mode === "rencana" || p.mode === "aset")
    const semuaTidakButuh = per.length > 0 && per.every((p) => p.mode === "tidak_butuh")
    const semuaTidakTersedia = per.length > 0 && per.every((p) => p.mode === "tidak_tersedia")
    const modeAgg: RkbmdMode | "" = aktif
      ? (aktif.mode === "aset" ? "pemeliharaan" : "pengadaan")
      : semuaTidakButuh
        ? "tidak_butuh"
        : semuaTidakTersedia
          ? "tidak_tersedia"
          : ""
    onChange({
      ...data,
      rkbmd_per_anggaran: per,
      rkbmd_items: allItems,
      rkbmd_mode: modeAgg,
      ...summarizeItems(allItems),
    })
  }

  const removeRkbmdItem = (id: string) => {
    const per = (data.rkbmd_per_anggaran ?? []).map((p) => ({
      ...p,
      items: p.items.filter((i) => i.id !== id),
    }))
    applyRkbmdPerAnggaran(per)
  }

  /** Buka modal RKBMD — wajib pilih Pagu Paket dulu (RKBMD mengikuti kode rekening). */
  const handleOpenRkbmd = () => {
    if (!anggaran || anggaran.length === 0) {
      setRkbmdBlocked(true)
      return
    }
    setRkbmdBlocked(false)
    setIsRkbmdPickerOpen(true)
  }

  // Field manual (Jumlah Dibutuhkan / Sejenis / Kondisi) hanya tampil jika ada
  // jawaban RKBMD Pengadaan/Pemeliharaan (rencana/aset). Jika jawaban Tidak Butuh /
  // Tidak Tersedia → disembunyikan. Belum ada jawaban sama sekali → tetap tampil.
  const perAnggaran = data.rkbmd_per_anggaran ?? []
  const rkbmdAdaBarang = perAnggaran.some(
    (p) => p.mode === "rencana" || p.mode === "aset"
  )
  const showRkbmdManual = rkbmdAdaBarang || perAnggaran.length === 0

  // Validasi per-field: key yang kosong → border merah + pesan "Wajib diisi"
  const missingSet = new Set(missing || [])
  const isMiss = (k: string) => missingSet.has(k)
  const errCls = (k: string, base: string) =>
    isMiss(k) ? `${base} border-rose-400 dark:border-rose-500/70 ring-1 ring-rose-400/40` : base
  const errNote = (k: string) =>
    isMiss(k) ? (
      <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-3 w-3 shrink-0" /> Wajib diisi
      </p>
    ) : null

  return (
    <div className="space-y-6">
      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Informasi Paket ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Package} title="Informasi Paket" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Nama Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nama_paket}
              onChange={(e) => update("nama_paket", e.target.value)}
              placeholder="Contoh: Pengadaan Laptop Operasional"
                            className={errCls("nama_paket", inputCls)}
            />
            {errNote("nama_paket")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["nama_paket"]} />
          </div>
          <div>
            <label className={labelCls}>Fungsi / Kegunaan</label>
            <input
              type="text"
              value={data.fungsi_kegunaan}
              onChange={(e) => update("fungsi_kegunaan", e.target.value)}
              placeholder="Fungsi barang"
              className={errCls("fungsi_kegunaan", inputCls)}
            />
            {errNote("fungsi_kegunaan")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["fungsi_kegunaan"]} />
          </div>
          <div>
            <label className={labelCls}>Volume</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={data.volume || ""}
                onChange={(e) => update("volume", Number(e.target.value))}
                className={errCls("volume", inputCls)}
              />
              <select
                value={data.volume_satuan}
                onChange={(e) => update("volume_satuan", e.target.value as FormBarang["volume_satuan"])}
                className={selectCls + " w-28"}
              >
                {VOLUME_SATUAN_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <FieldCatatanBadge note={catatanReviewerDetail?.["volume"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian Pekerjaan</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian kebutuhan barang"
              className={errCls("uraian", inputCls + " resize-none")}
            />
            {errNote("uraian")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["uraian"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Spesifikasi Pekerjaan</label>
            <textarea
              rows={3}
              value={data.spesifikasi}
              onChange={(e) => update("spesifikasi", e.target.value)}
              placeholder="Spesifikasi teknis barang"
              className={errCls("spesifikasi", inputCls + " resize-none")}
            />
            {errNote("spesifikasi")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["spesifikasi"]} />
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Volume & Persyaratan Dasar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Layers} title="Volume & Persyaratan Dasar" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YaTidakSelect label="PDN" value={data.pdn} onChange={(v) => update("pdn", v)} note={catatanReviewerDetail?.["pdn"]} />
          <YaTidakSelect label="Usaha Kecil" value={data.usaha_kecil} onChange={(v) => update("usaha_kecil", v)} note={catatanReviewerDetail?.["usaha_kecil"]} />
          <YaTidakSelect label="Pra DPA" value={data.pra_dpa} onChange={(v) => update("pra_dpa", v)} note={catatanReviewerDetail?.["pra_dpa"]} />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SPP (Sustainable Public Procurement) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={FileCheck} title="SPP (Sustainable Public Procurement)" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YaTidakSelect
            label="Ekonomi"
            value={data.spp_ekonomi}
            onChange={(v) => update("spp_ekonomi", v)}
            note={catatanReviewerDetail?.["spp_ekonomi"]}
          />
          <YaTidakSelect
            label="Sosial"
            value={data.spp_sosial}
            onChange={(v) => update("spp_sosial", v)}
            note={catatanReviewerDetail?.["spp_sosial"]}
          />
          <YaTidakSelect
            label="Lingkungan"
            value={data.spp_lingkungan}
            onChange={(v) => update("spp_lingkungan", v)}
            note={catatanReviewerDetail?.["spp_lingkungan"]}
          />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Lokasi (Multi-Lokasi) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${isMiss("lokasi") ? "border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-800"}`}>
        <SectionHeader icon={MapPin} title="Lokasi (Multi-Lokasi)" />
        {errNote("lokasi")}
        <FieldCatatanBadge note={catatanReviewerDetail?.["lokasi"]} />
        <div className="space-y-3">
          {data.lokasi.map((lokasi, i) => (
            <LokasiRow
              key={lokasi.id}
              lokasi={lokasi}
              index={i}
              onUpdate={updateLokasi}
              onRemove={removeLokasi}
            />
          ))}
          <button
            type="button"
            onClick={addLokasi}
            className="w-full p-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-[11px] font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Lokasi
          </button>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Waktu ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${["waktu_pemanfaatan_awal", "waktu_pemilihan_awal", "waktu_pelaksanaan_kontrak_awal"].some((k) => isMiss(k)) ? "border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-800"}`}>
        <SectionHeader icon={Calendar} title="Waktu" />
        {["waktu_pemanfaatan_awal", "waktu_pemilihan_awal", "waktu_pelaksanaan_kontrak_awal"].filter((k) => isMiss(k)).map((k) => errNote(k))}
        <div className="space-y-3">
          {[
            { label: "Pemilihan Penyedia", awal: "waktu_pemilihan_awal", akhir: "waktu_pemilihan_akhir", noteKey: "waktu_pemilihan" },
            { label: "Pelaksanaan Kontrak", awal: "waktu_pelaksanaan_kontrak_awal", akhir: "waktu_pelaksanaan_kontrak_akhir", noteKey: "waktu_pelaksanaan" },
            { label: "Waktu Pemanfaatan", awal: "waktu_pemanfaatan_awal", akhir: "waktu_pemanfaatan_akhir", noteKey: "waktu_pemanfaatan" },
          ].map((item) => (
            <div key={item.label}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {item.label}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Awal</label>
                  <WaktuPicker
                    value={(data as unknown as Record<string, string>)[item.awal] || ""}
                    onChange={(v) => update(item.awal as keyof FormBarang, v)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Akhir</label>
                  <WaktuPicker
                    value={(data as unknown as Record<string, string>)[item.akhir] || ""}
                    onChange={(v) => update(item.akhir as keyof FormBarang, v)}
                  />
                </div>
              </div>
              <FieldCatatanBadge note={catatanReviewerDetail?.[item.noteKey]} />
            </div>
          ))}
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Metode & e-Katalog ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Search} title="Metode & e-Katalog" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Metode Pengadaan</label>
            <SearchableSelect
              options={metodePengadaanOptions}
              value={data.metode_pengadaan}
              onChange={(val) => update("metode_pengadaan", val as MetodePengadaan)}
              placeholder="-- Pilih Metode --"
              className={errCls("metode_pengadaan", "")}
            />
            {errNote("metode_pengadaan")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["metode_pengadaan"]} />
          </div>
          <YaTidakSelect
            label="Tersedia di e-Katalog LKPP"
            value={data.tersedia_ekatalog}
            onChange={(v) => update("tersedia_ekatalog", v)}
            note={catatanReviewerDetail?.["tersedia_ekatalog"]}
          />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pagu & Anggaran ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Banknote} title="Pagu Paket & Sumber Dana" />
        <div className="space-y-3">
          {onOpenPagu && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onOpenPagu}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
              >
                <Banknote className="h-3.5 w-3.5" />
                {totalPagu && totalPagu > 0 ? "Ubah Pemilihan Pagu Paket" : "Atur Pagu Anggaran"}
              </button>
              {!!totalPagu && totalPagu > 0 && (
                <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800/50">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Total Pagu Paket: </span>
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                    {formatRupiah(totalPagu)}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Sumber Dana</label>
              <SearchableSelect
                options={sumberDanaOptions}
                value={data.sumber_dana}
                onChange={(val) => update("sumber_dana", val)}
                placeholder="-- Pilih Sumber Dana --"
                className={errCls("sumber_dana", "")}
              />
              {errNote("sumber_dana")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["sumber_dana"]} />
            </div>
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Identifikasi Barang Tersedia (RKBMD) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader icon={ClipboardList} title="Identifikasi Barang Tersedia (RKBMD)" />
          <div className="flex items-center gap-2">
            {data.rkbmd_mode && (data.rkbmd_mode === "tidak_butuh" || data.rkbmd_mode === "tidak_tersedia") && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {data.rkbmd_mode === "tidak_butuh" ? "Tidak Butuh RKBMD" : "Tidak Tersedia di RKBMD"}
              </span>
            )}
            {data.rkbmd_items.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {data.rkbmd_items.length} item teridentifikasi
              </span>
            )}
            <button
              type="button"
              onClick={handleOpenRkbmd}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <ClipboardList className="h-3 w-3" /> {data.rkbmd_items.length > 0 ? "Ubah Pilihan RKBMD" : "Ambil dari RKBMD"}
            </button>
          </div>
        </div>
        {rkbmdBlocked && (
          <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Pilih <b>Pagu Paket</b> terlebih dahulu (section <b>"Pagu Paket & Sumber Dana"</b> di atas) —
              pertanyaan RKBMD mengikuti <b>kode rekening</b> dari Pagu Paket.
            </span>
          </div>
        )}
        {(data.rkbmd_per_anggaran ?? []).filter((p) => p.mode).length > 0 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(data.rkbmd_per_anggaran ?? []).filter((p) => p.mode).map((p) => (
              <div key={p.id_sipd_penetapan} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 px-3 py-2">
                <p className="font-mono text-[9px] text-slate-400">{p.kode_rekening}</p>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={p.nama_rekening}>{p.nama_rekening}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.mode === "rencana" ? "Rencana (Pengadaan)" : p.mode === "aset" ? "Aset Dimiliki (Pemeliharaan)" : p.mode === "tidak_butuh" ? "Tidak Butuh RKBMD" : "Tidak Tersedia di RKBMD"}
                  {p.items.length > 0 && <span className="font-mono"> · {p.items.length} barang</span>}
                </p>
              </div>
            ))}
          </div>
        )}
        {data.rkbmd_items.length > 0 && (
          <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-[10px] uppercase text-slate-400">
                  <th className="font-semibold px-3 py-2 text-left">Nama Barang</th>
                  <th className="font-semibold px-3 py-2 text-left">Sumber</th>
                  <th className="font-semibold px-3 py-2 text-right">Jumlah</th>
                  <th className="font-semibold px-3 py-2 text-right">Kondisi (B/RR/RB)</th>
                  <th className="font-semibold px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.rkbmd_items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{it.nama_barang}</p>
                      {it.kode_fikasi && <p className="font-mono text-[9px] text-slate-400 mt-0.5">{it.kode_fikasi}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${it.sumber === "pengadaan" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" : "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"}`}>
                        {it.sumber === "pengadaan" ? "Rencana Pengadaan" : "Aset Dimiliki"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-slate-700 dark:text-slate-200">
                      {it.jumlah.toLocaleString("id-ID")} {it.satuan}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {it.sumber === "pemeliharaan"
                        ? `${it.kondisi_b ?? 0} / ${it.kondisi_rr ?? 0} / ${it.kondisi_rb ?? 0}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRkbmdItem(it.id)}
                        className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[9px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )        }
        <FieldCatatanBadge note={catatanReviewerDetail?.["rkbmd_items"]} />
        {showRkbmdManual && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jumlah Barang yang Dibutuhkan</label>
              <input
                type="number"
                min={0}
                readOnly
                value={data.jumlah_dibutuhkan || 0}
                className={readonlyInputCls}
              />
              <p className="mt-1 text-[9px] text-slate-400">Otomatis dari RKBMD (total Jumlah Pengadaan)</p>
              <FieldCatatanBadge note={catatanReviewerDetail?.["jumlah_dibutuhkan"]} />
            </div>
            <div>
              <label className={labelCls}>Jumlah Barang Sejenis Tersedia</label>
              <input
                type="number"
                min={0}
                readOnly
                value={data.jumlah_sejenis || 0}
                className={readonlyInputCls}
              />
              <p className="mt-1 text-[9px] text-slate-400">Otomatis = Baik + Rusak Ringan + Rusak Berat</p>
              <FieldCatatanBadge note={catatanReviewerDetail?.["jumlah_sejenis"]} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Baik</label>
              <input
                type="number"
                min={0}
                readOnly
                value={data.kondisi_baik || 0}
                className={readonlyInputCls}
              />
              <p className="mt-1 text-[9px] text-slate-400">Otomatis dari RKBMD</p>
              <FieldCatatanBadge note={catatanReviewerDetail?.["kondisi_baik"]} />
            </div>
            <div>
              <label className={labelCls}>Rusak Ringan</label>
              <input
                type="number"
                min={0}
                readOnly
                value={data.kondisi_rusak_ringan || 0}
                className={readonlyInputCls}
              />
              <p className="mt-1 text-[9px] text-slate-400">Otomatis dari RKBMD</p>
              <FieldCatatanBadge note={catatanReviewerDetail?.["kondisi_rusak_ringan"]} />
            </div>
            <div>
              <label className={labelCls}>Rusak Berat</label>
              <input
                type="number"
                min={0}
                readOnly
                value={data.kondisi_rusak_berat || 0}
                className={readonlyInputCls}
              />
              <p className="mt-1 text-[9px] text-slate-400">Otomatis dari RKBMD</p>
              <FieldCatatanBadge note={catatanReviewerDetail?.["kondisi_rusak_berat"]} />
            </div>
          </div>
        </div>
        )}
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Kriteria & TKDN ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={FileCheck} title="Pasar & TKDN" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Mudah Diperoleh di Pasaran Indonesia"
              value={data.mudah_pasaran}
              onChange={(v) => update("mudah_pasaran", v)}
              note={catatanReviewerDetail?.["mudah_pasaran"]}
            />
            <div>
              <label className={labelCls}>Produsen/Pelaku Usaha Mampu & Memenuhi Syarat</label>
              <select
                value={data.produsen}
                onChange={(e) => update("produsen", e.target.value as BanyakTerbatas)}
                className={selectCls}
              >
                <option value="">-- Pilih --</option>
                {PRODUSEN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <FieldCatatanBadge note={catatanReviewerDetail?.["produsen"]} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Kriteria Barang</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {KRITERIA_BARANG_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                    data.kriteria_barang.includes(opt)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.kriteria_barang.includes(opt)}
                    onChange={() =>
                      update("kriteria_barang", toggleArrayItem(data.kriteria_barang, opt))
                    }
                    className="sr-only"
                  />
                  <span
                    className={`h-3 w-3 rounded border flex items-center justify-center ${
                      data.kriteria_barang.includes(opt)
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {data.kriteria_barang.includes(opt) && (
                      <svg className="h-2 w-2 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {opt}
                </label>
              ))}
            </div>
            <FieldCatatanBadge note={catatanReviewerDetail?.["kriteria_barang"]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Persyaratan Barang Memiliki Nilai TKDN"
              value={data.persyaratan_tkdn}
              onChange={(v) => update("persyaratan_tkdn", v)}
              note={catatanReviewerDetail?.["persyaratan_tkdn"]}
            />
            {data.persyaratan_tkdn === "Ya" && (
              <div>
                <label className={labelCls}>Nilai TKDN (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={data.nilai_tkdn || ""}
                  onChange={(e) => update("nilai_tkdn", Number(e.target.value))}
                  className={inputCls}
                />
                <FieldCatatanBadge note={catatanReviewerDetail?.["nilai_tkdn"]} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Persyaratan Lain ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={ClipboardList} title="Persyaratan Lain" />
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Cara Pengiriman</label>
              <input
                type="text"
                value={data.cara_pengiriman}
                onChange={(e) => update("cara_pengiriman", e.target.value)}
                placeholder="Cara pengiriman barang"
                className={errCls("cara_pengiriman", inputCls)}
              />
              {errNote("cara_pengiriman")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["cara_pengiriman"]} />
            </div>
            <div>
              <label className={labelCls}>Cara Pengangkutan</label>
              <input
                type="text"
                value={data.cara_pengangkutan}
                onChange={(e) => update("cara_pengangkutan", e.target.value)}
                placeholder="Cara pengangkutan barang"
                className={errCls("cara_pengangkutan", inputCls)}
              />
              {errNote("cara_pengangkutan")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["cara_pengangkutan"]} />
            </div>
            <div>
              <label className={labelCls}>Cara Pemasangan</label>
              <input
                type="text"
                value={data.cara_pemasangan}
                onChange={(e) => update("cara_pemasangan", e.target.value)}
                placeholder="Cara pemasangan barang"
                className={errCls("cara_pemasangan", inputCls)}
              />
              {errNote("cara_pemasangan")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["cara_pemasangan"]} />
            </div>
            <div>
              <label className={labelCls}>Cara Penimbunan/Penyimpanan</label>
              <input
                type="text"
                value={data.cara_penimbunan}
                onChange={(e) => update("cara_penimbunan", e.target.value)}
                placeholder="Cara penimbunan/penyimpanan barang"
                className={errCls("cara_penimbunan", inputCls)}
              />
              {errNote("cara_penimbunan")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["cara_penimbunan"]} />
            </div>
            <div>
              <label className={labelCls}>Cara Pengoperasian/Penggunaan</label>
              <select
                value={data.cara_operasi}
                onChange={(e) => update("cara_operasi", e.target.value as MetodeOperasi)}
                className={errCls("cara_operasi", selectCls)}
              >
                <option value="">-- Pilih --</option>
                {CARA_OPERASI_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {errNote("cara_operasi")}
              <FieldCatatanBadge note={catatanReviewerDetail?.["cara_operasi"]} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Kebutuhan Pelatihan Operasional"
              value={data.pelatihan}
              onChange={(v) => update("pelatihan", v)}
              error={isMiss("pelatihan")}
              errText={errNote("pelatihan")}
              note={catatanReviewerDetail?.["pelatihan"]}
            />
          </div>
          <div>
            <label className={labelCls}>Pengadaan Berkelanjutan (SPP Lanjutan)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SPP_LANJUTAN_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                    data.spp_lanjutan.includes(opt)
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={data.spp_lanjutan.includes(opt)}
                    onChange={() =>
                      update("spp_lanjutan", toggleArrayItem(data.spp_lanjutan, opt))
                    }
                    className="sr-only"
                  />
                  <span
                    className={`h-3 w-3 rounded border flex items-center justify-center ${
                      data.spp_lanjutan.includes(opt)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {data.spp_lanjutan.includes(opt) && (
                      <svg className="h-2 w-2 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {opt}
                </label>
              ))}
            </div>
            <FieldCatatanBadge note={catatanReviewerDetail?.["spp_lanjutan"]} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Ada Pengadaan Sejenis di Kegiatan Lain"
              value={data.pengadaan_sejenis}
              onChange={(v) => update("pengadaan_sejenis", v)}
              error={isMiss("pengadaan_sejenis")}
              errText={errNote("pengadaan_sejenis")}
              note={catatanReviewerDetail?.["pengadaan_sejenis"]}
            />
            <YaTidakSelect
              label="Indikasi Konsolidasi Pengadaan"
              value={data.indikasi_konsolidasi}
              onChange={(v) => update("indikasi_konsolidasi", v)}
              error={isMiss("indikasi_konsolidasi")}
              errText={errNote("indikasi_konsolidasi")}
              note={catatanReviewerDetail?.["indikasi_konsolidasi"]}
            />
          </div>
        </div>
      </section>

      {/* Popup Ambil dari RKBMD — pertanyaan PER ITEM Pagu Paket (per kode rekening) */}
      <RkbmdPickerModal
        isOpen={isRkbmdPickerOpen}
        onClose={() => setIsRkbmdPickerOpen(false)}
        kodeSubKegiatan={kodeSubKegiatan || ""}
        kodeSkpd={kodeSkpd}
        anggaran={anggaran}
        currentSelections={data.rkbmd_per_anggaran ?? []}
        identifikasiId={identifikasiId}
        onSelect={applyRkbmdPerAnggaran}
      />
    </div>
  )
}

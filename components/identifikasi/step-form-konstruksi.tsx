"use client"

import { useMemo, useEffect, useState } from "react"
import {
  FormKonstruksi,
  LokasiItem,
  YaTidak,
  Prioritas,
  Kompleksitas,
  MetodePengadaan,
  RkbmdItemTerpilih,
  RkbmdMode,
  RkbmdPerAnggaran,
  PaguPaketItem,
} from "@/types/identifikasi"
import { RkbmdPickerModal } from "@/components/identifikasi/rkbmd-picker-modal"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import { WaktuPicker } from "@/components/identifikasi/waktu-picker"
import { useWilayah } from "@/hooks/useWilayah"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  Building2,
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
  TreePine,
  Link,
  AlertTriangle,
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormKonstruksi
  onChange: (data: FormKonstruksi) => void
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

const VOLUME_SATUAN_OPTIONS = ["Unit", "Paket", "Lot"] as const
const YA_TIDAK_OPTIONS: YaTidak[] = ["Ya", "Tidak"]
const PRIORITAS_OPTIONS: Prioritas[] = ["Tinggi", "Sedang", "Kecil"]
const KOMPLEKSITAS_OPTIONS: Kompleksitas[] = ["Kompleks", "Sederhana"]

function uid() {
  return Math.random().toString(36).slice(2, 10)
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
  note,
}: {
  label: string
  value: YaTidak
  onChange: (v: YaTidak) => void
  note?: string | null
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>      <select value={value} onChange={(e) => onChange(e.target.value as YaTidak)} className={selectCls}>
        <option value="">-- Pilih --</option>
        {YA_TIDAK_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <FieldCatatanBadge note={note} />
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Building2
  title: string
}) {
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

export function StepFormKonstruksi({ data, onChange, catatanReviewerDetail, kodeSubKegiatan, kodeSkpd, identifikasiId, onOpenPagu, totalPagu, anggaran, missing = [] }: Props) {
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

  // Metode pemilihan penyedia untuk Konstruksi (Perpres PBJ): tender, pengadaan langsung, dll.
  const metodePengadaanOptions: SearchableSelectOption[] = [
    { value: "Tender", label: "Tender" },
    { value: "Tender Cepat", label: "Tender Cepat" },
    { value: "Pengadaan Langsung", label: "Pengadaan Langsung" },
    { value: "Penunjukan Langsung", label: "Penunjukan Langsung" },
  ]

  const update = useMemo(() => {
    return <K extends keyof FormKonstruksi>(field: K, value: FormKonstruksi[K]) => {
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Informasi Paket Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Building2} title="Informasi Paket" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Nama Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nama_paket}
              onChange={(e) => update("nama_paket", e.target.value)}
              placeholder="Contoh: Pembangunan Jalan Desa"
              className={errCls("nama_paket", inputCls)}
            />
            {errNote("nama_paket")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["nama_paket"]} />
          </div>
          <div>
            <label className={labelCls}>Fungsi/Kegunaan</label>
            <input
              type="text"
              value={data.fungsi}
              onChange={(e) => update("fungsi", e.target.value)}
              placeholder="Fungsi pekerjaan konstruksi"
              className={errCls("fungsi", inputCls)}
            />
            {errNote("fungsi")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["fungsi"]} />
          </div>
          <div>
            <label className={labelCls}>Target/Sasaran yang Akan Dicapai</label>
            <input
              type="text"
              value={data.target_sasaran}
              onChange={(e) => update("target_sasaran", e.target.value)}
              placeholder="Target sasaran pengguna"
              className={errCls("target_sasaran", inputCls)}
            />
            {errNote("target_sasaran")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["target_sasaran"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian Pekerjaan</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian pekerjaan konstruksi"
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
              placeholder="Spesifikasi teknis pekerjaan konstruksi"
              className={errCls("spesifikasi", inputCls + " resize-none")}
            />
            {errNote("spesifikasi")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["spesifikasi"]} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Volume & Persyaratan Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Layers} title="Volume & Persyaratan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                onChange={(e) =>
                  update("volume_satuan", e.target.value as FormKonstruksi["volume_satuan"])
                }
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
          <div />
          <YaTidakSelect
            label="PDN"
            value={data.pdn}
            onChange={(v) => update("pdn", v)}
            note={catatanReviewerDetail?.["pdn"]}
          />
          <YaTidakSelect
            label="Usaha Kecil"
            value={data.usaha_kecil}
            onChange={(v) => update("usaha_kecil", v)}
            note={catatanReviewerDetail?.["usaha_kecil"]}
          />
          <YaTidakSelect
            label="Pra DPA"
            value={data.pra_dpa}
            onChange={(v) => update("pra_dpa", v)}
            note={catatanReviewerDetail?.["pra_dpa"]}
          />
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ SPP (Sustainable Public Procurement) Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Lokasi (Multi-Lokasi) Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Waktu Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${["waktu_pemanfaatan_awal", "waktu_pemilihan_awal", "waktu_pelaksanaan_kontrak_awal"].some((k) => isMiss(k)) ? "border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-800"}`}>
        <SectionHeader icon={Calendar} title="Waktu" />
        {["waktu_pemanfaatan_awal", "waktu_pemilihan_awal", "waktu_pelaksanaan_kontrak_awal"].filter((k) => isMiss(k)).map((k) => errNote(k))}
        <div className="space-y-3">
          {[
            {
              label: "Pemilihan Penyedia",
              awal: "waktu_pemilihan_awal",
              akhir: "waktu_pemilihan_akhir",
              noteKey: "waktu_pemilihan",
            },
            {
              label: "Pelaksanaan Kontrak",
              awal: "waktu_pelaksanaan_kontrak_awal",
              akhir: "waktu_pelaksanaan_kontrak_akhir",
              noteKey: "waktu_pelaksanaan",
            },
            {
              label: "Waktu Pemanfaatan",
              awal: "waktu_pemanfaatan_awal",
              akhir: "waktu_pemanfaatan_akhir",
              noteKey: "waktu_pemanfaatan",
            },
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
                    onChange={(v) => update(item.awal as keyof FormKonstruksi, v)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Akhir</label>
                  <WaktuPicker
                    value={(data as unknown as Record<string, string>)[item.akhir] || ""}
                    onChange={(v) => update(item.akhir as keyof FormKonstruksi, v)}
                  />
                </div>
              </div>
              <FieldCatatanBadge note={catatanReviewerDetail?.[item.noteKey]} />
            </div>
          ))}
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Metode & e-Katalog Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
            label="Produk Tersedia di e-Katalog LKPP"
            value={data.tersedia_ekatalog_produk}
            onChange={(v) => update("tersedia_ekatalog_produk", v)}
            note={catatanReviewerDetail?.["tersedia_ekatalog_produk"]}
          />
          <YaTidakSelect
            label="Material Tersedia di e-Katalog LKPP"
            value={data.tersedia_ekatalog_material}
            onChange={(v) => update("tersedia_ekatalog_material", v)}
            note={catatanReviewerDetail?.["tersedia_ekatalog_material"]}
          />
          <div />
          <div>
            <label className={labelCls}>Penggunaan Barang Dalam Negeri (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={data.penggunaan_barang_dn || ""}
              onChange={(e) => update("penggunaan_barang_dn", Number(e.target.value))}
              className={inputCls}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["penggunaan_barang_dn"]} />
          </div>
          <div>
            <label className={labelCls}>Penggunaan Barang Luar Negeri (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={data.penggunaan_barang_ln || ""}
              onChange={(e) => update("penggunaan_barang_ln", Number(e.target.value))}
              className={inputCls}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["penggunaan_barang_ln"]} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Perencanaan Konstruksi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={ClipboardList} title="Perencanaan Konstruksi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prioritas Kebutuhan</label>
            <select
              value={data.prioritas}
              onChange={(e) => update("prioritas", e.target.value as Prioritas)}
              className={selectCls}
            >                <option value="">-- Pilih Prioritas --</option>
                {PRIORITAS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <FieldCatatanBadge note={catatanReviewerDetail?.["prioritas"]} />
          </div>
          <YaTidakSelect
            label="Studi Kelayakan Dilaksanakan"
            value={data.studi_kelayakan}
            onChange={(v) => update("studi_kelayakan", v)}
            note={catatanReviewerDetail?.["studi_kelayakan"]}
          />
          <YaTidakSelect
            label="Dokumen Detailed Engineering Design (DED)"
            value={data.dokumen_ded}
            onChange={(v) => update("dokumen_ded", v)}
            note={catatanReviewerDetail?.["dokumen_ded"]}
          />
          <div>
            <label className={labelCls}>Kompleksitas Pekerjaan</label>
            <select
              value={data.kompleksitas}
              onChange={(e) => update("kompleksitas", e.target.value as Kompleksitas)}
              className={selectCls}
            >
              <option value="">-- Pilih Kompleksitas --</option>
              {KOMPLEKSITAS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {data.kompleksitas === "Kompleks" && (
              <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 leading-snug">
                Jika Kompleks, dibutuhkan dokumen Detailed Engineering Design (DED) paling lambat 1
                tahun anggaran sebelum persiapan pengadaan melalui penyedia.
              </p>
            )}
            <FieldCatatanBadge note={catatanReviewerDetail?.["kompleksitas"]} />
          </div>
          <YaTidakSelect
            label="Kontrak Tahun Jamak (Multi Years)"
            value={data.kontrak_tahun_jamak}
            onChange={(v) => update("kontrak_tahun_jamak", v)}
            note={catatanReviewerDetail?.["kontrak_tahun_jamak"]}
          />
          {data.kontrak_tahun_jamak === "Ya" && (
            <div>
              <label className={labelCls}>Jumlah Tahun Pelaksanaan</label>
              <input
                type="number"
                min={2}
                value={data.jumlah_tahun_jamak || ""}
                onChange={(e) => update("jumlah_tahun_jamak", Number(e.target.value))}
                className={inputCls}
              />
              <FieldCatatanBadge note={catatanReviewerDetail?.["jumlah_tahun_jamak"]} />
            </div>
          )}
          <YaTidakSelect
            label="Izin Tertulis Kontrak Tahun Jamak"
            value={data.izin_kontrak_jamak}
            onChange={(v) => update("izin_kontrak_jamak", v)}
            note={catatanReviewerDetail?.["izin_kontrak_jamak"]}
          />
          {data.izin_kontrak_jamak === "Ya" && (
            <div>
              <label className={labelCls}>Nomor Surat Izin</label>
              <input
                type="text"
                value={data.nomor_izin_jamak}
                onChange={(e) => update("nomor_izin_jamak", e.target.value)}
                placeholder="Nomor izin kontrak jamak"
                className={inputCls}
              />
              <FieldCatatanBadge note={catatanReviewerDetail?.["nomor_izin_jamak"]} />
            </div>
          )}
          <YaTidakSelect
            label="Dapat Dilaksanakan oleh Usaha Kecil"
            value={data.usaha_kecil_dapat}
            onChange={(v) => update("usaha_kecil_dapat", v)}
            note={catatanReviewerDetail?.["usaha_kecil_dapat"]}
          />
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Pagu & Anggaran Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Pembebasan Lahan Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={TreePine} title="Pembebasan Lahan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YaTidakSelect
            label="Kebutuhan Pembebasan Lahan"
            value={data.pembebasan_lahan}
            onChange={(v) => update("pembebasan_lahan", v)}
            note={catatanReviewerDetail?.["pembebasan_lahan"]}
          />
          {data.pembebasan_lahan === "Ya" && (
            <div>
              <label className={labelCls}>Luas Lahan/Tanah (m²)</label>
              <input
                type="number"
                min={0}
                value={data.luas_lahan || ""}
                onChange={(e) => update("luas_lahan", Number(e.target.value))}
                className={inputCls}
              />
              <FieldCatatanBadge note={catatanReviewerDetail?.["luas_lahan"]} />
            </div>
          )}
          <YaTidakSelect
            label="Kebutuhan Izin Pemanfaatan Tanah"
            value={data.izin_pemanfaatan_tanah}
            onChange={(v) => update("izin_pemanfaatan_tanah", v)}
            note={catatanReviewerDetail?.["izin_pemanfaatan_tanah"]}
          />
          <div>
            <label className={labelCls}>Lama Waktu Pengurusan (bulan)</label>
            <input
              type="number"
              min={0}
              value={data.lama_pengurusan_lahan || ""}
              onChange={(e) => update("lama_pengurusan_lahan", Number(e.target.value))}
              className={inputCls}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["lama_pengurusan_lahan"]} />
          </div>
          <YaTidakSelect
            label="Administrasi Pembayaran Ganti Rugi"
            value={data.status_pembayaran_ganti_rugi}
            onChange={(v) => update("status_pembayaran_ganti_rugi", v)}
            note={catatanReviewerDetail?.["status_pembayaran_ganti_rugi"]}
          />
        </div>
      </section>

      {/* Identifikasi Barang Tersedia (RKBMD) — penjelasan.docx Tabel 9 */}
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
              Pilih <b>Pagu Paket</b> terlebih dahulu (section <b>"Pagu Paket & Sumber Dana"</b>) —
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
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">
          Untuk pengadaan belanja modal - pastikan aset yang dibutuhkan tidak sudah dimiliki. Centang satu atau lebih barang dari popup RKBMD, atau isi manual.
        </p>
        <FieldCatatanBadge note={catatanReviewerDetail?.["rkbmd_items"]} />
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
        )}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Konsolidasi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Link} title="Konsolidasi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YaTidakSelect
            label="Ada Pengadaan Sejenis di Kegiatan Lain"
            value={data.pengadaan_sejenis}
            onChange={(v) => update("pengadaan_sejenis", v)}
            note={catatanReviewerDetail?.["pengadaan_sejenis"]}
          />
          <YaTidakSelect
            label="Indikasi Konsolidasi Pengadaan"
            value={data.indikasi_konsolidasi}
            onChange={(v) => update("indikasi_konsolidasi", v)}
            note={catatanReviewerDetail?.["indikasi_konsolidasi"]}
          />
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

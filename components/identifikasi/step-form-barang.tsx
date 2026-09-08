"use client"

import { useMemo, useEffect, useState } from "react"
import {
  FormBarang,
  LokasiItem,
  YaTidak,
  BanyakTerbatas,
  MetodePengadaan,
  MetodeOperasi,
  RkbmdItemTerpilih,
} from "@/types/identifikasi"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import { RkbmdPickerModal } from "@/components/identifikasi/rkbmd-picker-modal"
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
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormBarang
  onChange: (data: FormBarang) => void
  onOpenPagu: () => void
  totalPagu: number
  kodeSubKegiatan?: string
  kodeSkpd?: string
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

function YaTidakSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: YaTidak
  onChange: (v: YaTidak) => void
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as YaTidak)} className={selectCls}>
        {YA_TIDAK_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
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

export function StepFormBarang({ data, onChange, onOpenPagu, totalPagu, catatanReviewerDetail, kodeSubKegiatan, kodeSkpd }: Props) {
  const [isRkbmdPickerOpen, setIsRkbmdPickerOpen] = useState(false)
  const sumberDanaOptions: SearchableSelectOption[] = [
    { value: "DAU", label: "Dana Alokasi Umum (DAU)" },
    { value: "DAK-FISIK", label: "Dana Alokasi Khusus (DAK) Fisik" },
    { value: "DAK-NONFISIK", label: "Dana Alokasi Khusus (DAK) Non-Fisik" },
    { value: "DBH", label: "Dana Bagi Hasil (DBH)" },
    { value: "DBH-CHT", label: "Dana Bagi Hasil Cukai Hasil Tembakau (DBH-CHT)" },
    { value: "PAD", label: "Pendapatan Asli Daerah (PAD)" },
    { value: "BLUD", label: "Badan Layanan Umum Daerah (BLUD)" },
    { value: "APBD", label: "APBD" },
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

  /** Terapkan daftar item RKBMD (dari modal) + hitung ulang ringkasan (field skalar). */
  const applyRkbmdItems = (items: RkbmdItemTerpilih[]) => {
    const pengadaan = items.filter((i) => i.sumber === "pengadaan")
    const pemeliharaan = items.filter((i) => i.sumber === "pemeliharaan")
    onChange({
      ...data,
      rkbmd_items: items,
      jumlah_dibutuhkan: pengadaan.reduce((s, i) => s + (i.jumlah || 0), 0),
      jumlah_sejenis: pemeliharaan.reduce((s, i) => s + (i.jumlah || 0), 0),
      kondisi_baik: pemeliharaan.reduce((s, i) => s + (i.kondisi_b ?? 0), 0),
      kondisi_rusak_ringan: pemeliharaan.reduce((s, i) => s + (i.kondisi_rr ?? 0), 0),
      kondisi_rusak_berat: pemeliharaan.reduce((s, i) => s + (i.kondisi_rb ?? 0), 0),
    })
  }

  const removeRkbmdItem = (id: string) => {
    applyRkbmdItems(data.rkbmd_items.filter((i) => i.id !== id))
  }

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
                            className={inputCls}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["nama_paket"]} />
          </div>
          <div>
            <label className={labelCls}>Fungsi / Kegunaan</label>
            <input
              type="text"
              value={data.fungsi_kegunaan}
              onChange={(e) => update("fungsi_kegunaan", e.target.value)}
              placeholder="Fungsi barang"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Volume</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={data.volume || ""}
                onChange={(e) => update("volume", Number(e.target.value))}
                className={inputCls}
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
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian kebutuhan barang"
              className={inputCls + " resize-none"}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["uraian"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Spesifikasi</label>
            <textarea
              rows={3}
              value={data.spesifikasi}
              onChange={(e) => update("spesifikasi", e.target.value)}
              placeholder="Spesifikasi teknis barang"
              className={inputCls + " resize-none"}
            />
            <FieldCatatanBadge note={catatanReviewerDetail?.["spesifikasi"]} />
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Volume & Persyaratan Dasar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Layers} title="Volume & Persyaratan Dasar" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YaTidakSelect label="PDN (Produk Dalam Negeri)" value={data.pdn} onChange={(v) => update("pdn", v)} />
          <YaTidakSelect label="Usaha Kecil" value={data.usaha_kecil} onChange={(v) => update("usaha_kecil", v)} />
          <YaTidakSelect label="Pra DPA" value={data.pra_dpa} onChange={(v) => update("pra_dpa", v)} />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SPP (Sustainable Public Procurement) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={FileCheck} title="SPP (Sustainable Public Procurement)" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <YaTidakSelect
            label="SPP Ekonomi"
            value={data.spp_ekonomi}
            onChange={(v) => update("spp_ekonomi", v)}
          />
          <YaTidakSelect
            label="SPP Sosial"
            value={data.spp_sosial}
            onChange={(v) => update("spp_sosial", v)}
          />
          <YaTidakSelect
            label="SPP Lingkungan"
            value={data.spp_lingkungan}
            onChange={(v) => update("spp_lingkungan", v)}
          />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Lokasi (Multi-Lokasi) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={MapPin} title="Lokasi (Multi-Lokasi)" />
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
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Calendar} title="Waktu" />
        <div className="space-y-3">
          {[
            { label: "Pemanfaatan", awal: "waktu_pemanfaatan_awal", akhir: "waktu_pemanfaatan_akhir" },
            { label: "Pemilihan", awal: "waktu_pemilihan_awal", akhir: "waktu_pemilihan_akhir" },
            { label: "Pelaksanaan Kontrak", awal: "waktu_pelaksanaan_kontrak_awal", akhir: "waktu_pelaksanaan_kontrak_akhir" },
            { label: "Pelaksanaan Pekerjaan", awal: "waktu_pelaksanaan_pekerjaan_awal", akhir: "waktu_pelaksanaan_pekerjaan_akhir" },
          ].map((item) => (
            <div key={item.label}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {item.label}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Awal</label>
                  <input
                    type="month"
                    value={(data as unknown as Record<string, string>)[item.awal]}
                    onChange={(e) => update(item.awal as keyof FormBarang, e.target.value)}
                    className={smallInputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Akhir</label>
                  <input
                    type="month"
                    value={(data as unknown as Record<string, string>)[item.akhir]}
                    onChange={(e) => update(item.akhir as keyof FormBarang, e.target.value)}
                    className={smallInputCls}
                  />
                </div>
              </div>
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
            />
          </div>
          <YaTidakSelect
            label="Tersedia di e-Katalog"
            value={data.tersedia_ekatalog}
            onChange={(v) => update("tersedia_ekatalog", v)}
          />
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pagu & Anggaran ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Banknote} title="Pagu & Anggaran" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenPagu}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
            >
              <Banknote className="h-3.5 w-3.5" /> Atur Pagu Anggaran
            </button>
            {totalPagu > 0 && (
              <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800/50">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">Total: </span>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                  {formatRupiah(totalPagu)}
                </span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Sumber Dana</label>
              <SearchableSelect
                options={sumberDanaOptions}
                value={data.sumber_dana}
                onChange={(val) => update("sumber_dana", val)}
                placeholder="-- Pilih Sumber Dana --"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Identifikasi Barang Tersedia (RKBMD) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <SectionHeader icon={ClipboardList} title="Identifikasi Barang Tersedia (RKBMD)" />
          <div className="flex items-center gap-2">
            {data.rkbmd_items.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {data.rkbmd_items.length} item teridentifikasi
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsRkbmdPickerOpen(true)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <ClipboardList className="h-3 w-3" /> {data.rkbmd_items.length > 0 ? "Ubah Pilihan RKBMD" : "Ambil dari RKBMD"}
            </button>
          </div>
        </div>
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
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Jumlah Dibutuhkan</label>
              <input
                type="number"
                min={0}
                value={data.jumlah_dibutuhkan || ""}
                onChange={(e) => update("jumlah_dibutuhkan", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Jumlah Sejenis</label>
              <input
                type="number"
                min={0}
                value={data.jumlah_sejenis || ""}
                onChange={(e) => update("jumlah_sejenis", Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Kondisi Baik</label>
              <input
                type="number"
                min={0}
                value={data.kondisi_baik || ""}
                onChange={(e) => update("kondisi_baik", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Kondisi Rusak Ringan</label>
              <input
                type="number"
                min={0}
                value={data.kondisi_rusak_ringan || ""}
                onChange={(e) => update("kondisi_rusak_ringan", Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Kondisi Rusak Berat</label>
              <input
                type="number"
                min={0}
                value={data.kondisi_rusak_berat || ""}
                onChange={(e) => update("kondisi_rusak_berat", Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Mudah di Pasaran"
              value={data.mudah_pasaran}
              onChange={(v) => update("mudah_pasaran", v)}
            />
            <div>
              <label className={labelCls}>Produsen</label>
              <select
                value={data.produsen}
                onChange={(e) => update("produsen", e.target.value as BanyakTerbatas)}
                className={selectCls}
              >
                {PRODUSEN_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Kriteria & TKDN ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={FileCheck} title="Kriteria & TKDN" />
        <div className="space-y-3">
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <YaTidakSelect
              label="Persyaratan TKDN"
              value={data.persyaratan_tkdn}
              onChange={(v) => update("persyaratan_tkdn", v)}
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
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cara Pengangkutan</label>
              <input
                type="text"
                value={data.cara_pengangkutan}
                onChange={(e) => update("cara_pengangkutan", e.target.value)}
                placeholder="Cara pengangkutan barang"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cara Pemasangan</label>
              <input
                type="text"
                value={data.cara_pemasangan}
                onChange={(e) => update("cara_pemasangan", e.target.value)}
                placeholder="Cara pemasangan barang"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cara Penimbunan/Penyimpanan</label>
              <input
                type="text"
                value={data.cara_penimbunan}
                onChange={(e) => update("cara_penimbunan", e.target.value)}
                placeholder="Cara penimbunan/penyimpanan barang"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cara Operasi</label>
              <select
                value={data.cara_operasi}
                onChange={(e) => update("cara_operasi", e.target.value as MetodeOperasi)}
                className={selectCls}
              >
                {CARA_OPERASI_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <YaTidakSelect
              label="Pelatihan"
              value={data.pelatihan}
              onChange={(v) => update("pelatihan", v)}
            />
            <YaTidakSelect
              label="Pengadaan Sejenis"
              value={data.pengadaan_sejenis}
              onChange={(v) => update("pengadaan_sejenis", v)}
            />
            <YaTidakSelect
              label="Indikasi Konsolidasi"
              value={data.indikasi_konsolidasi}
              onChange={(v) => update("indikasi_konsolidasi", v)}
            />
          </div>
          <div>
            <label className={labelCls}>SPP Lanjutan</label>
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
          </div>
        </div>
      </section>

      {/* Popup Ambil dari RKBMD — multi-pilih, daftar item tersimpan di rkbmd_items */}
      <RkbmdPickerModal
        isOpen={isRkbmdPickerOpen}
        onClose={() => setIsRkbmdPickerOpen(false)}
        kodeSubKegiatan={kodeSubKegiatan || ""}
        kodeSkpd={kodeSkpd}
        currentSelections={data.rkbmd_items}
        onSelect={applyRkbmdItems}
      />
    </div>
  )
}

"use client"

import { useMemo, useEffect } from "react"
import {
  FormKonsultansi,
  LokasiItem,
  YaTidak,
  BanyakTerbatas,
  JenisPenyedia,
  MetodePengadaan,
} from "@/types/identifikasi"
import { useWilayah } from "@/hooks/useWilayah"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  Lightbulb,
  MapPin,
  Calendar,
  Layers,
  Banknote,
  Search,
  FileCheck,

  Plus,
  Trash2,
  ChevronDown,
  Users,
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormKonsultansi
  onChange: (data: FormKonsultansi) => void
  onOpenPagu: () => void
  totalPagu: number
}

const VOLUME_SATUAN_OPTIONS = ["Unit", "Paket", "Lot"] as const
const YA_TIDAK_OPTIONS: YaTidak[] = ["Ya", "Tidak"]
const JUMLAH_PELAKU_OPTIONS: BanyakTerbatas[] = ["Banyak", "Terbatas"]
const JENIS_PENYEDIA_OPTIONS: JenisPenyedia[] = ["Perorangan", "Badan Usaha"]

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

function SectionHeader({ icon: Icon, title }: { icon: typeof Lightbulb; title: string }) {
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

  
  // Pre-load kabupaten & kecamatan saat mount untuk mode edit
  useEffect(() => {
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

export function StepFormKonsultansi({ data, onChange, onOpenPagu, totalPagu, catatanReviewerDetail }: Props) {
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

  const metodePengadaanOptions: SearchableSelectOption[] = [
    { value: "Tender", label: "Tender" },
    { value: "Tender Cepat", label: "Tender Cepat" },
    { value: "Pengadaan Langsung", label: "Pengadaan Langsung" },
    { value: "Penunjukan Langsung", label: "Penunjukan Langsung" },
    { value: "Seleksi", label: "Seleksi" },
    { value: "ePurchasing", label: "ePurchasing" },
    { value: "Swakelola", label: "Swakelola" },
    { value: "Pemilihan Swakelola", label: "Pemilihan Swakelola" },
  ]

  const update = useMemo(() => {
    return <K extends keyof FormKonsultansi>(field: K, value: FormKonsultansi[K]) => {
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

  return (
    <div className="space-y-6">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Informasi Paket Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Lightbulb} title="Informasi Paket" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Nama Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nama_paket}
              onChange={(e) => update("nama_paket", e.target.value)}
              placeholder="Contoh: Konsultansi Studi Kelayakan"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Target Sasaran</label>
            <input
              type="text"
              value={data.target_sasaran}
              onChange={(e) => update("target_sasaran", e.target.value)}
              placeholder="Target sasaran konsultansi"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian kebutuhan konsultansi"
              className={inputCls + " resize-none"}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Spesifikasi</label>
            <textarea
              rows={3}
              value={data.spesifikasi}
              onChange={(e) => update("spesifikasi", e.target.value)}
              placeholder="Spesifikasi teknis konsultansi"
              className={inputCls + " resize-none"}
            />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Penyedia Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Users} title="Penyedia" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Jenis Penyedia</label>
            <select
              value={data.jenis_penyedia}
              onChange={(e) => update("jenis_penyedia", e.target.value as JenisPenyedia)}
              className={selectCls}
            >
              <option value="">-- Pilih Jenis --</option>
              {JENIS_PENYEDIA_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Jumlah Pelaku</label>
            <select
              value={data.jumlah_pelaku}
              onChange={(e) => update("jumlah_pelaku", e.target.value as BanyakTerbatas)}
              className={selectCls}
            >
              {JUMLAH_PELAKU_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
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
                className={inputCls}
              />
              <select
                value={data.volume_satuan}
                onChange={(e) => update("volume_satuan", e.target.value as FormKonsultansi["volume_satuan"])}
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
          <div>
            <label className={labelCls}>PDN (Produk Dalam Negeri)</label>
            <select
              value={data.pdn}
              onChange={(e) => update("pdn", e.target.value as YaTidak)}
              className={selectCls}
            >
              {YA_TIDAK_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Usaha Kecil</label>
            <select
              value={data.usaha_kecil}
              onChange={(e) => update("usaha_kecil", e.target.value as YaTidak)}
              className={selectCls}
            >
              {YA_TIDAK_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Pra DPA</label>
            <select
              value={data.pra_dpa}
              onChange={(e) => update("pra_dpa", e.target.value as YaTidak)}
              className={selectCls}
            >
              {YA_TIDAK_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ SPP (Sustainable Public Procurement) Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Lokasi (Multi-Lokasi) Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Waktu Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                    onChange={(e) => update(item.awal as keyof FormKonsultansi, e.target.value)}
                    className={smallInputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Akhir</label>
                  <input
                    type="month"
                    value={(data as unknown as Record<string, string>)[item.akhir]}
                    onChange={(e) => update(item.akhir as keyof FormKonsultansi, e.target.value)}
                    className={smallInputCls}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Metode Pengadaan Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Search} title="Metode Pengadaan" />
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Pagu & Anggaran Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Konsolidasi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Layers} title="Konsolidasi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </section>
    </div>
  )
}

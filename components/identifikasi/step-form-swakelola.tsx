"use client"

import { useMemo, useEffect } from "react"
import { FormSwakelola, LokasiItem, TipeSwakelola } from "@/types/identifikasi"
import { useWilayah } from "@/hooks/useWilayah"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { WaktuPicker } from "@/components/identifikasi/waktu-picker"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import {
  HardHat,
  MapPin,
  Calendar,
  Banknote,
  Info,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormSwakelola
  onChange: (data: FormSwakelola) => void
  onOpenPagu?: () => void
  totalPagu?: number
  /** Key field yang kosong (validasi) — sorot merah + "Wajib diisi". */
  missing?: string[]
}

const TIPE_SWAKELOLA_OPTIONS: Exclude<TipeSwakelola, "">[] = ["Tipe I", "Tipe II", "Tipe III", "Tipe IV"]

const TIPE_SWAKELOLA_INFO: Record<Exclude<TipeSwakelola, "">, string> = {
  "Tipe I": "Pekerjaan dengan nilai paling banyak Rp 50 juta (swakelola sendiri)",
  "Tipe II": "Pekerjaan dengan nilai paling banyak Rp 200 juta dengan melibatkan masyarakat",
  "Tipe III": "Pekerjaan dengan nilai paling banyak Rp 500 juta dengan melibatkan masyarakat",
  "Tipe IV": "Pekerjaan dengan nilai paling banyak Rp 1 miliar dengan melibatkan masyarakat",
}

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
const smallInputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"

function SectionHeader({ icon: Icon, title }: { icon: typeof HardHat; title: string }) {
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

export function StepFormSwakelola({ data, onChange, catatanReviewerDetail, onOpenPagu, totalPagu, missing = [] }: Props) {
  const sumberDanaOptions: SearchableSelectOption[] = [
    { value: "DAU", label: "Dana Alokasi Umum (DAU)" },
    { value: "DAK-FISIK", label: "Dana Alokasi Khusus (DAK) Fisik" },
    { value: "DAK-NONFISIK", label: "Dana Alokasi Khusus (DAK) Non-Fisik" },
    { value: "DBH", label: "Dana Bagi Hasil (DBH)" },
    { value: "DBH-CHT", label: "Dana Bagi Hasil Cukai Hasil Tembakau (DBH-CHT)" },
    { value: "PAD", label: "Pendapatan Asli Daerah (PAD)" },
    { value: "BLUD", label: "Badan Layanan Umum Daerah (BLUD)" },
  ]

  const update = useMemo(() => {
    return <K extends keyof FormSwakelola>(field: K, value: FormSwakelola[K]) => {
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
        <SectionHeader icon={HardHat} title="Informasi Paket" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Nama Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nama_paket}
              onChange={(e) => update("nama_paket", e.target.value)}
              placeholder="Contoh: Pengecatan Fasilitas Kantor"
              className={errCls("nama_paket", inputCls)}
            />
            {errNote("nama_paket")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["nama_paket"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian Pekerjaan</label>
            <textarea
              rows={2}
              value={data.uraian_pekerjaan}
              onChange={(e) => update("uraian_pekerjaan", e.target.value)}
              placeholder="Uraian pekerjaan swakelola"
              className={errCls("uraian_pekerjaan", inputCls + " resize-none")}
            />
            {errNote("uraian_pekerjaan")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["uraian_pekerjaan"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Spesifikasi Pekerjaan</label>
            <textarea
              rows={3}
              value={data.spesifikasi_pekerjaan}
              onChange={(e) => update("spesifikasi_pekerjaan", e.target.value)}
              placeholder="Spesifikasi teknis pekerjaan"
              className={errCls("spesifikasi_pekerjaan", inputCls + " resize-none")}
            />
            {errNote("spesifikasi_pekerjaan")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["spesifikasi_pekerjaan"]} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Tipe Swakelola Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${isMiss("tipe_swakelola") ? "border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-800"}`}>
        <SectionHeader icon={Info} title="Tipe Swakelola" />
        {errNote("tipe_swakelola")}
        <FieldCatatanBadge note={catatanReviewerDetail?.["tipe_swakelola"]} />
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Tipe Swakelola</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPE_SWAKELOLA_OPTIONS.map((tipe) => (
                <label
                  key={tipe}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    data.tipe_swakelola === tipe
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="tipe_swakelola"
                    value={tipe}
                    checked={data.tipe_swakelola === tipe}
                    onChange={() => update("tipe_swakelola", tipe)}
                    className="mt-0.5 h-3.5 w-3.5 text-blue-600 focus:ring-blue-500/40"
                  />
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{tipe}</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {TIPE_SWAKELOLA_INFO[tipe]}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Waktu Pelaksanaan Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className={`rounded-xl border bg-white dark:bg-slate-900 p-4 ${isMiss("waktu_awal") ? "border-rose-300 dark:border-rose-500/50 ring-1 ring-rose-400/30" : "border-slate-200 dark:border-slate-800"}`}>
        <SectionHeader icon={Calendar} title="Waktu Pelaksanaan Pekerjaan" />
        {errNote("waktu_awal")}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Waktu Awal</label>
            <WaktuPicker value={data.waktu_awal || ""} onChange={(v) => update("waktu_awal", v)} />
            <FieldCatatanBadge note={catatanReviewerDetail?.["waktu_pelaksanaan"]} />
          </div>
          <div>
            <label className={labelCls}>Waktu Akhir</label>
            <WaktuPicker value={data.waktu_akhir || ""} onChange={(v) => update("waktu_akhir", v)} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Anggaran Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                placeholder="-- Pilih Sumber Dana --"              className={errCls("sumber_dana", "")}
            />
            {errNote("sumber_dana")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["sumber_dana"]} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

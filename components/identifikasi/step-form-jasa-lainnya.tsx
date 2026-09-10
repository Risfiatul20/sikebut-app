"use client"

import { useMemo, useEffect } from "react"
import {
  FormJasaLainnya,
  LokasiItem,
  YaTidak,
  BanyakTerbatas,
  MetodePengadaan,
} from "@/types/identifikasi"
import { useWilayah } from "@/hooks/useWilayah"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { WaktuPicker } from "@/components/identifikasi/waktu-picker"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import {
  Briefcase,
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
  Users,
  AlertTriangle,
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormJasaLainnya
  onChange: (data: FormJasaLainnya) => void
  onOpenPagu?: () => void
  totalPagu?: number
  /** Key field yang kosong (validasi) — sorot merah + "Wajib diisi". */
  missing?: string[]
}

const VOLUME_SATUAN_OPTIONS = ["Unit", "Paket", "Set", "Lot"] as const
const YA_TIDAK_OPTIONS: YaTidak[] = ["Ya", "Tidak"]
const JUMLAH_PELAKU_OPTIONS: BanyakTerbatas[] = ["Banyak", "Terbatas"]

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
  note,
}: {
  label: string
  value: YaTidak
  onChange: (v: YaTidak) => void
  note?: string | null
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as YaTidak)} className={selectCls}>
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

function SectionHeader({ icon: Icon, title }: { icon: typeof Briefcase; title: string }) {
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

export function StepFormJasaLainnya({ data, onChange, catatanReviewerDetail, onOpenPagu, totalPagu, missing = [] }: Props) {
  const sumberDanaOptions: SearchableSelectOption[] = [
    { value: "DAU", label: "Dana Alokasi Umum (DAU)" },
    { value: "DAK-FISIK", label: "Dana Alokasi Khusus (DAK) Fisik" },
    { value: "DAK-NONFISIK", label: "Dana Alokasi Khusus (DAK) Non-Fisik" },
    { value: "DBH", label: "Dana Bagi Hasil (DBH)" },
    { value: "DBH-CHT", label: "Dana Bagi Hasil Cukai Hasil Tembakau (DBH-CHT)" },
    { value: "PAD", label: "Pendapatan Asli Daerah (PAD)" },
    { value: "BLUD", label: "Badan Layanan Umum Daerah (BLUD)" },
  ]

  // Metode pemilihan penyedia untuk Jasa Lainnya (Perpres PBJ): tender, pengadaan langsung, dll.
  const metodePengadaanOptions: SearchableSelectOption[] = [
    { value: "Tender", label: "Tender" },
    { value: "Tender Cepat", label: "Tender Cepat" },
    { value: "Pengadaan Langsung", label: "Pengadaan Langsung" },
    { value: "Penunjukan Langsung", label: "Penunjukan Langsung" },
    { value: "ePurchasing", label: "ePurchasing" },
  ]

  const update = useMemo(() => {
    return <K extends keyof FormJasaLainnya>(field: K, value: FormJasaLainnya[K]) => {
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
        <SectionHeader icon={Briefcase} title="Informasi Paket" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Nama Paket <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.nama_paket}
              onChange={(e) => update("nama_paket", e.target.value)}
              placeholder="Contoh: Jasa Pemeliharaan Gedung"
              className={errCls("nama_paket", inputCls)}
            />
            {errNote("nama_paket")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["nama_paket"]} />
          </div>
          <div>
            <label className={labelCls}>Kebutuhan Rutin Tahunan</label>
            <select
              value={data.kebutuhan_rutin}
              onChange={(e) => update("kebutuhan_rutin", e.target.value as YaTidak)}
              className={errCls("kebutuhan_rutin", selectCls)}
            >
              {YA_TIDAK_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <FieldCatatanBadge note={catatanReviewerDetail?.["kebutuhan_rutin"]} />
          </div>
          <div>
            <label className={labelCls}>Fungsi/Kegunaan</label>
            <input
              type="text"
              value={data.fungsi_kegunaan}
              onChange={(e) => update("fungsi_kegunaan", e.target.value)}
              placeholder="Fungsi jasa"
              className={errCls("fungsi_kegunaan", inputCls)}
            />
            {errNote("fungsi_kegunaan")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["fungsi_kegunaan"]} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Kompetensi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Users} title="Kompetensi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Kompetensi/Spesifikasi Teknis</label>
            <textarea
              rows={2}
              value={data.kompetensi_teknis}
              onChange={(e) => update("kompetensi_teknis", e.target.value)}
              placeholder="Kompetensi teknis yang dibutuhkan"
              className={errCls("kompetensi_teknis", inputCls + " resize-none")}
            />
            {errNote("kompetensi_teknis")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["kompetensi_teknis"]} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Sumber Daya Tersedia/Dimiliki</label>
            <textarea
              rows={2}
              value={data.sumberdaya_dimiliki}
              onChange={(e) => update("sumberdaya_dimiliki", e.target.value)}
              placeholder="Sumber daya yang dimiliki"
              className={errCls("sumberdaya_dimiliki", inputCls + " resize-none")}
            />
            {errNote("sumberdaya_dimiliki")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["sumberdaya_dimiliki"]} />
          </div>
          <div>
            <label className={labelCls}>Jumlah Pelaku Usaha Mampu & Memenuhi Syarat</label>
            <select
              value={data.jumlah_pelaku}
              onChange={(e) => update("jumlah_pelaku", e.target.value as BanyakTerbatas)}
              className={errCls("jumlah_pelaku", selectCls)}
            >
              <option value="">-- Pilih --</option>
              {JUMLAH_PELAKU_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <FieldCatatanBadge note={catatanReviewerDetail?.["jumlah_pelaku"]} />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Detail Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={ClipboardList} title="Detail" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian Pekerjaan</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian kebutuhan jasa"
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
              placeholder="Spesifikasi teknis jasa"
              className={errCls("spesifikasi", inputCls + " resize-none")}
            />
            {errNote("spesifikasi")}
            <FieldCatatanBadge note={catatanReviewerDetail?.["spesifikasi"]} />
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
                onChange={(e) => update("volume_satuan", e.target.value as FormJasaLainnya["volume_satuan"])}
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
          <div>
            <label className={labelCls}>PDN</label>
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
            <FieldCatatanBadge note={catatanReviewerDetail?.["pdn"]} />
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
            <FieldCatatanBadge note={catatanReviewerDetail?.["usaha_kecil"]} />
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
            <FieldCatatanBadge note={catatanReviewerDetail?.["pra_dpa"]} />
          </div>
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
                    onChange={(v) => update(item.awal as keyof FormJasaLainnya, v)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Akhir</label>
                  <WaktuPicker
                    value={(data as unknown as Record<string, string>)[item.akhir] || ""}
                    onChange={(v) => update(item.akhir as keyof FormJasaLainnya, v)}
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
            label="Tersedia di e-Katalog LKPP"
            value={data.tersedia_ekatalog}
            onChange={(v) => update("tersedia_ekatalog", v)}
            note={catatanReviewerDetail?.["tersedia_ekatalog"]}
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

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Konsolidasi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Layers} title="Konsolidasi" />
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
    </div>
  )
}

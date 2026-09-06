"use client"

import { useMemo, useEffect } from "react"
import {
  FormKonstruksi,
  LokasiItem,
  YaTidak,
  Prioritas,
  Kompleksitas,
  MetodePengadaan,
} from "@/types/identifikasi"
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
} from "lucide-react"

interface Props {
  catatanReviewerDetail?: Record<string, string> | null
  data: FormKonstruksi
  onChange: (data: FormKonstruksi) => void
  onOpenPagu: () => void
  totalPagu: number
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as YaTidak)}
        className={selectCls}
      >
        {YA_TIDAK_OPTIONS.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
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

export function StepFormKonstruksi({ data, onChange, onOpenPagu, totalPagu, catatanReviewerDetail }: Props) {
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
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Fungsi</label>
            <input
              type="text"
              value={data.fungsi}
              onChange={(e) => update("fungsi", e.target.value)}
              placeholder="Fungsi pekerjaan konstruksi"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Target Sasaran</label>
            <input
              type="text"
              value={data.target_sasaran}
              onChange={(e) => update("target_sasaran", e.target.value)}
              placeholder="Target sasaran pengguna"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Uraian</label>
            <textarea
              rows={2}
              value={data.uraian}
              onChange={(e) => update("uraian", e.target.value)}
              placeholder="Uraian pekerjaan konstruksi"
              className={inputCls + " resize-none"}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Spesifikasi</label>
            <textarea
              rows={3}
              value={data.spesifikasi}
              onChange={(e) => update("spesifikasi", e.target.value)}
              placeholder="Spesifikasi teknis pekerjaan konstruksi"
              className={inputCls + " resize-none"}
            />
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
          </div>
          <div />
          <YaTidakSelect
            label="PDN (Produk Dalam Negeri)"
            value={data.pdn}
            onChange={(v) => update("pdn", v)}
          />
          <YaTidakSelect
            label="Usaha Kecil"
            value={data.usaha_kecil}
            onChange={(v) => update("usaha_kecil", v)}
          />
          <YaTidakSelect
            label="Pra DPA"
            value={data.pra_dpa}
            onChange={(v) => update("pra_dpa", v)}
          />
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
            {
              label: "Pemanfaatan",
              awal: "waktu_pemanfaatan_awal",
              akhir: "waktu_pemanfaatan_akhir",
            },
            {
              label: "Pemilihan",
              awal: "waktu_pemilihan_awal",
              akhir: "waktu_pemilihan_akhir",
            },
            {
              label: "Pelaksanaan Kontrak",
              awal: "waktu_pelaksanaan_kontrak_awal",
              akhir: "waktu_pelaksanaan_kontrak_akhir",
            },
            {
              label: "Pelaksanaan Pekerjaan",
              awal: "waktu_pelaksanaan_pekerjaan_awal",
              akhir: "waktu_pelaksanaan_pekerjaan_akhir",
            },
          ].map((item) => (
            <div key={item.label}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                {item.label}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                    Awal
                  </label>
                  <input
                    type="month"
                    value={(data as unknown as Record<string, string>)[item.awal]}
                    onChange={(e) =>
                      update(item.awal as keyof FormKonstruksi, e.target.value)
                    }
                    className={smallInputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                    Akhir
                  </label>
                  <input
                    type="month"
                    value={(data as unknown as Record<string, string>)[item.akhir]}
                    onChange={(e) =>
                      update(item.akhir as keyof FormKonstruksi, e.target.value)
                    }
                    className={smallInputCls}
                  />
                </div>
              </div>
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
            />
          </div>
          <YaTidakSelect
            label="Tersedia e-Katalog Produk"
            value={data.tersedia_ekatalog_produk}
            onChange={(v) => update("tersedia_ekatalog_produk", v)}
          />
          <YaTidakSelect
            label="Tersedia e-Katalog Material"
            value={data.tersedia_ekatalog_material}
            onChange={(v) => update("tersedia_ekatalog_material", v)}
          />
          <div />
          <div>
            <label className={labelCls}>Penggunaan Barang DN (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={data.penggunaan_barang_dn || ""}
              onChange={(e) => update("penggunaan_barang_dn", Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Penggunaan Barang LN (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={data.penggunaan_barang_ln || ""}
              onChange={(e) => update("penggunaan_barang_ln", Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Perencanaan Konstruksi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={ClipboardList} title="Perencanaan Konstruksi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Prioritas</label>
            <select
              value={data.prioritas}
              onChange={(e) => update("prioritas", e.target.value as Prioritas)}
              className={selectCls}
            >
              <option value="">-- Pilih Prioritas --</option>
              {PRIORITAS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <YaTidakSelect
            label="Studi Kelayakan"
            value={data.studi_kelayakan}
            onChange={(v) => update("studi_kelayakan", v)}
          />
          <YaTidakSelect
            label="Dokumen DED"
            value={data.dokumen_ded}
            onChange={(v) => update("dokumen_ded", v)}
          />
          <div>
            <label className={labelCls}>Kompleksitas</label>
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
          </div>
          <YaTidakSelect
            label="Kontrak Tahun Jamak"
            value={data.kontrak_tahun_jamak}
            onChange={(v) => update("kontrak_tahun_jamak", v)}
          />
          {data.kontrak_tahun_jamak === "Ya" && (
            <div>
              <label className={labelCls}>Jumlah Tahun Jamak</label>
              <input
                type="number"
                min={2}
                value={data.jumlah_tahun_jamak || ""}
                onChange={(e) => update("jumlah_tahun_jamak", Number(e.target.value))}
                className={inputCls}
              />
            </div>
          )}
          <YaTidakSelect
            label="Izin Kontrak Jamak"
            value={data.izin_kontrak_jamak}
            onChange={(v) => update("izin_kontrak_jamak", v)}
          />
          {data.izin_kontrak_jamak === "Ya" && (
            <div>
              <label className={labelCls}>Nomor Izin Jamak</label>
              <input
                type="text"
                value={data.nomor_izin_jamak}
                onChange={(e) => update("nomor_izin_jamak", e.target.value)}
                placeholder="Nomor izin kontrak jamak"
                className={inputCls}
              />
            </div>
          )}
          <YaTidakSelect
            label="Usaha Kecil Dapat Melaksanakan"
            value={data.usaha_kecil_dapat}
            onChange={(v) => update("usaha_kecil_dapat", v)}
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
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                  Total:{" "}
                </span>
                <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
                  {formatRupiah(totalPagu)}
                </span>
              </div>
            )}
          </div>
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
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Pembebasan Lahan Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={TreePine} title="Pembebasan Lahan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <YaTidakSelect
            label="Pembebasan Lahan"
            value={data.pembebasan_lahan}
            onChange={(v) => update("pembebasan_lahan", v)}
          />
          {data.pembebasan_lahan === "Ya" && (
            <div>
              <label className={labelCls}>Luas Lahan (mÃ‚Â²)</label>
              <input
                type="number"
                min={0}
                value={data.luas_lahan || ""}
                onChange={(e) => update("luas_lahan", Number(e.target.value))}
                className={inputCls}
              />
            </div>
          )}
          <YaTidakSelect
            label="Izin Pemanfaatan Tanah"
            value={data.izin_pemanfaatan_tanah}
            onChange={(v) => update("izin_pemanfaatan_tanah", v)}
          />
          <div>
            <label className={labelCls}>Lama Pengurusan Lahan (bulan)</label>
            <input
              type="number"
              min={0}
              value={data.lama_pengurusan_lahan || ""}
              onChange={(e) => update("lama_pengurusan_lahan", Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <YaTidakSelect
            label="Status Pembayaran Ganti Rugi"
            value={data.status_pembayaran_ganti_rugi}
            onChange={(v) => update("status_pembayaran_ganti_rugi", v)}
          />
        </div>
      </section>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Konsolidasi Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <SectionHeader icon={Link} title="Konsolidasi" />
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

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { X, Loader2, PackagePlus, Search, CheckCircle2, AlertCircle } from "lucide-react"
import { useSkpd } from "@/hooks/useSkpd"
import { RkbmdType } from "@/types/rkbmd"

/**
 * Modal "Tambah Data RKBMD Manual" — mengisi data RKBMD Pengadaan/Pemeliharaan
 * langsung dari form (tanpa file Excel). Auto-fill nama SKPD / program / kegiatan
 * dilakukan oleh backend dari kode yang dipilih.
 */

interface Props {
  type: RkbmdType
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

interface SubKegiatanOption {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
  kode_kegiatan: string
}

const FIELD_BASE =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
const LABEL = "block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1"

export function RkbmdManualForm({ type, isOpen, onClose, onSaved }: Props) {
  const { skpdList } = useSkpd()
  const isPengadaan = type === "pengadaan"

  const [form, setForm] = useState({
    nama_barang: "",
    kode_fikasi: "",
    jumlah_barang: "",
    jumlah_maksimum: "",
    satuan: "",
    cara_pemenuhan: "Pengadaan",
    keterangan: "",
    kode_skpd: "",
    kode_sub_kegiatan: "",
    kondisi_b: "0",
    kondisi_rr: "0",
    kondisi_rb: "0",
    nama_pemeliharaan: "",
    jumlah_pemeliharaan: "",
    satuan_pemeliharaan: "",
    periode: "2026",
  })
  const [subOptions, setSubOptions] = useState<SubKegiatanOption[]>([])
  const [subSearch, setSubSearch] = useState("")
  const [isSubOpen, setIsSubOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Muat daftar sub kegiatan saat modal dibuka
  const loadSubOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/ref-sub-kegiatan?per_page=0", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSubOptions((json.data ?? []) as SubKegiatanOption[])
    } catch {
      setSubOptions([])
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setForm({
        nama_barang: "",
        kode_fikasi: "",
        jumlah_barang: "",
        jumlah_maksimum: "",
        satuan: "",
        cara_pemenuhan: "Pengadaan",
        keterangan: "",
        kode_skpd: "",
        kode_sub_kegiatan: "",
        kondisi_b: "0",
        kondisi_rr: "0",
        kondisi_rb: "0",
        nama_pemeliharaan: "",
        jumlah_pemeliharaan: "",
        satuan_pemeliharaan: "",
        periode: "2026",
      })
      setSubSearch("")
      setError(null)
      setSuccess(false)
      setIsSubOpen(false)
      loadSubOptions()
    }
  }, [isOpen, loadSubOptions])

  const filteredSubs = useMemo(() => {
    const q = subSearch.toLowerCase().trim()
    if (!q) return subOptions.slice(0, 50)
    return subOptions.filter(
      (s) =>
        s.kode_sub_kegiatan.toLowerCase().includes(q) ||
        s.nama_sub_kegiatan.toLowerCase().includes(q)
    ).slice(0, 50)
  }, [subOptions, subSearch])

  const selectedSub = subOptions.find((s) => s.kode_sub_kegiatan === form.kode_sub_kegiatan)

  if (!isOpen) return null

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (!form.nama_barang.trim()) {
      setError("Nama barang wajib diisi.")
      return
    }
    if (!form.kode_skpd) {
      setError("Silakan pilih Perangkat Daerah (SKPD).")
      return
    }
    if (!form.kode_sub_kegiatan) {
      setError("Silakan pilih Sub Kegiatan.")
      return
    }
    if (!form.jumlah_barang || Number(form.jumlah_barang) < 0) {
      setError("Jumlah barang wajib diisi (angka ≥ 0).")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        nama_barang: form.nama_barang.trim(),
        kode_fikasi: form.kode_fikasi.trim() || null,
        jumlah_barang: Number(form.jumlah_barang),
        satuan: form.satuan.trim() || null,
        keterangan: form.keterangan.trim() || null,
        kode_skpd: form.kode_skpd,
        kode_sub_kegiatan: form.kode_sub_kegiatan,
        periode: Number(form.periode),
        ...(isPengadaan
          ? {
              jumlah_maksimum: form.jumlah_maksimum ? Number(form.jumlah_maksimum) : Number(form.jumlah_barang),
              cara_pemenuhan: form.cara_pemenuhan || "Pengadaan",
            }
          : {
              kondisi_b: Number(form.kondisi_b || 0),
              kondisi_rr: Number(form.kondisi_rr || 0),
              kondisi_rb: Number(form.kondisi_rb || 0),
              nama_pemeliharaan: form.nama_pemeliharaan.trim() || null,
              jumlah_pemeliharaan: form.jumlah_pemeliharaan ? Number(form.jumlah_pemeliharaan) : 0,
              satuan_pemeliharaan: form.satuan_pemeliharaan.trim() || null,
            }),
      }

      const res = await fetch(`/api/rkbmd/${type}/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          json?.message ||
          (json?.errors ? Object.values(json.errors).flat().join(" · ") : `Gagal menyimpan (HTTP ${res.status})`)
        setError(msg)
        return
      }
      setSuccess(true)
      onSaved()
      setTimeout(() => onClose(), 1200)
    } catch {
      setError("Terjadi kesalahan koneksi. Coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <PackagePlus className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Tambah RKBMD {isPengadaan ? "Pengadaan" : "Pemeliharaan"} — Manual
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Isi langsung tanpa file Excel. Nama SKPD / program / kegiatan terisi otomatis dari kode.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto custom-scrollbar p-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Data berhasil disimpan!</span>
            </div>
          )}

          {/* Barang */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {isPengadaan ? "Barang Rencana Pengadaan" : "Barang Aset & Pemeliharaan"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className={LABEL}>Nama Barang *</label>
                <input
                  type="text"
                  value={form.nama_barang}
                  onChange={set("nama_barang")}
                  placeholder="contoh: Mini Bus, Laptop, Scanner..."
                  className={FIELD_BASE}
                />
              </div>
              <div>
                <label className={LABEL}>Kode Fikasi</label>
                <input
                  type="text"
                  value={form.kode_fikasi}
                  onChange={set("kode_fikasi")}
                  placeholder="contoh: 1.02.01.01.001"
                  className={`${FIELD_BASE} font-mono`}
                />
              </div>
              <div>
                <label className={LABEL}>Satuan</label>
                <input
                  type="text"
                  value={form.satuan}
                  onChange={set("satuan")}
                  placeholder="Unit / Buah / Set..."
                  className={FIELD_BASE}
                />
              </div>
              <div>
                <label className={LABEL}>Jumlah Barang *</label>
                <input
                  type="number"
                  min={0}
                  value={form.jumlah_barang}
                  onChange={set("jumlah_barang")}
                  placeholder="0"
                  className={`${FIELD_BASE} font-mono`}
                />
              </div>
              {isPengadaan ? (
                <div>
                  <label className={LABEL}>Jumlah Maksimum</label>
                  <input
                    type="number"
                    min={0}
                    value={form.jumlah_maksimum}
                    onChange={set("jumlah_maksimum")}
                    placeholder="otomatis = jumlah barang"
                    className={`${FIELD_BASE} font-mono`}
                  />
                </div>
              ) : (
                <div>
                  <label className={LABEL}>Nama Pemeliharaan</label>
                  <input
                    type="text"
                    value={form.nama_pemeliharaan}
                    onChange={set("nama_pemeliharaan")}
                    placeholder="contoh: Pemeliharaan AC"
                    className={FIELD_BASE}
                  />
                </div>
              )}
              {!isPengadaan && (
                <>
                  <div>
                    <label className={LABEL}>Volume Pemeliharaan</label>
                    <input
                      type="number"
                      min={0}
                      value={form.jumlah_pemeliharaan}
                      onChange={set("jumlah_pemeliharaan")}
                      placeholder="0"
                      className={`${FIELD_BASE} font-mono`}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Satuan Pemeliharaan</label>
                    <input
                      type="text"
                      value={form.satuan_pemeliharaan}
                      onChange={set("satuan_pemeliharaan")}
                      placeholder="Unit / Kali..."
                      className={FIELD_BASE}
                    />
                  </div>
                </>
              )}
              {isPengadaan && (
                <div className="sm:col-span-2">
                  <label className={LABEL}>Cara Pemenuhan</label>
                  <select value={form.cara_pemenuhan} onChange={set("cara_pemenuhan")} className={FIELD_BASE}>
                    <option value="Pengadaan">Pengadaan</option>
                    <option value="Swakelola">Swakelola</option>
                  </select>
                </div>
              )}
              {!isPengadaan && (
                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  {(
                    [
                      ["kondisi_b", "Kondisi Baik (B)"],
                      ["kondisi_rr", "Rusak Ringan (RR)"],
                      ["kondisi_rb", "Rusak Berat (RB)"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className={LABEL}>{label}</label>
                      <input
                        type="number"
                        min={0}
                        value={form[key]}
                        onChange={set(key)}
                        className={`${FIELD_BASE} font-mono`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SKPD & Sub Kegiatan */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Perangkat Daerah & Sub Kegiatan
            </p>
            <div>
              <label className={LABEL}>Perangkat Daerah (SKPD) *</label>
              <select value={form.kode_skpd} onChange={set("kode_skpd")} className={FIELD_BASE}>
                <option value="">— Pilih SKPD —</option>
                {skpdList.map((s) => (
                  <option key={s.kode_skpd} value={s.kode_skpd}>
                    {s.is_sub_unit ? `↳ ${s.nama_skpd}` : s.nama_skpd} ({s.kode_skpd})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className={LABEL}>Sub Kegiatan *</label>
              <button
                type="button"
                onClick={() => setIsSubOpen((o) => !o)}
                className={`${FIELD_BASE} text-left flex items-center justify-between gap-2`}
              >
                <span className={selectedSub ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>
                  {selectedSub
                    ? `${selectedSub.kode_sub_kegiatan} — ${selectedSub.nama_sub_kegiatan}`
                    : "— Pilih Sub Kegiatan —"}
                </span>
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </button>
              {isSubOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      placeholder="Cari kode / nama sub kegiatan..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                    />
                  </div>
                  <div className="max-h-56 overflow-auto custom-scrollbar">
                    {filteredSubs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-400">Tidak ada sub kegiatan ditemukan.</p>
                    ) : (
                      filteredSubs.map((s) => (
                        <button
                          key={s.kode_sub_kegiatan}
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, kode_sub_kegiatan: s.kode_sub_kegiatan }))
                            setIsSubOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors ${
                            form.kode_sub_kegiatan === s.kode_sub_kegiatan ? "bg-emerald-50/60 dark:bg-emerald-500/10" : ""
                          }`}
                        >
                          <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{s.kode_sub_kegiatan}</p>
                          <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate">{s.nama_sub_kegiatan}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={LABEL}>Periode</label>
              <select value={form.periode} onChange={set("periode")} className={FIELD_BASE}>
                <option value={2027}>2027</option>
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <div>
              <label className={LABEL}>Keterangan</label>
              <textarea
                value={form.keterangan}
                onChange={set("keterangan")}
                rows={2}
                placeholder="Catatan tambahan (opsional)"
                className={FIELD_BASE}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || success}
            className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
            {isSaving ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </div>
    </div>
  )
}
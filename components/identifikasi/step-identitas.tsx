"use client"

import { FormIdentitas, CaraPengadaan, JenisPengadaan } from "@/types/identifikasi"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { useSkpd } from "@/hooks/useSkpd"
import { useRefProgram, useRefKegiatan, useRefSubKegiatan } from "@/hooks/useReferensi"
import { Building2, UserCheck, ChevronRight, AlertCircle, Pencil } from "lucide-react"

interface Props {
  data: FormIdentitas
  onChange: (data: FormIdentitas) => void
  userData: { nama: string; nama_skpd: string; kode_skpd: string; role: string }
  isAdmin?: boolean
}

export function StepIdentitas({ data, onChange, userData, isAdmin = false }: Props) {
  // Data referensi dari API (docs/program.md) — cukup kode_skpd saja
  const { data: programList, isLoading: loadingProgram } = useRefProgram(data.kode_skpd)
  const { data: kegiatanList, isLoading: loadingKegiatan } = useRefKegiatan(data.kode_skpd, data.kode_program || undefined)
  const { data: subKegiatanList, isLoading: loadingSubKegiatan } = useRefSubKegiatan(data.kode_skpd, data.kode_kegiatan || undefined)

  // Daftar SKPD dari API (untuk admin yang boleh ganti SKPD)
  const { skpdList, isLoading: isSkpdLoading } = useSkpd()

  const skpdOptions = skpdList.map((s) => ({
    value: s.kode_skpd,
    label: s.is_sub_unit ? `↳ ${s.nama_skpd}` : s.nama_skpd,
    group: s.is_sub_unit ? "Sub Unit" : "SKPD Induk",
  }))

  const handleSkpdChange = (kodeSkpd: string) => {
    const selected = skpdList.find((s) => s.kode_skpd === kodeSkpd)
    onChange({
      ...data,
      kode_skpd: kodeSkpd,
      nama_skpd: selected ? selected.nama_skpd : "",
      // Reset nomenklatur karena data berbeda per SKPD
      kode_program: "",
      nama_program: "",
      kode_kegiatan: "",
      nama_kegiatan: "",
      kode_sub_kegiatan: "",
      nama_sub_kegiatan: "",
    })
  }

  const update = (field: keyof FormIdentitas, value: string) => {
    const next = { ...data, [field]: value }
    if (field === "kode_program") {
      const prog = programList.find((p) => p.kode_program === value)
      next.nama_program = prog?.nama_program || ""
      next.kode_kegiatan = ""
      next.nama_kegiatan = ""
      next.kode_sub_kegiatan = ""
      next.nama_sub_kegiatan = ""
    }
    if (field === "kode_kegiatan") {
      const keg = kegiatanList.find((k) => k.kode_kegiatan === value)
      next.nama_kegiatan = keg?.nama_kegiatan || ""
      next.kode_sub_kegiatan = ""
      next.nama_sub_kegiatan = ""
    }
    if (field === "kode_sub_kegiatan") {
      const sub = subKegiatanList.find((s) => s.kode_sub_kegiatan === value)
      next.nama_sub_kegiatan = sub?.nama_sub_kegiatan || ""
    }
    onChange(next)
  }

  const isValid = data.kode_program && data.kode_kegiatan && data.kode_sub_kegiatan && data.cara_pengadaan &&
    (data.cara_pengadaan === "Swakelola" || data.jenis_pengadaan)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Identitas Usulan</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tentukan unit kerja, program, dan jenis pengadaan.</p>
      </div>

      {/* Read-only Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-950/40 ${isAdmin ? "border-amber-200 dark:border-amber-500/40" : "border-slate-200 dark:border-slate-800"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className={`h-3.5 w-3.5 ${isAdmin ? "text-amber-500" : "text-blue-500"}`} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Perangkat Daerah</span>
            {isAdmin && (
              <span className="ml-auto inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                <Pencil className="h-2.5 w-2.5" /> Dapat Diubah
              </span>
            )}
          </div>
          {isAdmin ? (
            <div className="space-y-1.5">
              <SearchableSelect
                options={skpdOptions}
                value={data.kode_skpd || userData.kode_skpd}
                onChange={handleSkpdChange}
                placeholder="-- Pilih SKPD / Sub Unit --"
                searchPlaceholder="Cari nama atau kode SKPD..."
                loading={isSkpdLoading}
              />
              {data.nama_skpd && (
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 truncate" title={data.nama_skpd}>
                  {data.nama_skpd}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{userData.nama_skpd}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{userData.kode_skpd}</p>
            </>
          )}
        </div>
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-1.5 mb-1">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nama KPA/PPK</span>
          </div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">{userData.nama}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{userData.role}</p>
        </div>
        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-500/5">
          <div className="flex items-center gap-1.5 mb-1">
            <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Status</span>
          </div>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Draft Baru</p>
          <p className="text-[10px] text-blue-400 mt-0.5">Menunggu pengisian</p>
        </div>
      </div>

      {/* Dropdowns */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          Nomenklatur Perencanaan SIPD
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Program <span className="text-red-500">*</span></label>
            <SearchableSelect
              options={programList.map((p) => ({
                value: p.kode_program,
                label: `${p.nama_program}`,
                group: p.nama_bidang_urusan || "Program",
              }))}
              value={data.kode_program}
              onChange={(val) => update("kode_program", val)}
              placeholder="-- Pilih Program --"
              loading={loadingProgram}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Kegiatan <span className="text-red-500">*</span></label>
            <SearchableSelect
              options={kegiatanList.map((k) => ({
                value: k.kode_kegiatan,
                label: k.nama_kegiatan,
              }))}
              value={data.kode_kegiatan}
              onChange={(val) => update("kode_kegiatan", val)}
              placeholder="-- Pilih Kegiatan --"
              disabled={!data.kode_program || loadingKegiatan}
              loading={loadingKegiatan}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Sub Kegiatan <span className="text-red-500">*</span></label>
            <SearchableSelect
              options={subKegiatanList.map((s) => ({
                value: s.kode_sub_kegiatan,
                label: s.nama_sub_kegiatan,
              }))}
              value={data.kode_sub_kegiatan}
              onChange={(val) => update("kode_sub_kegiatan", val)}
              placeholder="-- Pilih Sub Kegiatan --"
              disabled={!data.kode_kegiatan || loadingSubKegiatan}
              loading={loadingSubKegiatan}
            />
          </div>
        </div>
      </div>

      {/* Cara Pengadaan */}
      <div className="space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Cara Pengadaan <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-2 gap-3">
          {(["Penyedia", "Swakelola"] as CaraPengadaan[]).map((cara) => (
            <button key={cara} type="button" onClick={() => { onChange({ ...data, cara_pengadaan: cara, jenis_pengadaan: "" }) }} className={`p-4 rounded-xl border-2 text-left transition-all ${data.cara_pengadaan === cara ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 shadow-sm" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">{cara}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{cara === "Penyedia" ? "Melalui penyedia barang/jasa" : "Dikerjakan sendiri oleh OPD"}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Jenis Pengadaan (conditional) */}
      {data.cara_pengadaan === "Penyedia" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Jenis Pengadaan <span className="text-red-500">*</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["Barang", "Konstruksi", "Jasa Lainnya", "Konsultansi"] as JenisPengadaan[]).map((jenis) => (
              <button key={jenis} type="button" onClick={() => onChange({ ...data, jenis_pengadaan: jenis })} className={`p-3 rounded-xl border-2 text-left transition-all ${data.jenis_pengadaan === jenis ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 shadow-sm" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                <p className="text-[11px] font-semibold text-slate-900 dark:text-white">{jenis}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {!isValid && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300">Lengkapi semua field identitas untuk melanjutkan ke langkah berikutnya.</p>
        </div>
      )}
    </div>
  )
}

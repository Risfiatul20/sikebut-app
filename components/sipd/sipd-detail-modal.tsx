"use client"

import { SipdItem } from "@/types/sipd"
import { X, Building2, Layers, DollarSign, FileCode, CheckCircle2, Tag } from "lucide-react"

interface SipdDetailModalProps {
  item: SipdItem | null
  onClose: () => void
}

export function SipdDetailModal({ item, onClose }: SipdDetailModalProps) {
  if (!item) return null

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  Rincian Anggaran SIPD
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Versi {item.versi} ({item.tahun})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {item.nama_versi}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Pagu Card Highlight */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Pagu Anggaran RKA Penetapan
              </p>
              <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {formatRupiah(item.pagu)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {item.kode_sumber_dana}
              </span>
            </div>
          </div>

          {/* Unit Kerja (SKPD) */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Perangkat Daerah (SKPD / Sub Unit)
            </p>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white text-xs">
                {item.nama_skpd}
              </p>
              <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                Kode SKPD: {item.kode_skpd}
              </p>
            </div>
          </div>

          {/* Hierarki Nomenklatur Perencanaan */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Struktur Urusan, Program & Kegiatan (Permendagri 90/2019)
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {/* Urusan */}
              <div className="p-3">
                <p className="text-[10px] text-slate-400 uppercase">Urusan Pemerintahan</p>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{item.nama_urusan}</p>
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Kode: {item.kode_urusan}</p>
              </div>

              {/* Bidang Urusan */}
              <div className="p-3">
                <p className="text-[10px] text-slate-400 uppercase">Bidang Urusan</p>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{item.nama_bidang_urusan}</p>
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Kode: {item.kode_bidang_urusan}</p>
              </div>

              {/* Program */}
              <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">Program</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{item.nama_program}</p>
                <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400">Kode Program: {item.kode_program}</p>
              </div>

              {/* Kegiatan */}
              <div className="p-3">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Kegiatan</p>
                <p className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">{item.nama_kegiatan}</p>
                <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">Kode Kegiatan: {item.kode_kegiatan}</p>
              </div>

              {/* Sub Kegiatan */}
              <div className="p-3 bg-amber-50/30 dark:bg-amber-950/10">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold">Sub Kegiatan</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.nama_sub_kegiatan}</p>
                <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400">Kode Sub Kegiatan: {item.kode_sub_kegiatan}</p>
              </div>
            </div>
          </div>

          {/* Rekening Belanja & Standar Harga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rekening Belanja Akun</p>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">{item.nama_rekening}</p>
              <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{item.kode_rekening}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standar Harga / Komponen (SSH/ASB)</p>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">{item.nama_standar_harga}</p>
              <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{item.kode_standar_harga}</p>
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" /> Raw Data SIPD (dev.sipd_penetapan_apbd)
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-3.5 overflow-x-auto">
              <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

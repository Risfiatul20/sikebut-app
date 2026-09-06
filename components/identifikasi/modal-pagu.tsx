"use client"

import { useState, useMemo } from "react"
import { PaguPaketItem } from "@/types/identifikasi"
import { X, Search, CheckCircle2, AlertTriangle, Layers, Loader2 } from "lucide-react"
import { useSipdModal } from "@/hooks/useSipdModal"
import type { SipdModalLevel } from "@/types/sipd-modal"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (items: PaguPaketItem[]) => void
  currentSelections: PaguPaketItem[]
  kodeSubKegiatan: string
  kodeSkpd?: string
  tahun?: string
}

const LEVEL_ROWS: { key: "skpd" | "sub_unit" | "program" | "kegiatan" | "sub_kegiatan"; label: string }[] = [
  { key: "skpd", label: "OPD / SKPD" },
  { key: "sub_unit", label: "Sub Unit" },
  { key: "program", label: "Program" },
  { key: "kegiatan", label: "Kegiatan" },
  { key: "sub_kegiatan", label: "Sub Kegiatan" },
]

export function ModalPagu({ isOpen, onClose, onSelect, currentSelections, kodeSubKegiatan, kodeSkpd, tahun }: Props) {
  const [selected, setSelected] = useState<Map<number, number>>(() => {
    const map = new Map<number, number>()
    currentSelections.forEach((s) => map.set(s.id_sipd_penetapan, s.rencana_pagu_paket))
    return map
  })
  const [search, setSearch] = useState("")

  // Data modal RKA SIPD dari API (docs/modal_sipd.md)
  const { data: modal, isLoading } = useSipdModal(kodeSubKegiatan, kodeSkpd, tahun)

  const standarHarga = useMemo(() => modal?.standar_harga ?? [], [modal])

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return standarHarga
    return standarHarga.filter(
      (it) => it.nama_standar_harga.toLowerCase().includes(q) || it.kode_standar_harga.toLowerCase().includes(q) ||
        it.nama_rekening.toLowerCase().includes(q) || it.kode_rekening.toLowerCase().includes(q)
    )
  }, [standarHarga, search])

  const totalPagu = useMemo(() => {
    let sum = 0
    selected.forEach((v) => { sum += v })
    return sum
  }, [selected])

  const toggleItem = (item: (typeof filteredItems)[0]) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(item.id_sipd_penetapan)) {
        next.delete(item.id_sipd_penetapan)
      } else {
        next.set(item.id_sipd_penetapan, 0)
      }
      return next
    })
  }

  const updatePagu = (id: number, val: number) => {
    const item = standarHarga.find((s) => s.id_sipd_penetapan === id)
    const maxVal = item ? Number(item.sisa_pagu) : Infinity
    const clamped = Math.max(0, Math.min(val, maxVal))
    setSelected((prev) => {
      const next = new Map(prev)
      next.set(id, isNaN(clamped) ? 0 : clamped)
      return next
    })
  }

  const handleConfirm = () => {
    const items: PaguPaketItem[] = []
    selected.forEach((pagu, id) => {
      const source = standarHarga.find((s) => s.id_sipd_penetapan === id)
      if (source) {
        items.push({
          id: `pagu-${Date.now()}-${id}`,
          id_sipd_penetapan: source.id_sipd_penetapan,
          kode_standar_harga: source.kode_standar_harga,
          nama_standar_harga: source.nama_standar_harga,
          kode_rekening: source.kode_rekening,
          nama_rekening: source.nama_rekening,
          pagu_sipd: Number(source.pagu),
          pagu_tertagih: Number(source.total_kebutuhan_anggaran),
          rencana_pagu_paket: pagu,
        })
      }
    })
    onSelect(items)
    onClose()
  }

  const fmt = (v: number | string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v ?? 0))

  if (!isOpen) return null

  const LEVEL_FIELDS: Record<string, { kode: keyof SipdModalLevel; nama: keyof SipdModalLevel }> = {
    skpd: { kode: "kode_skpd", nama: "nama_skpd" },
    sub_unit: { kode: "kode_sub_unit", nama: "nama_sub_unit" },
    program: { kode: "kode_program", nama: "nama_program" },
    kegiatan: { kode: "kode_kegiatan", nama: "nama_kegiatan" },
    sub_kegiatan: { kode: "kode_sub_kegiatan", nama: "nama_sub_kegiatan" },
  }

  const renderLevelCell = (row: (typeof LEVEL_ROWS)[number], level: SipdModalLevel) => {
    const f = LEVEL_FIELDS[row.key]
    return (
      <div className="min-w-0">
        <p className="font-mono text-[10px] text-slate-400 truncate">{String(level[f.kode] ?? "-")}</p>
        <p className="font-medium text-slate-900 dark:text-white text-xs truncate" title={String(level[f.nama] ?? "")}>{String(level[f.nama] ?? "-")}</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Layers className="h-4 w-4" /></div>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Pagu Paket & Pilih Standar Harga (RKA SIPD)</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sub Kegiatan: <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{kodeSubKegiatan || "-"}</span>
                {modal?.sub_kegiatan.nama_sub_kegiatan && <span className="text-slate-400"> â€” {modal.sub_kegiatan.nama_sub_kegiatan}</span>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              Memuat rekap & standar harga dari API SIPD...
            </div>
          ) : !modal ? (
            <div className="flex items-center justify-center py-24 text-xs text-slate-400">
              Tidak ada data untuk sub kegiatan ini. (Pastikan sub kegiatan sudah dipilih di langkah Identitas.)
            </div>
          ) : (
            <div className="space-y-5 p-4">
              {/* BLOK 1: Rekapitulasi Hierarki */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Rekapitulasi Anggaran per Hierarki
                </p>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="font-semibold px-3 py-2 min-w-[200px]">Level</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu Non Pengadaan</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu Pengadaan</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu Paket (Kebutuhan)</th>
                        <th className="font-semibold px-3 py-2 text-right">Sisa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {LEVEL_ROWS.map((row) => {
                        const level = modal[row.key]
                        return (
                          <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{row.label}</p>
                              {renderLevelCell(row, level)}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-slate-900 dark:text-white">{fmt(level.total_pagu)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">{fmt(level.total_pagu_non_pengadaan)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-blue-600 dark:text-blue-400">{fmt(level.total_pagu_pengadaan)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-amber-600 dark:text-amber-400">{fmt(level.total_kebutuhan_anggaran)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{fmt(level.sisa_pagu_pengadaan)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* BLOK 2: List Standar Harga */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Daftar Standar Harga ({standarHarga.length} item)
                  </p>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari standar harga / rekening..." className="w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-[10px] uppercase text-slate-400">
                        <th className="font-semibold px-3 py-2 text-center w-10">âœ“</th>
                        <th className="font-semibold px-3 py-2 text-left">Rekening</th>
                        <th className="font-semibold px-3 py-2 text-left">Nama Standar Harga</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu SIPD</th>
                        <th className="font-semibold px-3 py-2 text-right">Kebutuhan Anggaran</th>
                        <th className="font-semibold px-3 py-2 text-right">Rencana Pagu Paket</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada standar harga yang cocok.</td></tr>
                      ) : (
                        filteredItems.map((item) => {
                          const isSelected = selected.has(item.id_sipd_penetapan)
                          return (
                            <tr key={item.id_sipd_penetapan} onClick={() => toggleItem(item)} className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/50 dark:bg-blue-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}>
                              <td className="px-3 py-2 text-center">
                                <div className={`h-5 w-5 rounded flex items-center justify-center border-2 mx-auto transition-colors ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{item.kode_rekening}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.nama_rekening}</p>
                              </td>
                              <td className="px-3 py-2">
                                <p className="font-medium text-[11px] text-slate-800 dark:text-slate-200">{item.nama_standar_harga}</p>
                                <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">{item.kode_standar_harga}</p>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{fmt(item.pagu)}</p>
                                <p className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">sisa: {fmt(item.sisa_pagu)}</p>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400">{fmt(item.total_kebutuhan_anggaran)}</p>
                              </td>
                              <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                                {isSelected ? (
                                  <input type="number" value={selected.get(item.id_sipd_penetapan) || 0} onChange={(e) => updatePagu(item.id_sipd_penetapan, Number(e.target.value))} min={0} max={Number(item.sisa_pagu)} className="w-36 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700">â€”</span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{selected.size} item dipilih â€¢ Total: <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{fmt(totalPagu)}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">Batal</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors">Konfirmasi Pemilihan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Columns, Check, RotateCcw } from "lucide-react"

export interface SipdColumnOption {
  id: string
  label: string
  category: "Struktur Organisasi & Urusan" | "Program & Kegiatan" | "Keuangan & Standar"
  defaultVisible: boolean
}

export const AVAILABLE_SIPD_COLUMNS: SipdColumnOption[] = [
  { id: "skpd", label: "SKPD / Perangkat Daerah", category: "Struktur Organisasi & Urusan", defaultVisible: true },
  { id: "urusan", label: "Urusan", category: "Struktur Organisasi & Urusan", defaultVisible: true },
  { id: "bidang_urusan", label: "Bidang Urusan", category: "Struktur Organisasi & Urusan", defaultVisible: true },
  { id: "program", label: "Program", category: "Program & Kegiatan", defaultVisible: true },
  { id: "kegiatan", label: "Kegiatan", category: "Program & Kegiatan", defaultVisible: true },
  { id: "sub_kegiatan", label: "Sub Kegiatan", category: "Program & Kegiatan", defaultVisible: true },
  { id: "sumber_dana", label: "Sumber Dana", category: "Keuangan & Standar", defaultVisible: true },
  { id: "rekening", label: "Rekening Belanja", category: "Keuangan & Standar", defaultVisible: true },
  { id: "standar_harga", label: "Standar Harga (SSH/ASB)", category: "Keuangan & Standar", defaultVisible: true },
  { id: "pagu", label: "Pagu Anggaran", category: "Keuangan & Standar", defaultVisible: true },
  { id: "aksi", label: "Aksi", category: "Keuangan & Standar", defaultVisible: true },
]

export const DEFAULT_SIPD_COLUMNS: Record<string, boolean> = {
  skpd: true,
  urusan: true,
  bidang_urusan: true,
  program: true,
  kegiatan: true,
  sub_kegiatan: true,
  sumber_dana: true,
  rekening: true,
  standar_harga: true,
  pagu: true,
  aksi: true,
}

interface SipdColumnDropdownProps {
  visibleColumns: Record<string, boolean>
  onToggleColumn: (columnId: string) => void
  onResetColumns: () => void
  onSelectAllColumns: () => void
}

export function SipdColumnDropdown({
  visibleColumns,
  onToggleColumn,
  onResetColumns,
  onSelectAllColumns,
}: SipdColumnDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeCount = Object.entries(visibleColumns).filter(
    ([id, visible]) => visible && id !== "aksi"
  ).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border text-xs font-medium transition-colors ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
        title="Sesuaikan Kolom Tabel SIPD"
      >
        <Columns className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
        <span>Pilih Kolom</span>
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {activeCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 origin-top-right rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Kolom Tabel SIPD</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Centang kolom yang ditampilkan</p>
            </div>
            <button
              type="button"
              onClick={onResetColumns}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
              title="Reset ke semua kolom default"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto p-2 space-y-3 custom-scrollbar text-xs">
            {(["Struktur Organisasi & Urusan", "Program & Kegiatan", "Keuangan & Standar"] as const).map(
              (category) => {
                const items = AVAILABLE_SIPD_COLUMNS.filter((c) => c.category === category)
                if (items.length === 0) return null

                return (
                  <div key={category} className="space-y-1">
                    <p className="px-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {category}
                    </p>
                    {items.map((col) => {
                      const isChecked = !!visibleColumns[col.id]
                      return (
                        <label
                          key={col.id}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-blue-50/60 dark:bg-blue-500/10 text-slate-900 dark:text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <span className="text-xs font-medium">{col.label}</span>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleColumn(col.id)
                            }}
                            className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                              isChecked
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )
              }
            )}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between">
            <button
              type="button"
              onClick={onSelectAllColumns}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded"
            >
              Pilih Semua
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-medium transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

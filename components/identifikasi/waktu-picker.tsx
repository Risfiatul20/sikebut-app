"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Picker Waktu (Bulan + Tahun) — kalender bulan sekali-klik.
 *
 * Perilaku:
 *  - Tampil satu kotak berisi nama bulan + tahun (mis. "Oktober 2026").
 *  - Klik → grid 12 bulan + tombol ◀ ▶ untuk pindah tahun.
 *  - Klik salah satu bulan → nilai "YYYY-MM" langsung terisi (sekali interaksi).
 *  - Nilai hanya terbentuk saat Bulan diklik; memilih tahun tidak mengubah nilai
 *    sampai bulan dipilih (tidak ada default diam-diam).
 */
interface WaktuPickerProps {
  value: string
  onChange: (v: string) => void
  className?: string
}

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

function parseValue(value: string): { year: string; month: string } {
  const m = /^(\d{4})-(\d{2})$/.exec((value || "").trim())
  return m ? { year: m[1], month: m[2] } : { year: "", month: "" }
}

export function WaktuPicker({ value, onChange, className }: WaktuPickerProps) {
  const parsed = parseValue(value)
  const [selMonth, setSelMonth] = useState(parsed.month)
  const [selYear, setSelYear] = useState(parsed.year)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Sinkronkan state internal ketika value berubah dari luar (mis. load data edit).
  useEffect(() => {
    setSelMonth(parsed.month)
    setSelYear(parsed.year)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Tutup popover saat klik di luar komponen.
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [open])

  const buttonCls =
    className ||
    "h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors w-full text-left inline-flex items-center justify-between gap-2"

  const displayYear = selYear || String(new Date().getFullYear())

  const pickMonth = (m: string) => {
    const y = selYear || String(new Date().getFullYear())
    setSelMonth(m)
    setSelYear(y)
    onChange(`${y}-${m}`)
    setOpen(false)
  }

  const changeYear = (delta: number) => {
    const next = Number(displayYear) + delta
    if (next >= 2020 && next <= 2100) setSelYear(String(next))
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={buttonCls}
        title="Pilih Bulan & Tahun"
      >
        <span className="truncate">
          {selMonth && selYear ? `${BULAN[Number(selMonth) - 1]} ${selYear}` : "Pilih Bulan & Tahun"}
        </span>
        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 animate-in zoom-in-95 fade-in duration-150">
          {/* Navigasi tahun */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={() => changeYear(-1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Tahun sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{displayYear}</span>
            <button
              type="button"
              onClick={() => changeYear(1)}
              className="h-7 w-7 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Tahun berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Grid 12 bulan */}
          <div className="grid grid-cols-3 gap-1.5">
            {BULAN.map((nama, i) => {
              const m = String(i + 1).padStart(2, "0")
              const aktif = selMonth === m && selYear === displayYear
              return (
                <button
                  key={nama}
                  type="button"
                  onClick={() => pickMonth(m)}
                  className={`h-8 rounded-lg text-[10px] font-semibold transition-colors ${
                    aktif
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300"
                  }`}
                >
                  {nama.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
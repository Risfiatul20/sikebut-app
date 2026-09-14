"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const STORAGE_KEY = "sikebut_tahun"

interface TahunContextValue {
  /** Tahun aktif yang dipilih user (default: tahun saat login / tahun berjalan). */
  tahun: number
  /** Ganti tahun → simpan ke localStorage + URL, semua halaman ikut. */
  setTahun: (tahun: number) => void
  /** Pilihan tahun: tahun berjalan ± 1, tumbuh otomatis seiring waktu. */
  tahunOptions: number[]
}

const TahunContext = createContext<TahunContextValue | null>(null)

const isValidYear = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 2000 && v <= 2100

export function TahunProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Default = tahun berjalan (tahun saat login). Baca localStorage di useEffect
  // supaya tidak terjadi hydration mismatch (server render = tahun berjalan).
  const [tahun, setTahunState] = useState<number>(() => new Date().getFullYear())

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const urlTahun = params.get("tahun")

    if (urlTahun && /^\d{4}$/.test(urlTahun)) {
      // URL lebih berkuasa (server page sudah render dengan tahun itu)
      const y = parseInt(urlTahun, 10)
      if (isValidYear(y)) {
        setTahunState(y)
        localStorage.setItem(STORAGE_KEY, String(y))
      }
      return
    }

    // Tidak ada ?tahun= di URL → pakai tahun yang lengket (localStorage)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && /^\d{4}$/.test(saved)) {
      const y = parseInt(saved, 10)
      if (isValidYear(y) && y !== new Date().getFullYear()) {
        setTahunState(y)
        // Sinkronkan ke URL supaya server page (dashboard/laporan) ikut memfilter
        router.replace(`${pathname}?tahun=${y}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const setTahun = useCallback(
    (y: number) => {
      if (!isValidYear(y)) return
      setTahunState(y)
      try {
        localStorage.setItem(STORAGE_KEY, String(y))
      } catch {
        // localStorage tidak tersedia — abaikan, tetap pakai di sesi ini
      }
      router.replace(`${pathname}?tahun=${y}`)
    },
    [pathname, router]
  )

  const now = new Date().getFullYear()
  const tahunOptions = [now - 1, now, now + 1]

  return (
    <TahunContext.Provider value={{ tahun, setTahun, tahunOptions }}>
      {children}
    </TahunContext.Provider>
  )
}

export function useTahunAktif(): TahunContextValue {
  const ctx = useContext(TahunContext)
  if (!ctx) {
    throw new Error("useTahunAktif harus dipakai di dalam <TahunProvider>")
  }
  return ctx
}
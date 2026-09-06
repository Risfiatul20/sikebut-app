"use client"

import { useState, useEffect } from "react"
import { SipdItem } from "@/types/sipd"

export interface UseSipdListOptions {
  tahun?: number
  versi?: number
  search?: string
}

/**
 * Mengambil daftar rincian Penetapan APBD dari API.
 * Backend: GET /api/v1/sipd-penetapan-apbd (via proxy /api/sipd/list)
 */
export function useSipdList(options?: UseSipdListOptions) {
  const [data, setData] = useState<SipdItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const tahun = options?.tahun
  const versi = options?.versi
  const search = options?.search

  useEffect(() => {
    let cancel = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (tahun) params.set("tahun", String(tahun))
        if (versi && versi > 0) params.set("versi", String(versi))
        if (search) params.set("search", search)
        params.set("per_page", "0")

        const res = await fetch(`/api/sipd/list?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat data SIPD: ${res.status}`)

        const json = await res.json()
        if (!cancel) {
          setData(json.data ?? [])
        }
      } catch (err) {
        if (!cancel) setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      } finally {
        if (!cancel) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancel = true
    }
  }, [tahun, versi, search, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, isLoading, error, reload }
}

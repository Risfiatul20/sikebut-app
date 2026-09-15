"use client"

import { useState, useEffect } from "react"
import { SipdItem } from "@/types/sipd"

export interface UseSipdListOptions {
  tahun?: number
  versi?: number
  search?: string
  page?: number
  per_page?: number
}

export interface SipdPaginationMeta {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
  from?: number
  to?: number
}

/**
 * Mengambil daftar rincian Penetapan APBD dari API.
 * Backend: GET /api/v1/sipd-penetapan-apbd (via proxy /api/sipd/list)
 */
export function useSipdList(options?: UseSipdListOptions) {
  const [data, setData] = useState<SipdItem[]>([])
  const [meta, setMeta] = useState<SipdPaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const tahun = options?.tahun
  const versi = options?.versi
  const search = options?.search
  const page = options?.page ?? 1
  const per_page = options?.per_page ?? 10

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
        params.set("page", String(page))
        params.set("per_page", String(per_page))

        const res = await fetch(`/api/sipd/list?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat data SIPD: ${res.status}`)

        const json = await res.json()
        if (!cancel) {
          setData(json.data ?? [])
          setMeta(json.meta ?? null)
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
  }, [tahun, versi, search, page, per_page, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, meta, isLoading, error, reload }
}

"use client"

import { useState, useEffect } from "react"

export interface RkbmdPaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

export interface RkbmdListResult<T> {
  data: T[]
  meta?: RkbmdPaginationMeta
  isLoading: boolean
  error: string | null
  reload: () => void
}

/**
 * Hook data list RKBMD (pengadaan / pemeliharaan) yang mengikuti paginasi server-side Laravel.
 * Membaca meta.current_page, meta.last_page, meta.total dari response API.
 */
export function useRkbmdList<T>(options: {
  endpoint: "pengadaan" | "pemeliharaan"
  search?: string
  kode_skpd?: string
  periode?: number
  page?: number
  perPage?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
}): RkbmdListResult<T> {
  const [data, setData] = useState<T[]>([])
  const [meta, setMeta] = useState<RkbmdPaginationMeta | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const {
    endpoint,
    search,
    kode_skpd,
    periode,
    page,
    perPage,
    sortBy,
    sortDirection,
  } = options

  useEffect(() => {
    let cancel = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page ?? 1),
          per_page: String(perPage ?? 10),
          periode: String(periode ?? 2026),
          sort_by: sortBy ?? "id",
          sort_direction: sortDirection ?? "desc",
        })
        if (search) params.set("search", search)
        if (kode_skpd && kode_skpd !== "ALL") params.set("kode_skpd", kode_skpd)

        const res = await fetch(`/api/rkbmd/${endpoint}?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat data RKBMD: ${res.status}`)

        const json = await res.json()
        if (!cancel) {
          setData(json.data ?? [])
          setMeta(json.meta)
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
  }, [endpoint, search, kode_skpd, periode, page, perPage, sortBy, sortDirection, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, meta, isLoading, error, reload }
}

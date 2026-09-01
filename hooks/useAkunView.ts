"use client"

import { useState, useEffect } from "react"
import { AkunViewItem, RefAkunViewListResponse } from "@/types/akun-v2"

export interface UseAkunViewOptions {
  search?: string
  kode2?: string
  kode3?: string
  kode4?: string
  kode5?: string
  b?: boolean
  r?: boolean
  h?: boolean
  t?: boolean
  page?: number
  perPage?: number
}

/**
 * Hook untuk mengambil daftar kode akun (view flat berjenjang) dari
 * API /api/ref-akun/view (proxy ke /api/v1/ref-akun/view)
 * Mengacu pada format docs/kode-akun-v2.md
 */
export function useAkunView(options?: UseAkunViewOptions) {
  const [data, setData] = useState<AkunViewItem[]>([])
  const [meta, setMeta] = useState<RefAkunViewListResponse["meta"] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const search = options?.search
  const kode2 = options?.kode2
  const kode3 = options?.kode3
  const kode4 = options?.kode4
  const kode5 = options?.kode5
  const b = options?.b
  const r = options?.r
  const h = options?.h
  const t = options?.t
  const page = options?.page ?? 1
  const perPage = options?.perPage ?? 15

  useEffect(() => {
    let cancel = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (kode2) params.set("kode_2", kode2)
        if (kode3) params.set("kode_3", kode3)
        if (kode4) params.set("kode_4", kode4)
        if (kode5) params.set("kode_5", kode5)
        if (b !== undefined) params.set("b", String(b))
        if (r !== undefined) params.set("r", String(r))
        if (h !== undefined) params.set("h", String(h))
        if (t !== undefined) params.set("t", String(t))
        params.set("per_page", String(perPage))
        params.set("page", String(page))

        const res = await fetch(`/api/ref-akun/view?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat data: ${res.status}`)

        const json: RefAkunViewListResponse = await res.json()
        if (!cancel) {
          setData(json.data || [])
          setMeta(json.meta)
        }
      } catch (err) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        }
      } finally {
        if (!cancel) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      cancel = true
    }
  }, [search, kode2, kode3, kode4, kode5, b, r, h, t, page, perPage, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, meta, isLoading, error, reload }
}

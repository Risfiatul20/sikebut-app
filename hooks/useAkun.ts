"use client"

import { useState, useEffect } from "react"
import { AkunItem, RefAkunListResponse } from "@/types/akun"

interface UseAkunOptions {
  search?: string
  level?: number | null
  parent?: string
  b?: boolean
  r?: boolean
  h?: boolean
  t?: boolean
}

/**
 * Hook untuk mengambil daftar kode akun dari API /api/ref-akun (proxy ke /api/v1/ref-akun)
 * Mengacu pada format docs/kode-akun.md
 */
export function useAkun(options?: UseAkunOptions) {
  const [akunList, setAkunList] = useState<AkunItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const search = options?.search
  const level = options?.level
  const parent = options?.parent
  const b = options?.b
  const r = options?.r
  const h = options?.h
  const t = options?.t

  useEffect(() => {
    let cancel = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (search) params.set("search", search)
        if (level !== undefined && level !== null) params.set("level", String(level))
        if (parent) params.set("parent", parent)
        if (b !== undefined) params.set("b", String(b))
        if (r !== undefined) params.set("r", String(r))
        if (h !== undefined) params.set("h", String(h))
        if (t !== undefined) params.set("t", String(t))

        const res = await fetch(`/api/ref-akun?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat Kode Akun: ${res.status}`)

        const json: RefAkunListResponse = await res.json()
        if (!cancel) {
          setAkunList(json.data || [])
        }
      } catch (err) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        }
      } finally {
        if (!cancel) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancel = true
    }
  }, [search, level, parent, b, r, h, t, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { akunList, isLoading, error, reload }
}

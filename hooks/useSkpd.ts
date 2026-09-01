"use client"

import { useState, useEffect } from "react"
import { RefSkpd } from "@/types/skpd"

/**
 * Hook untuk mengambil daftar SKPD dari API /api/ref-skpd (proxy ke /api/v1/ref-skpd)
 * Mengacu pada format docs/skpd.md
 *
 * Caching strategy:
 * - Module-level memory cache (shared across ALL component instances)
 * - TTL-based expiration (1 jam)
 * - Auto-refetch saat parameter berubah
 * - reload() untuk memaksa fetch ulang
 */

const CACHE_TTL = 60 * 60 * 1000 // 1 jam

interface SkpdCacheEntry {
  data: RefSkpd[]
  fetchedAt: number
  paramsKey: string
}

// Cache di level modul: dibagi oleh semua instance useSkpd di seluruh aplikasi
let moduleCache: SkpdCacheEntry | null = null

function buildParams(options?: { isSubUnit?: boolean; parentKode?: string }): string {
  const params = new URLSearchParams()
  if (options?.isSubUnit !== undefined) params.set("is_sub_unit", String(options.isSubUnit))
  if (options?.parentKode) params.set("parent_kode_skpd", options.parentKode)
  params.set("sort_by", "nama_skpd")
  params.set("sort_direction", "asc")
  return params.toString()
}

export function useSkpd(options?: { isSubUnit?: boolean; parentKode?: string }) {
  const [skpdList, setSkpdList] = useState<RefSkpd[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const paramsKey = buildParams(options)

  useEffect(() => {
    let cancel = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        // 1. Cek cache module-level: data fresh + params sama → langsung pakai
        if (moduleCache && moduleCache.paramsKey === paramsKey && Date.now() - moduleCache.fetchedAt < CACHE_TTL) {
          if (!cancel) setSkpdList(moduleCache.data)
          return
        }

        // 2. Cache miss / expired → fetch ke API
        const res = await fetch(`/api/ref-skpd?${paramsKey}`)
        if (!res.ok) throw new Error(`Gagal memuat SKPD: ${res.status}`)

        const json = await res.json()
        const data: RefSkpd[] = json.data || []

        // 3. Simpan ke cache module-level
        moduleCache = { data, fetchedAt: Date.now(), paramsKey }

        if (!cancel) setSkpdList(data)
      } catch (err) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan")
          // 4. Fallback: kalau fetch gagal tapi ada cache lama, tetap tampilkan
          if (moduleCache && moduleCache.paramsKey === paramsKey) {
            setSkpdList(moduleCache.data)
          }
        }
      } finally {
        if (!cancel) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      cancel = true
    }
  }, [paramsKey, refreshTrigger])

  // Force refetch (misal setelah admin ubah struktur OPD)
  const reload = () => {
    moduleCache = null
    setRefreshTrigger((prev) => prev + 1)
  }

  return { skpdList, isLoading, error, reload }
}

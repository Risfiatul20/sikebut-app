"use client"

import { useState, useEffect } from "react"
import { SipdItem } from "@/types/sipd"

const TTL = 60 * 60 * 1000 // 1 jam

interface CacheEntry {
  data: SipdItem[]
  fetchedAt: number
}

const cache = new Map<string, CacheEntry>()

/**
 * Daftar rincian APBD (sipd_penetapan_apbd) per sub kegiatan.
 * Backend: GET /api/v1/sipd-penetapan-apbd?per_page=0&kode_sub_kegiatan=...
 * kode_sub_kegiatan wajib — tanpa ini tidak ada fetch.
 */
export function useSipdApbd(kodeSubKegiatan: string) {
  const [data, setData] = useState<SipdItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let cancel = false

    if (!kodeSubKegiatan) return

    const url = `/api/sipd/penetapan-apbd?kode_sub_kegiatan=${encodeURIComponent(kodeSubKegiatan)}`

    async function load() {
      if (!kodeSubKegiatan) {
        setData([])
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      const hit = cache.get(url)
      if (hit && Date.now() - hit.fetchedAt < TTL) {
        if (!cancel) setData(hit.data)
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Gagal memuat data APBD: ${res.status}`)
        const json = await res.json()
        const list = (json.data ?? []) as SipdItem[]
        cache.set(url, { data: list, fetchedAt: Date.now() })
        if (!cancel) setData(list)
      } catch (err) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan")
          if (hit) setData(hit.data)
        }
      } finally {
        if (!cancel) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancel = true
    }
  }, [kodeSubKegiatan, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, isLoading, error, reload }
}

"use client"

import { useState, useEffect } from "react"
import { SipdModalData, SipdModalApiResponse } from "@/types/sipd-modal"

const TTL = 60 * 60 * 1000 // 1 jam

interface CacheEntry {
  data: SipdModalData
  fetchedAt: number
}

const cache = new Map<string, CacheEntry>()

/**
 * Data modal pagu RKA SIPD per sub kegiatan.
 * Backend: GET /api/v1/sipd-penetapan-apbd/modal
 * Berisi rekap hierarki (skpd → sub_kegiatan) + list standar harga.
 * kode_sub_kegiatan wajib — tanpa ini tidak ada fetch.
 */
export function useSipdModal(kodeSubKegiatan: string, kodeSkpd?: string, tahun?: string) {
  const [data, setData] = useState<SipdModalData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let cancel = false

    if (!kodeSubKegiatan) return

    const params = new URLSearchParams({ kode_sub_kegiatan: kodeSubKegiatan })
    if (kodeSkpd) params.set("kode_skpd", kodeSkpd)
    if (tahun) params.set("tahun", tahun)
    const url = `/api/sipd/penetapan-apbd/modal?${params.toString()}`

    async function load() {
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
        if (!res.ok) throw new Error(`Gagal memuat modal SIPD: ${res.status}`)
        const json = (await res.json()) as SipdModalApiResponse
        const inner = json.data
        cache.set(url, { data: inner, fetchedAt: Date.now() })
        if (!cancel) setData(inner)
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
  }, [kodeSubKegiatan, kodeSkpd, tahun, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, isLoading, error, reload }
}

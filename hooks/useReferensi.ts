"use client"

import { useState, useEffect } from "react"
import { ProgramRef, KegiatanRef, SubKegiatanRef } from "@/types/referensi"

const TTL = 60 * 60 * 1000 // 1 jam

interface CacheEntry {
  data: unknown[]
  fetchedAt: number
}

// Module-level cache: dibagi semua instance hook di aplikasi
const cache = new Map<string, CacheEntry>()

function useReferensi<T>(
  endpoint: "program" | "kegiatan" | "sub-kegiatan",
  params: Record<string, string | undefined>
) {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const paramsKey = JSON.stringify(params)
  const hasSkpd = Boolean(params.kode_skpd)

  useEffect(() => {
    let cancel = false

    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v)
    })
    qs.set("per_page", "0")
    const url = `/api/referensi/${endpoint}?${qs.toString()}`

    async function load() {
      // kode_skpd wajib: tanpa ini, data tidak diambil
      if (!hasSkpd) {
        if (!cancel) {
          setData([])
          setIsLoading(false)
          setError(null)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      const hit = cache.get(url)
      if (hit && Date.now() - hit.fetchedAt < TTL) {
        if (!cancel) setData(hit.data as T[])
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Gagal memuat data referensi: ${res.status}`)
        const json = await res.json()
        const list = (json.data ?? []) as T[]
        cache.set(url, { data: list, fetchedAt: Date.now() })
        if (!cancel) setData(list)
      } catch (err) {
        if (!cancel) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan")
          if (hit) setData(hit.data as T[])
        }
      } finally {
        if (!cancel) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancel = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, isLoading, error, reload }
}

export function useRefProgram(kodeSkpd: string) {
  return useReferensi<ProgramRef>("program", { kode_skpd: kodeSkpd })
}

export function useRefKegiatan(kodeSkpd: string, kodeProgram?: string) {
  return useReferensi<KegiatanRef>("kegiatan", { kode_skpd: kodeSkpd, kode_program: kodeProgram })
}

export function useRefSubKegiatan(kodeSkpd: string, kodeKegiatan?: string) {
  return useReferensi<SubKegiatanRef>("sub-kegiatan", { kode_skpd: kodeSkpd, kode_kegiatan: kodeKegiatan })
}

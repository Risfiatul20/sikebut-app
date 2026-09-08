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
 *
 * Data dimuat SEKALI (tanpa param — backend sudah melakukan scoping per user),
 * lalu filtering & pagination dilakukan client-side agar interaksi instan
 * (tidak ada request 3 detik per ketikan pencarian).
 */
export function useAkun(options?: UseAkunOptions) {
  const [akunList, setAkunList] = useState<AkunItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const parent = options?.parent

  useEffect(() => {
    let cancel = false

    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (parent) params.set("parent", parent)

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
  }, [parent, refreshTrigger])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { akunList, isLoading, error, reload }
}

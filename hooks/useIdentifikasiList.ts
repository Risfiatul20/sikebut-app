"use client"

import { useState, useEffect } from "react"
import { IdentifikasiKebutuhan, IdentifikasiListResponse } from "@/types/identifikasi"

export interface UseIdentifikasiListOptions {
  search?: string
  statusReview?: string
  caraPengadaan?: string
  jenisPengadaan?: string
  kodeProgram?: string
  kodeKegiatan?: string
  kodeSubKegiatan?: string
  kodeSkpd?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
  page?: number
  perPage?: number
}

export function useIdentifikasiList(options?: UseIdentifikasiListOptions) {
  const [data, setData] = useState<IdentifikasiKebutuhan[]>([])
  const [meta, setMeta] = useState<IdentifikasiListResponse["meta"] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const search = options?.search
  const statusReview = options?.statusReview
  const caraPengadaan = options?.caraPengadaan
  const jenisPengadaan = options?.jenisPengadaan
  const kodeProgram = options?.kodeProgram
  const kodeKegiatan = options?.kodeKegiatan
  const kodeSubKegiatan = options?.kodeSubKegiatan
  const kodeSkpd = options?.kodeSkpd
  const sortBy = options?.sortBy ?? "id"
  const sortDirection = options?.sortDirection ?? "desc"
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
        if (statusReview && statusReview !== "ALL") params.set("status_review", statusReview)
        if (caraPengadaan && caraPengadaan !== "ALL") params.set("cara_pengadaan", caraPengadaan)
        if (jenisPengadaan && jenisPengadaan !== "ALL") params.set("jenis_pengadaan", jenisPengadaan)
        if (kodeProgram) params.set("kode_program", kodeProgram)
        if (kodeKegiatan) params.set("kode_kegiatan", kodeKegiatan)
        if (kodeSubKegiatan) params.set("kode_sub_kegiatan", kodeSubKegiatan)
        if (kodeSkpd && kodeSkpd !== "ALL") params.set("kode_skpd", kodeSkpd)

        params.set("sort_by", sortBy)
        params.set("sort_direction", sortDirection)
        params.set("page", String(page))
        params.set("per_page", String(perPage))

        const res = await fetch(`/api/identifikasi?${params.toString()}`)
        if (!res.ok) throw new Error(`Gagal memuat data identifikasi kebutuhan: ${res.status}`)

        const json: IdentifikasiListResponse = await res.json()
        if (!cancel) {
          setData(json.data || [])
          setMeta(json.meta)
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
  }, [
    search,
    statusReview,
    caraPengadaan,
    jenisPengadaan,
    kodeProgram,
    kodeKegiatan,
    kodeSubKegiatan,
    kodeSkpd,
    sortBy,
    sortDirection,
    page,
    perPage,
    refreshTrigger,
  ])

  const reload = () => setRefreshTrigger((prev) => prev + 1)

  return { data, meta, isLoading, error, reload }
}

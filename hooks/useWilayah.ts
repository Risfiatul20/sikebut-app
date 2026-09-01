"use client"

import { useState, useCallback } from "react"
import type { WilayahItem, WilayahResponse } from "@/types/identifikasi"

const BASE_URL = "/api/wilayah"
const CACHE: Record<string, WilayahItem[]> = {}

async function fetchWilayah(path: string): Promise<WilayahItem[]> {
  if (CACHE[path]) return CACHE[path]
  try {
    const res = await fetch(`${BASE_URL}?path=${encodeURIComponent(path)}`)
    if (!res.ok) return []
    const json: WilayahResponse = await res.json()
    CACHE[path] = json.data || []
    return CACHE[path]
  } catch {
    return []
  }
}

export function useWilayah() {
  const [provinsiList, setProvinsiList] = useState<WilayahItem[]>([])
  const [kabupatenList, setKabupatenList] = useState<WilayahItem[]>([])
  const [kecamatanList, setKecamatanList] = useState<WilayahItem[]>([])
  const [loading, setLoading] = useState({ provinsi: false, kabupaten: false, kecamatan: false })

  const loadProvinsi = useCallback(async () => {
    if (provinsiList.length > 0) return
    setLoading((p) => ({ ...p, provinsi: true }))
    const data = await fetchWilayah("provinces.json")
    setProvinsiList(data)
    setLoading((p) => ({ ...p, provinsi: false }))
  }, [provinsiList.length])

  const loadKabupaten = useCallback(async (provinsiCode: string) => {
    setKabupatenList([])
    setKecamatanList([])
    if (!provinsiCode) return
    setLoading((p) => ({ ...p, kabupaten: true }))
    const data = await fetchWilayah(`regencies/${provinsiCode}.json`)
    setKabupatenList(data)
    setLoading((p) => ({ ...p, kabupaten: false }))
  }, [])

  const loadKecamatan = useCallback(async (kabupatenCode: string) => {
    setKecamatanList([])
    if (!kabupatenCode) return
    setLoading((p) => ({ ...p, kecamatan: true }))
    const data = await fetchWilayah(`districts/${kabupatenCode}.json`)
    setKecamatanList(data)
    setLoading((p) => ({ ...p, kecamatan: false }))
  }, [])

  return { provinsiList, kabupatenList, kecamatanList, loading, loadProvinsi, loadKabupaten, loadKecamatan }
}

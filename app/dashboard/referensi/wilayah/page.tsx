"use client"

import { useState, useEffect } from "react"
import { Map, ChevronRight, Loader2, Globe, Building2, MapPin } from "lucide-react"
import type { WilayahItem } from "@/types/identifikasi"

export default function DataWilayahPage() {
  const [provinsiList, setProvinsiList] = useState<WilayahItem[]>([])
  const [selectedProvinsi, setSelectedProvinsi] = useState<string>("")
  const [kabupatenList, setKabupatenList] = useState<WilayahItem[]>([])
  const [selectedKabupaten, setSelectedKabupaten] = useState<string>("")
  const [kecamatanList, setKecamatanList] = useState<WilayahItem[]>([])
  const [loadingProvinsi, setLoadingProvinsi] = useState(false)
  const [loadingKabupaten, setLoadingKabupaten] = useState(false)
  const [loadingKecamatan, setLoadingKecamatan] = useState(false)

  useEffect(() => {
    let cancel = false
    async function load() {
      setLoadingProvinsi(true)
      try {
        const res = await fetch("/api/wilayah?path=provinces.json")
        if (!res.ok) return
        const json = await res.json()
        if (!cancel) setProvinsiList(json.data || [])
      } finally {
        if (!cancel) setLoadingProvinsi(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [])

  useEffect(() => {
    if (!selectedProvinsi) return
    let cancel = false
    async function load() {
      setLoadingKabupaten(true)
      setKecamatanList([])
      setSelectedKabupaten("")
      try {
        const res = await fetch(`/api/wilayah?path=${encodeURIComponent(`regencies/${selectedProvinsi}.json`)}`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancel) setKabupatenList(json.data || [])
      } finally {
        if (!cancel) setLoadingKabupaten(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [selectedProvinsi])

  useEffect(() => {
    if (!selectedKabupaten) return
    let cancel = false
    async function load() {
      setLoadingKecamatan(true)
      try {
        const res = await fetch(`/api/wilayah?path=${encodeURIComponent(`districts/${selectedKabupaten}.json`)}`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancel) setKecamatanList(json.data || [])
      } finally {
        if (!cancel) setLoadingKecamatan(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [selectedKabupaten])

  const selectedProvName = provinsiList.find((p) => p.code === selectedProvinsi)?.name || ""
  const selectedKabName = kabupatenList.find((k) => k.code === selectedKabupaten)?.name || ""

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Map className="h-4 w-4" />
          </span>
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Data Wilayah Indonesia</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Referensi wilayah administratif Indonesia dari <code className="font-mono text-[11px]">wilayah.id</code> API. Digunakan untuk form multi-lokasi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Provinsi */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" /> Provinsi
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{provinsiList.length} data</span>
          </div>
          {loadingProvinsi ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-blue-500" /></div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {provinsiList.map((p) => (
                <button key={p.code} onClick={() => setSelectedProvinsi(p.code)} className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors text-xs ${selectedProvinsi === p.code ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold" : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"}`}>
                  <span>{p.name}</span>
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${selectedProvinsi === p.code ? "rotate-90 text-blue-500" : "text-slate-400"}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Kabupaten/Kota */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-500" /> Kabupaten / Kota
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{selectedProvinsi ? `${kabupatenList.length} data` : "Pilih provinsi dulu"}</span>
          </div>
          {!selectedProvinsi ? (
            <div className="flex items-center justify-center p-8 text-[11px] text-slate-400">Pilih provinsi di panel kiri</div>
          ) : loadingKabupaten ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {kabupatenList.map((k) => (
                <button key={k.code} onClick={() => setSelectedKabupaten(k.code)} className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors text-xs ${selectedKabupaten === k.code ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold" : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"}`}>
                  <span>{k.name}</span>
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${selectedKabupaten === k.code ? "rotate-90 text-emerald-500" : "text-slate-400"}`} />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Kecamatan */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-500" /> Kecamatan
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{selectedKabupaten ? `${kecamatanList.length} data` : "Pilih kab/kota dulu"}</span>
          </div>
          {!selectedKabupaten ? (
            <div className="flex items-center justify-center p-8 text-[11px] text-slate-400">Pilih kabupaten/kota di panel tengah</div>
          ) : loadingKecamatan ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-amber-500" /></div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
              {kecamatanList.map((k) => (
                <div key={k.code} className="px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between">
                  <span>{k.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{k.code}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Breadcrumb Path */}
      {selectedProvinsi && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-2xs flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium">{selectedProvName}</span>
          {selectedKabupaten && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="font-medium">{selectedKabName}</span>
            </>
          )}
          {kecamatanList.length > 0 && (
            <span className="text-slate-400 ml-1">— {kecamatanList.length} kecamatan</span>
          )}
        </div>
      )}
    </div>
  )
}

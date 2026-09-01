"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { FlaskConical, Play, Loader2, Code2, Table2, Layers, X, CheckCircle2, AlertTriangle } from "lucide-react"
import type { SipdModalApiResponse, SipdModalData, SipdModalLevel } from "@/types/sipd-modal"

type ViewMode = "rekapitulasi" | "standar" | "raw"

const fmt = (v: number | string) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v ?? 0))

export default function ApiTesterPage() {
  const { data: session } = useSession()

  const [kodeSubKegiatan, setKodeSubKegiatan] = useState("")
  const [kodeSkpd, setKodeSkpd] = useState(session?.user?.kodeSkpd ?? "")
  const [tahun, setTahun] = useState("2026")
  const [viewMode, setViewMode] = useState<ViewMode>("rekapitulasi")

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    status: number
    durationMs: number
    url: string
    json: (SipdModalApiResponse & { error?: string }) | null
    raw: string
  } | null>(null)

  const testApi = useCallback(async () => {
    setIsLoading(true)
    setResult(null)

    const params = new URLSearchParams()
    params.set("kode_sub_kegiatan", kodeSubKegiatan)
    if (kodeSkpd) params.set("kode_skpd", kodeSkpd)
    if (tahun) params.set("tahun", tahun)

    const url = `/api/sipd/penetapan-apbd/modal?${params.toString()}`
    const start = performance.now()

    try {
      const res = await fetch(url)
      const durationMs = Math.round(performance.now() - start)
      const raw = await res.text()

      let json = null
      try {
        json = JSON.parse(raw)
      } catch {
        json = null
      }

      setResult({ status: res.status, durationMs, url, json, raw })
    } catch (err) {
      setResult({
        status: 0,
        durationMs: Math.round(performance.now() - start),
        url,
        json: { error: err instanceof Error ? err.message : "Network error" } as never,
        raw: String(err),
      })
    } finally {
      setIsLoading(false)
    }
  }, [kodeSubKegiatan, kodeSkpd, tahun])

  const isSuccess = result?.status !== undefined && result.status >= 200 && result.status < 300

  const LEVEL_FIELDS: Record<string, { kode: keyof SipdModalLevel; nama: keyof SipdModalLevel }> = {
    skpd: { kode: "kode_skpd", nama: "nama_skpd" },
    sub_unit: { kode: "kode_sub_unit", nama: "nama_sub_unit" },
    program: { kode: "kode_program", nama: "nama_program" },
    kegiatan: { kode: "kode_kegiatan", nama: "nama_kegiatan" },
    sub_kegiatan: { kode: "kode_sub_kegiatan", nama: "nama_sub_kegiatan" },
  }

  const LEVELS: { key: keyof SipdModalData; label: string }[] = [
    { key: "skpd", label: "OPD / SKPD" },
    { key: "sub_unit", label: "Sub Unit" },
    { key: "program", label: "Program" },
    { key: "kegiatan", label: "Kegiatan" },
    { key: "sub_kegiatan", label: "Sub Kegiatan" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FlaskConical className="h-4 w-4" />
          </span>
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            API Tester — Modal Pagu SIPD
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Uji konsumsi API <code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">GET /api/v1/sipd-penetapan-apbd/modal</code> dan lihat respon datanya.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Request Builder */}
        <section className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs p-4 space-y-4 self-start">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Play className="h-3.5 w-3.5 text-blue-500" />
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Builder Request</h2>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              kode_sub_kegiatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kodeSubKegiatan}
              onChange={(e) => setKodeSubKegiatan(e.target.value)}
              placeholder="1.01.02.1.01.0036"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            />
            {(session?.user?.subKegiatan ?? []).length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {(session?.user?.subKegiatan ?? []).slice(0, 3).map((s) => (
                  <button
                    key={s.kode_sub_kegiatan}
                    type="button"
                    onClick={() => setKodeSubKegiatan(s.kode_sub_kegiatan)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    title={s.nama_sub_kegiatan}
                  >
                    {s.kode_sub_kegiatan}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                kode_skpd
              </label>
              <input
                type="text"
                value={kodeSkpd}
                onChange={(e) => setKodeSkpd(e.target.value)}
                placeholder="opsional"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">tahun</label>
              <input
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                placeholder="2026"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={testApi}
            disabled={isLoading || !kodeSubKegiatan.trim()}
            className="w-full h-9 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isLoading ? "Menjalankan..." : "Jalankan Request"}
          </button>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Endpoint</p>
            <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all leading-relaxed">
              GET /api/v1/sipd-penetapan-apbd/modal
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Auth: <span className="font-mono text-emerald-600 dark:text-emerald-400">Bearer &lt;session token&gt;</span>
            </p>
          </div>
        </section>

        {/* Response Viewer */}
        <section className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden flex flex-col min-h-[420px]">
          {/* Status bar */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center gap-3">
            {result ? (
              <>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${isSuccess ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300"}`}>
                  {isSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  HTTP {result.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{result.durationMs} ms</span>
                {result.json?._mock && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    fallback mock (backend offline)
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-slate-400">Belum ada response — isi kode_sub_kegiatan lalu jalankan request.</span>
            )}

            {result && (
              <div className="ml-auto flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                {([
                  { id: "rekapitulasi", label: "Rekap", icon: Layers },
                  { id: "standar", label: "Standar Harga", icon: Table2 },
                  { id: "raw", label: "Raw JSON", icon: Code2 },
                ] as { id: ViewMode; label: string; icon: React.ElementType }[]).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setViewMode(t.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold inline-flex items-center gap-1 transition-colors ${
                      viewMode === t.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <t.icon className="h-3 w-3" />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex items-center justify-center gap-2 text-xs text-slate-400 py-20">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                Menunggu response API...
              </div>
            ) : !result ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-slate-400 py-20">
                <FlaskConical className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                <span>Mulai dengan mengisi parameter di panel kiri.</span>
              </div>
            ) : result.json?.error ? (
              <div className="p-6">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">Error</p>
                <pre className="font-mono text-[11px] text-red-700 dark:text-red-300 whitespace-pre-wrap bg-red-50/50 dark:bg-red-950/20 rounded-lg p-3">
                  {result.raw}
                </pre>
              </div>
            ) : viewMode === "raw" ? (
              <pre className="p-4 font-mono text-[11px] text-emerald-700 dark:text-emerald-300 whitespace-pre-wrap">
                {JSON.stringify(result.json, null, 2)}
              </pre>
            ) : viewMode === "rekapitulasi" ? (
              <div className="p-4 space-y-3">
                {LEVELS.map((lv) => {
                  const level = result.json?.data?.[lv.key] as SipdModalLevel | undefined
                  if (!level) return null
                  const f = LEVEL_FIELDS[lv.key]
                  const levelKode = String(level[f.kode] ?? "-")
                  const levelNama = String(level[f.nama] ?? "-")
                  return (
                    <div key={lv.key} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{lv.label}</p>
                        <p className="font-mono text-[10px] text-slate-400">{levelKode}</p>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white mb-3">{levelNama}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { label: "Total Pagu", value: level.total_pagu, cls: "text-slate-900 dark:text-white" },
                          { label: "Pagu Pengadaan", value: level.total_pagu_pengadaan, cls: "text-blue-600 dark:text-blue-400" },
                          { label: "Pagu Non-Pengadaan", value: level.total_pagu_non_pengadaan, cls: "text-slate-500 dark:text-slate-400" },
                          { label: "Kebutuhan Anggaran", value: level.total_kebutuhan_anggaran, cls: "text-amber-600 dark:text-amber-400" },
                          { label: "Sisa Pagu Pengadaan", value: level.sisa_pagu_pengadaan, cls: "text-emerald-600 dark:text-emerald-400" },
                        ].map((m) => (
                          <div key={m.label} className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-2">
                            <p className="text-[9px] text-slate-400">{m.label}</p>
                            <p className={`font-mono text-[11px] font-semibold ${m.cls} mt-0.5`}>{fmt(m.value ?? 0)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="font-semibold px-3 py-2">Rekening</th>
                        <th className="font-semibold px-3 py-2">Standar Harga</th>
                        <th className="font-semibold px-3 py-2">Sumber Dana</th>
                        <th className="font-semibold px-3 py-2">Indikator</th>
                        <th className="font-semibold px-3 py-2 text-right">Pagu</th>
                        <th className="font-semibold px-3 py-2 text-right">Sisa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(result.json?.data?.standar_harga ?? []).length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-400">Tidak ada data standar harga.</td></tr>
                      ) : (
                        (result.json?.data?.standar_harga ?? []).map((s) => (
                          <tr key={s.id_sipd_penetapan} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3 py-2">
                              <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">{s.kode_rekening}</p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300">{s.nama_rekening}</p>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{s.kode_standar_harga}</p>
                              <p className="text-[11px] text-slate-700 dark:text-slate-200">{s.nama_standar_harga}</p>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-mono text-[10px] text-slate-500">{s.kode_sumber_dana}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.nama_sumber_dana}</p>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {s.is_belanja_pengadaan && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300">B</span>}
                                {s.is_rkbmd_pengadaan && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">R</span>}
                                {s.is_rkbmd_pemeliharaan_rehab && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300">H</span>}
                                {s.is_rkbmd_pemeliharaan_rutin && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">T</span>}
                                {!s.is_belanja_pengadaan && !s.is_rkbmd_pengadaan && !s.is_rkbmd_pemeliharaan_rehab && !s.is_rkbmd_pemeliharaan_rutin && <span className="text-slate-300">—</span>}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-slate-900 dark:text-white">{fmt(s.pagu)}</td>
                            <td className="px-3 py-2 text-right font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{fmt(s.sisa_pagu)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* URL yang dikonsumsi */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs flex items-start gap-2">
          <X className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">URL yang dikonsumsi (melalui proxy Next.js)</p>
            <p className="font-mono text-[10px] text-blue-700 dark:text-blue-300 break-all">{result.url}</p>
          </div>
        </div>
      )}
    </div>
  )
}

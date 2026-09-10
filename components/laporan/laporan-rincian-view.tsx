"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Loader2, RefreshCw, Inbox, Wallet, Building2, Layers, FileSpreadsheet, Printer, MapPin, Package, BadgeCheck, Coins, CalendarRange, GitBranch } from "lucide-react"
import { LaporanPaketResponse, RincianPaketRow } from "@/types/laporan-paket"

const fmtRp = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0))

const fmtAngka = (v: number | string) =>
  new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(v ?? 0))

const fmtTgl = (iso: string | null) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return iso
  }
}

/** Satu baris field label: nilai di dalam kartu — rapi & tidak pernah keluar tabel. */
function FieldRow({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-0.5 sm:gap-2 px-3 py-1.5 sm:py-2 ${full ? "sm:col-span-2" : ""}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 pt-0.5">{label}</p>
      <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug min-w-0 break-words">{children}</div>
    </div>
  )
}

interface Props {
  jenis: "penyedia" | "swakelola"
  title: string
  description: string
}

export function LaporanRincianView({ jenis, title, description }: Props) {
  const [data, setData] = useState<LaporanPaketResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/laporan/${jenis}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json?.data ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }, [jenis])

  useEffect(() => {
    load()
  }, [load])

  const isPenyedia = jenis === "penyedia"
  const rincian: RincianPaketRow[] = data?.rincian ?? []
  const totalPagu = rincian.reduce((s, r) => s + Number(r.total_pagu || 0), 0)

  const stats = [
    { label: "Total Paket", value: data ? String(data.summary.total_paket) : "—", icon: Inbox, color: "blue" },
    { label: "Total Pagu", value: data ? fmtRp(data.summary.total_pagu) : "—", icon: Wallet, color: "indigo" },
    { label: "Jumlah SKPD", value: data ? String(data.summary.total_skpd) : "—", icon: Building2, color: "emerald" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {/* Header + Aksi Ekspor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak PDF
          </button>
          <a
            href={`/api/laporan/${jenis}/export`}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Unduh laporan dalam format Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Ekspor Excel
          </a>
          <button
            type="button"
            onClick={load}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-xl font-mono font-semibold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`h-9 w-9 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Kop dokumen (muncul saat cetak) */}
      <div className="hidden print:block text-center space-y-1 pb-3 border-b-2 border-slate-900 mb-4">
        <p className="text-sm font-bold uppercase tracking-wide">Pemerintah Provinsi Sumatera Barat</p>
        <p className="text-xs font-semibold uppercase">Laporan Rencana Kebutuhan Pengadaan — {isPenyedia ? "Penyedia" : "Swakelola"}</p>
        <p className="text-[10px] text-slate-500">Biro Pengadaan Barang/Jasa Provinsi Sumatera Barat</p>
      </div>

      {/* Daftar Kartu Vertikal per Paket */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rincian.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-400">
            Belum ada paket {isPenyedia ? "Penyedia" : "Swakelola"} yang diajukan.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between print:hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Rincian Paket ({rincian.length})</p>
              <span className="text-[10px] text-slate-400">T.A. 2026 · semua status non-Draft</span>
            </div>

            {rincian.map((r, i) => (
              <div
                key={r.id}
                className="print-kartu rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden"
              >
                {/* Header kartu */}
                <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
                      <span className="inline-flex items-center justify-center h-5 w-6 rounded bg-blue-600 text-white text-[10px] font-bold mr-2 align-middle shrink-0">
                        {i + 1}
                      </span>
                      {r.nama_paket}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug break-words">
                      {[r.nama_skpd, r.nama_program, r.nama_kegiatan, r.nama_sub_kegiatan].filter(Boolean).join(" › ")}
                    </p>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5">
                      #{r.id} · {r.jenis_pengadaan}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30">
                      {r.status_review}
                    </span>
                    <p className="text-[10px] font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">{fmtRp(r.total_pagu)}</p>
                  </div>
                </div>

                {/* Isi kartu: baris field vertikal */}
                <div className="divide-y divide-slate-50 dark:divide-slate-800/60 sm:grid sm:grid-cols-2 sm:divide-y-0 print:grid-cols-2">
                  <FieldRow label="Lokasi">
                    <span className="inline-flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{r.lokasi.join("; ") || "—"}</span>
                    </span>
                  </FieldRow>
                  <FieldRow label="Volume">
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="font-mono">{fmtAngka(r.volume)}</span> {r.volume_satuan}
                    </span>
                  </FieldRow>
                  <FieldRow label="Uraian Pekerjaan" full>
                    {r.uraian || "—"}
                  </FieldRow>
                  <FieldRow label="Spesifikasi Pekerjaan" full>
                    {r.spesifikasi || "—"}
                  </FieldRow>
                  {isPenyedia && (
                    <>
                      <FieldRow label="PDN">
                        <span className="inline-flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-slate-400 shrink-0" />
                          {r.pdn || "—"}
                        </span>
                      </FieldRow>
                      <FieldRow label="Usaha Kecil">{r.usaha_kecil || "—"}</FieldRow>
                      <FieldRow label="SPP (Ekonomi/Sosial/Lingkungan)">
                        {[r.spp_ekonomi, r.spp_sosial, r.spp_lingkungan].map((v) => v || "—").join(" / ")}
                      </FieldRow>
                      <FieldRow label="Pra DIPA/DPA">{r.pra_dpa || "—"}</FieldRow>
                      <FieldRow label="Metode">{r.metode_pengadaan || "—"}</FieldRow>
                      <FieldRow label="Tersedia e-Katalog">{r.tersedia_ekatalog || "—"}</FieldRow>
                    </>
                  )}
                  <FieldRow label="Sumber Dana">
                    <span className="inline-flex items-center gap-1">
                      <Coins className="h-3 w-3 text-slate-400 shrink-0" />
                      {r.sumber_dana || "—"}
                    </span>
                  </FieldRow>
                  {!isPenyedia && (
                    <FieldRow label="Tipe Swakelola">
                      <span className="inline-flex items-center gap-1">
                        <GitBranch className="h-3 w-3 text-slate-400 shrink-0" />
                        {r.tipe_swakelola || "—"}
                      </span>
                    </FieldRow>
                  )}
                  <FieldRow label="MAK (Rekening)" full>
                    {r.mak.length === 0 ? (
                      "—"
                    ) : (
                      <div className="space-y-1">
                        {r.mak.map((m, idx) => (
                          <p key={idx} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{m.kode_rekening}</span>
                            <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">{fmtRp(m.pagu)}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </FieldRow>
                  <FieldRow label="Jadwal Pemanfaatan">
                    <span className="inline-flex items-center gap-1">
                      <CalendarRange className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>
                        {fmtTgl(r.waktu_pemanfaatan_awal)} <span className="text-slate-400">s/d</span> {fmtTgl(r.waktu_pemanfaatan_akhir)}
                      </span>
                    </span>
                  </FieldRow>
                  <FieldRow label={isPenyedia ? "Jadwal Pelaksanaan Kontrak" : "Jadwal Pelaksanaan Kontrak"}>
                    <span className="inline-flex items-center gap-1">
                      <CalendarRange className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>
                        {fmtTgl(r.waktu_pelaksanaan_awal)} <span className="text-slate-400">s/d</span> {fmtTgl(r.waktu_pelaksanaan_akhir)}
                      </span>
                    </span>
                  </FieldRow>
                  {isPenyedia && (
                    <FieldRow label="Jadwal Pemilihan Penyedia">
                      <span className="inline-flex items-center gap-1">
                        <CalendarRange className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {fmtTgl(r.waktu_pemilihan_awal)} <span className="text-slate-400">s/d</span> {fmtTgl(r.waktu_pemilihan_akhir)}
                        </span>
                      </span>
                    </FieldRow>
                  )}
                </div>
              </div>
            ))}

            {/* Footer total */}
            <div className="print-kartu flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                TOTAL — {rincian.length} Paket {isPenyedia ? "Penyedia" : "Swakelola"}
              </p>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{fmtRp(totalPagu)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
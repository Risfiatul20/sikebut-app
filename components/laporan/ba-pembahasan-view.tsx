"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Printer, FileText } from "lucide-react"
import { BaPembahasanResponse } from "@/types/laporan-paket"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"

const fmtRp = (v: number | string) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(v ?? 0))

const fmtWaktu = (iso: string | null) => {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
  } catch {
    return iso
  }
}

interface Props {
  jenis: "ba-pembahasan-penyedia" | "ba-pembahasan-swakelola"
  cara: string
  judul: string
}

export function BaPembahasanView({ jenis, cara, judul }: Props) {
  const [data, setData] = useState<BaPembahasanResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nomorBa, setNomorBa] = useState("")
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/laporan/${jenis}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json?.data ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data BA")
    } finally {
      setLoading(false)
    }
  }, [jenis])

  useEffect(() => {
    load()
  }, [load])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{judul}</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Berita Acara pembahasan paket pengadaan {cara} yang diajukan untuk review. Data dari sistem (cetak dengan tombol di kanan).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak
          </button>
          <button
            type="button"
            onClick={load}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Muat Ulang
          </button>
        </div>
      </div>

      {/* Header Nomor & Tanggal (edit sebelum cetak) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Berita Acara</label>
          <input
            type="text"
            value={nomorBa}
            onChange={(e) => setNomorBa(e.target.value)}
            placeholder="cth: 027/BA-PBJ/X/2026"
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Dokumen BA */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !data ? (
          <div className="p-10 text-center text-xs text-slate-400">Belum ada data.</div>
        ) : (
          <div className="p-6 sm:p-10">
            {/* Kop */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900 dark:border-slate-200">
              <p className="font-display text-sm font-bold uppercase tracking-wide">Berita Acara Pembahasan</p>
              <p className="text-sm font-semibold uppercase">Rencana Kebutuhan Pengadaan {cara}</p>
              <p className="text-xs text-slate-500">Biro Pengadaan Barang/Jasa Provinsi Sumatera Barat</p>
            </div>

            <div className="py-4 text-xs space-y-1.5">
              <p><span className="font-semibold">Nomor:</span> {nomorBa || "...................."}</p>
              <p><span className="font-semibold">Tanggal:</span> {tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "...................."}</p>
            </div>

            <p className="text-xs leading-relaxed text-justify mb-4">
              Pada hari ini, {tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "...................."},
              telah dilaksanakan pembahasan atas rencana kebutuhan pengadaan {cara} yang diajukan oleh para Pejabat Pembuat Komitmen (PPK).
              Pembahasan dilakukan terhadap <span className="font-semibold">{data.summary.total_paket} paket</span> dengan total pagu
              <span className="font-semibold"> {fmtRp(data.summary.total_pagu)}</span>, dengan rincian sebagai berikut:
            </p>

            {/* Tabel Paket */}
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="font-semibold px-3 py-2 w-8">No</th>
                    <th className="font-semibold px-3 py-2">Nama Paket</th>
                    <th className="font-semibold px-3 py-2">Jenis Pengadaan</th>
                    <th className="font-semibold px-3 py-2">SKPD</th>
                    <th className="font-semibold px-3 py-2">Status</th>
                    <th className="font-semibold px-3 py-2 text-right">Pagu</th>
                    <th className="font-semibold px-3 py-2">PPK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.paket.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-slate-400">Belum ada paket {cara} yang diajukan untuk pembahasan.</td>
                    </tr>
                  ) : (
                    data.paket.map((p, i) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 font-medium">{p.nama_paket}</td>
                        <td className="px-3 py-2">{p.jenis_pengadaan || "—"}</td>
                        <td className="px-3 py-2">{p.nama_skpd || p.kode_skpd}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(p.status_review)}`}>
                            {statusLabel(p.status_review)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{fmtRp(p.total_pagu)}</td>
                        <td className="px-3 py-2">{p.nama_user || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data.paket.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-semibold">
                      <td colSpan={5} className="px-3 py-2 text-right">Total</td>
                      <td className="px-3 py-2 text-right font-mono">{fmtRp(data.summary.total_pagu)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <p className="text-xs leading-relaxed text-justify mt-4 mb-6">
              Berdasarkan pembahasan tersebut, para pihak menyepakati hasil pembahasan sebagaimana tercantum pada tabel di atas.
              Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya.
            </p>

            {/* Tanda tangan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs mt-10">
              <div>
                <p>Pejabat Pembuat Komitmen</p>
                <div className="h-24" />
                <p className="font-semibold underline mt-2">( ................................ )</p>
              </div>
              <div>
                <p>Verifikator</p>
                <div className="h-24" />
                <p className="font-semibold underline mt-2">( ................................ )</p>
              </div>
              <div>
                <p>Mengetahui,<br />Kepala Biro PBJ</p>
                <div className="h-24" />
                <p className="font-semibold underline mt-2">( ................................ )</p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-8">
              Dokumen ini dihasilkan secara otomatis oleh SIKEBUT — Sistem Identifikasi Kebutuhan Pengadaan. Tanggal cetak: {fmtWaktu(new Date().toISOString())}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
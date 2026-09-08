"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Printer, FileText } from "lucide-react"
import { BaRkbmdResponse } from "@/types/laporan-paket"

interface Props {
  jenis: "ba-rkbmd-pengadaan" | "ba-rkbmd-pemeliharaan"
  tipe: string
  judul: string
  deskripsi: string
}

export function BaRkbmdView({ jenis, tipe, judul, deskripsi }: Props) {
  const [data, setData] = useState<BaRkbmdResponse["data"] | null>(null)
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
      setError(err instanceof Error ? err.message : "Gagal memuat data BA RKBMD")
    } finally {
      setLoading(false)
    }
  }, [jenis])

  useEffect(() => {
    load()
  }, [load])

  const handlePrint = () => window.print()

  const fmtWaktu = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    } catch {
      return iso
    }
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{deskripsi}</p>
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

      {/* Nomor & Tanggal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Berita Acara</label>
          <input
            type="text"
            value={nomorBa}
            onChange={(e) => setNomorBa(e.target.value)}
            placeholder="cth: 028/BA-RKBMD/X/2026"
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

      {/* Dokumen */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !data ? (
          <div className="p-10 text-center text-xs text-slate-400">Belum ada data.</div>
        ) : (
          <div className="p-6 sm:p-10">
            <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900 dark:border-slate-200">
              <p className="font-display text-sm font-bold uppercase tracking-wide">Berita Acara Catatan RKBMD</p>
              <p className="text-sm font-semibold uppercase">Rencana Kebutuhan Barang Milik Daerah ({tipe})</p>
              <p className="text-xs text-slate-500">Biro Pengadaan Barang/Jasa Provinsi Sumatera Barat</p>
            </div>

            <div className="py-4 text-xs space-y-1.5">
              <p><span className="font-semibold">Nomor:</span> {nomorBa || "...................."}</p>
              <p><span className="font-semibold">Tanggal:</span> {tanggal ? fmtWaktu(tanggal) : "...................."}</p>
            </div>

            <p className="text-xs leading-relaxed text-justify mb-4">
              Pada hari ini telah dicatatkan rencana kebutuhan barang pada data RKBMD ({tipe}) yang bersumber dari sistem,
              mencakup <span className="font-semibold">{data.summary.total_skpd} SKPD</span>. Daftar rincian terlampir pada tabel berikut:
            </p>

            {/* Ringkasan per SKPD */}
            <p className="text-xs font-semibold mb-2">Ringkasan per SKPD</p>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg mb-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="font-semibold px-3 py-2">Kode SKPD</th>
                    <th className="font-semibold px-3 py-2">Nama SKPD</th>
                    <th className="font-semibold px-3 py-2 text-right">Jumlah Baris</th>
                    <th className="font-semibold px-3 py-2 text-right">Total Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.per_skpd.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-400">Belum ada data RKBMD.</td>
                    </tr>
                  ) : (
                    data.per_skpd.map((s, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-mono">{s.kode_skpd}</td>
                        <td className="px-3 py-2">{s.nama_skpd || "—"}</td>
                        <td className="px-3 py-2 text-right">{s.jumlah_paket}</td>
                        <td className="px-3 py-2 text-right font-mono">{Number(s.total_pagu ?? 0).toLocaleString("id-ID")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Detail barang */}
            <p className="text-xs font-semibold mb-2">Rincian Barang (lampiran, {data.items.length} baris terbaru)</p>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="font-semibold px-3 py-2">Nama Barang</th>
                    <th className="font-semibold px-3 py-2 text-right">Jumlah</th>
                    <th className="font-semibold px-3 py-2">Satuan</th>
                    <th className="font-semibold px-3 py-2">SKPD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-400">Belum ada rincian barang.</td>
                    </tr>
                  ) : (
                    data.items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-3 py-1.5">{it.nama_barang}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{it.jumlah_barang}</td>
                        <td className="px-3 py-1.5">{it.satuan || "—"}</td>
                        <td className="px-3 py-1.5">{it.nama_skpd || it.kode_skpd}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs leading-relaxed text-justify mt-4 mb-6">
              Demikian Berita Acara ini dibuat sebagai catatan resmi atas rencana kebutuhan barang RKBMD ({tipe})
              dan untuk dipergunakan sebagaimana mestinya.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs mt-10 max-w-md mx-auto">
              <div>
                <p>Petugas</p>
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
              Dokumen ini dihasilkan secara otomatis oleh SIKEBUT. Tanggal cetak: {fmtWaktu(new Date().toISOString())}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
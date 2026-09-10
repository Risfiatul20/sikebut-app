"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Printer, FileText, FileSpreadsheet } from "lucide-react"
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
          <a
            href={`/api/laporan/${jenis}/export`}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Unduh Berita Acara dalam format Excel"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Ekspor Excel
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak PDF
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
              mencakup <span className="font-semibold">{data.summary.total_paket} paket</span> dengan
              <span className="font-semibold"> {data.summary.total_barang} item barang</span> ({data.summary.total_unit} unit).
              Daftar rincian terlampir pada tabel berikut:
            </p>

            {/* Tabel Paket — sesuai template BA Catatan RKBMD (table-fixed, muat 100%, tidak keluar tabel) */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-xs table-fixed border-collapse">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[30%]" />
                  <col className="w-[8%]" />
                  <col className="w-[10%]" />
                  <col className="w-[26%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="font-semibold px-3 py-2.5">No</th>
                    <th className="font-semibold px-3 py-2.5">OPD / Program / Kegiatan / Sub Kegiatan / Paket</th>
                    <th className="font-semibold px-3 py-2.5 text-right">Jml Item</th>
                    <th className="font-semibold px-3 py-2.5 text-right">Total Unit</th>
                    <th className="font-semibold px-3 py-2.5">Barang RKBMD</th>
                    <th className="font-semibold px-3 py-2.5">Catatan Pembahasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.paket.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400">Belum ada paket dengan jawaban RKBMD ({tipe}).</td>
                    </tr>
                  ) : (
                    data.paket.map((p, i) => (
                      <tr key={p.id} className="align-top">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2 min-w-0 break-words">
                          <p className="font-semibold break-words">{p.nama_paket}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug break-words">
                            {[p.nama_skpd, p.nama_program, p.nama_kegiatan, p.nama_sub_kegiatan].filter(Boolean).join(" › ")}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{p.jumlah_item}</td>
                        <td className="px-3 py-2 text-right font-mono">{Number(p.total_unit).toLocaleString("id-ID")}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400 break-words min-w-0">
                          {p.items.length === 0 ? (
                            "—"
                          ) : (
                            <ul className="space-y-1">
                              {p.items.map((it, idx) => (
                                <li key={idx} className="flex items-baseline gap-1">
                                  <span className="shrink-0 text-slate-400">•</span>
                                  <span className="break-words">
                                    {it.nama_barang} — {Number(it.jumlah).toLocaleString("id-ID")} {it.satuan}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300 leading-snug break-words min-w-0">{p.catatan_pembahasan || "—"}</td>
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
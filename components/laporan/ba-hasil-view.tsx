"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, Printer, FileText, FileSpreadsheet } from "lucide-react"
import { BaHasilResponse } from "@/types/laporan-paket"
import { useYear } from "@/context/year-context"

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

/** Badge status review — warna konsisten dengan daftar usulan. */
function statusBadge(status: string) {
  const base = "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
  switch (status) {
    case "Disetujui":
      return `${base} bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300`
    case "Perlu Perbaikan":
      return `${base} bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300`
    case "Diajukan":
      return `${base} bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300`
    default:
      return `${base} bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`
  }
}

interface Props {
  jenis: "ba-hasil-identifikasi" | "ba-hasil-verifikasi" | "ba-penetapan"
  /** Label untuk memilih blok narasi & penandatangan yang tepat. */
  jenisLabel: "hasil-identifikasi" | "hasil-verifikasi" | "penetapan"
  judul: string
  deskripsi: string
}

export function BaHasilView({ jenis, jenisLabel, judul, deskripsi }: Props) {
  const [data, setData] = useState<BaHasilResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nomorBa, setNomorBa] = useState("")
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  // Filter cara pengadaan (konsep: satu BA mencakup semua; bisa disaring).
  const [cara, setCara] = useState<"" | "Penyedia" | "Swakelola">("")

  // Tahun mengikuti pemilih tahun di navbar
  const { year: tahun } = useYear()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ tahun: String(tahun) })
      if (cara) qs.set("cara", cara)
      const res = await fetch(`/api/laporan/${jenis}?${qs.toString()}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as BaHasilResponse
      setData(json?.data ?? null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data BA")
    } finally {
      setLoading(false)
    }
  }, [jenis, tahun, cara])

  useEffect(() => {
    // Dibungkus fungsi async di dalam effect: pembaruan state terjadi setelah
    // await (bukan sinkron), jadi tidak memicu render berantai.
    void (async () => {
      await load()
    })()
  }, [load])

  const handlePrint = () => {
    window.print()
  }

  // Narasi pembuka per jenis BA (blok isi, bukan data tabel).
  const narasi = () => {
    if (!data) return null
    const paketCount = <span className="font-semibold">{data.summary.total_paket} paket</span>
    const total = <span className="font-semibold"> {fmtRp(data.summary.total_pagu)}</span>
    if (jenisLabel === "hasil-identifikasi") {
      return (
        <p className="text-xs leading-relaxed text-justify mt-4">
          Pada hari ini, {tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "...................."},
          telah dilaksanakan identifikasi kebutuhan pengadaan{data.cara_pengadaan !== "Semua" ? ` ${data.cara_pengadaan}` : ""} oleh para Pejabat Pembuat Komitmen (PPK).
          Hasil identifikasi mencakup {paketCount} dengan total pagu{total}, dengan rincian sebagai berikut:
        </p>
      )
    }
    if (jenisLabel === "hasil-verifikasi") {
      return (
        <p className="text-xs leading-relaxed text-justify mt-4">
          Pada hari ini, {tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "...................."},
          telah dilaksanakan verifikasi dan validasi atas hasil identifikasi kebutuhan pengadaan{data.cara_pengadaan !== "Semua" ? ` ${data.cara_pengadaan}` : ""} yang diajukan oleh para Pejabat Pembuat Komitmen (PPK).
          Paket yang diverifikasi berjumlah {paketCount} dengan total pagu{total}, dengan keputusan sebagai berikut:
        </p>
      )
    }
    return (
      <p className="text-xs leading-relaxed text-justify mt-4">
        Pada hari ini, {tanggal ? new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "...................."},
        berdasarkan hasil verifikasi dan validasi kebutuhan, ditetapkan daftar kebutuhan pengadaan{data.cara_pengadaan !== "Semua" ? ` ${data.cara_pengadaan}` : ""} sebagai berikut:
        sebanyak {paketCount} dengan total pagu{total}.
      </p>
    )
  }

  // Penandatangan per jenis BA.
  const penandatangan = () => {
    if (jenisLabel === "hasil-identifikasi") {
      return (
        <>
          <div>
            <p>Pejabat Pembuat Komitmen</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
          <div>
            <p>Mengetahui,<br />Verifikator</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
          <div>
            <p>Mengetahui,<br />Kepala Biro PBJ</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
        </>
      )
    }
    if (jenisLabel === "hasil-verifikasi") {
      return (
        <>
          <div>
            <p>Verifikator</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
          <div>
            <p>Pejabat Pembuat Komitmen</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
          <div>
            <p>Mengetahui,<br />Kepala Biro PBJ</p>
            <div className="h-24" />
            <p className="font-semibold underline mt-2">( ................................ )</p>
          </div>
        </>
      )
    }
    return (
      <>
        <div>
          <p>Penetapan Kebutuhan,<br />Pejabat Pembuat Komitmen</p>
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
      </>
    )
  }

  const kolomStatus = data?.kolom_status ?? false

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
            {deskripsi}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={cara}
            onChange={(e) => setCara(e.target.value as "" | "Penyedia" | "Swakelola")}
            className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
            title="Saring menurut cara pengadaan"
          >
            <option value="">Semua Cara</option>
            <option value="Penyedia">Penyedia</option>
            <option value="Swakelola">Swakelola</option>
          </select>
          <a
            href={`/api/laporan/${jenis}/export?tahun=${tahun}${cara ? `&cara=${cara}` : ""}`}
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

      {/* Header Nomor & Tanggal (edit sebelum cetak) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Berita Acara</label>
          <input
            type="text"
            value={nomorBa}
            onChange={(e) => setNomorBa(e.target.value)}
            placeholder="Kosongkan bila belum ada — tampil titik-titik saat cetak"
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>

      {/* Isi dokumen (dapat dicetak) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 print:border-0 print:rounded-none print:p-0">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat data BA…
          </div>
        ) : data ? (
          <div>
            {/* Kop dokumen */}
            <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-4 print:pb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Pemerintah Provinsi Sumatera Barat
              </p>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">{judul}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Nomor: {nomorBa || "...................."}
              </p>
            </div>

            {narasi()}

            {/* Tabel Paket — konsep sama dengan BA Pembahasan (satu baris = satu paket;
                kolom uang berasal dari SIPD yang dipisah lewat penanda pada KODE REKENING). */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
              <table className="w-full text-xs table-fixed border-collapse">
                <colgroup>
                  <col className="w-[5%]" />
                  <col className="w-[28%]" />
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[8%]" />
                  {kolomStatus && <col className="w-[9%]" />}
                  {kolomStatus ? <col className="w-[10%]" /> : <col className="w-[19%]" />}
                </colgroup>
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="font-semibold px-2 py-2.5">No</th>
                    <th className="font-semibold px-2 py-2.5">OPD / Program / Kegiatan / Sub Kegiatan / Paket</th>
                    <th className="font-semibold px-2 py-2.5">Cara</th>
                    <th className="font-semibold px-2 py-2.5 text-right">Belanja Non Pengadaan</th>
                    <th className="font-semibold px-2 py-2.5 text-right">Belanja Pengadaan</th>
                    <th className="font-semibold px-2 py-2.5 text-right">Pagu Paket</th>
                    <th className="font-semibold px-2 py-2.5 text-right">Sisa</th>
                    {kolomStatus && <th className="font-semibold px-2 py-2.5">Keputusan</th>}
                    <th className="font-semibold px-2 py-2.5">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {data.paket.length === 0 ? (
                    <tr>
                      <td colSpan={kolomStatus ? 9 : 8} className="px-3 py-6 text-center text-slate-400">
                        Belum ada paket untuk dilaporkan{data.cara_pengadaan !== "Semua" ? ` (cara: ${data.cara_pengadaan})` : ""}.
                      </td>
                    </tr>
                  ) : (
                    data.paket.map((p, i) => (
                      <tr key={p.id} className="align-top">
                        <td className="px-2 py-2">{i + 1}</td>
                        <td className="px-2 py-2 min-w-0 break-words">
                          <p className="font-semibold break-words">{p.nama_paket}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug break-words">
                            {[p.nama_skpd, p.nama_program, p.nama_kegiatan, p.nama_sub_kegiatan].filter(Boolean).join(" › ")}
                          </p>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">{p.cara_pengadaan}</td>
                        <td className="px-2 py-2 text-right font-mono whitespace-nowrap">{fmtRp(p.belanja_non_pengadaan)}</td>
                        <td className="px-2 py-2 text-right font-mono whitespace-nowrap">{fmtRp(p.belanja_pengadaan)}</td>
                        <td className="px-2 py-2 text-right font-mono font-semibold whitespace-nowrap">{fmtRp(p.pagu)}</td>
                        <td className="px-2 py-2 text-right font-mono whitespace-nowrap">{fmtRp(p.sisa)}</td>
                        {kolomStatus && (
                          <td className="px-2 py-2">
                            <span className={statusBadge(p.status_review)}>{p.status_review}</span>
                          </td>
                        )}
                        <td className="px-2 py-2 text-slate-700 dark:text-slate-300 leading-snug break-words min-w-0">{p.catatan_pembahasan || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data.paket.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-semibold">
                      <td colSpan={4} className="px-2 py-2.5 text-right">Total Pagu Paket</td>
                      <td colSpan={kolomStatus ? 4 : 3} className="px-2 py-2.5 text-right font-mono whitespace-nowrap">{fmtRp(data.summary.total_pagu)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <p className="text-xs leading-relaxed text-justify mt-4 mb-6">
              {jenisLabel === "penetapan"
                ? "Demikian daftar kebutuhan ini ditetapkan untuk dipergunakan sebagaimana mestinya."
                : "Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya."}
            </p>

            {/* Tanda tangan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs mt-10">
              {penandatangan()}
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-8">
              Dokumen ini dihasilkan secara otomatis oleh SIKEBUT — Sistem Identifikasi Kebutuhan Pengadaan. Tanggal cetak: {fmtWaktu(new Date().toISOString())}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

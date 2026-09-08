"use client"

import { AlertTriangle, FileText, Layers, Building2, DollarSign, ClipboardList } from "lucide-react"

interface Props {
  identitas: {
    nama_program: string
    kode_program: string
    nama_kegiatan: string
    kode_kegiatan: string
    nama_sub_kegiatan: string
    kode_sub_kegiatan: string
    cara_pengadaan: string
    jenis_pengadaan: string
    nama_skpd: string
  }
  anggaran: PaguPaketItem[]
  formData: unknown
}

type PaguPaketItem = {
  id_sipd_penetapan: number
  kode_standar_harga: string
  nama_standar_harga: string
  nama_rekening: string
  rencana_pagu_paket: number
}

export function StepReview({ identitas, anggaran, formData }: Props) {
  const totalPagu = anggaran.reduce((s, a) => s + a.rencana_pagu_paket, 0)
  const fmt = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Review & Konfirmasi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Periksa data sebelum disimpan sebagai Draft.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <p className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1"><Building2 className="h-3 w-3" /> Identitas</p>
          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 mt-1">{identitas.nama_skpd}</p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">{identitas.cara_pengadaan}{identitas.jenis_pengadaan ? ` / ${identitas.jenis_pengadaan}` : ""}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <p className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1"><FileText className="h-3 w-3" /> Paket</p>
          <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 mt-1">{(formData as Record<string, string>).nama_paket || "—"}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{identitas.nama_program}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-500/5">
          <p className="text-[10px] font-semibold uppercase text-blue-500 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total Pagu</p>
          <p className="text-sm font-mono font-bold text-blue-700 dark:text-blue-300 mt-1">{fmt(totalPagu)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{anggaran.length} item standar harga</p>
        </div>
      </div>

      {/* Anggaran Table */}
      {anggaran.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Rincian Pemilihan Standar Harga</p>
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="font-semibold px-4 py-2 text-left">Rekening</th>
                  <th className="font-semibold px-4 py-2 text-left">Standar Harga</th>
                  <th className="font-semibold px-4 py-2 text-right">Pagu Paket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {anggaran.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2">
                      <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">{a.nama_rekening}</p>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-[11px] text-slate-800 dark:text-slate-200">{a.nama_standar_harga}</p>
                      <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{a.kode_standar_harga}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-xs text-slate-900 dark:text-white">{fmt(a.rencana_pagu_paket)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 font-semibold">
                  <td colSpan={2} className="px-4 py-2 text-[11px] text-slate-600 dark:text-slate-300">Total Rencana Pagu Paket</td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-blue-700 dark:text-blue-300">{fmt(totalPagu)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* RKBMD Items Table */}
      {(() => {
        const rkbmd = (formData as Record<string, unknown>)?.rkbmd_items
        if (!Array.isArray(rkbmd) || rkbmd.length === 0) return null
        return (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Identifikasi Barang Tersedia (RKBMD) — {rkbmd.length} item</p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                  <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="font-semibold px-4 py-2 text-left">Nama Barang</th>
                    <th className="font-semibold px-4 py-2 text-left">Sumber</th>
                    <th className="font-semibold px-4 py-2 text-right">Jumlah</th>
                    <th className="font-semibold px-4 py-2 text-right">Kondisi (B/RR/RB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(rkbmd as Array<Record<string, unknown>>).map((it, i) => (
                    <tr key={String(it.id ?? i)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2">
                        <p className="text-[11px] text-slate-800 dark:text-slate-200">{String(it.nama_barang ?? "")}</p>
                        {it.kode_fikasi ? <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{String(it.kode_fikasi)}</p> : null}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${it.sumber === "pengadaan" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" : "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"}`}>
                          {it.sumber === "pengadaan" ? "Rencana Pengadaan" : "Aset Dimiliki"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-semibold text-xs text-slate-900 dark:text-white">
                        {Number(it.jumlah ?? 0).toLocaleString("id-ID")} {String(it.satuan ?? "")}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {it.sumber === "pemeliharaan"
                          ? `${Number(it.kondisi_b ?? 0)} / ${Number(it.kondisi_rr ?? 0)} / ${Number(it.kondisi_rb ?? 0)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* Confirmation Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Konfirmasi Simpan</p>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
            Data akan disimpan dengan status <b>Draft</b>. Anda dapat menekan tombol Simpan sebagai Draft di bawah untuk memeriksa payload dan mengonfirmasi penyimpanan.
          </p>
        </div>
      </div>
    </div>
  )
}

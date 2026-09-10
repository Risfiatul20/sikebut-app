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
  /** Buka modal pagu (RKA SIPD) — pagu dikelola langsung di langkah Review. */
  onOpenPagu?: () => void
  /** True bila Pagu Paket belum dipilih (validasi) → section ditandai merah. */
  missingPagu?: boolean
}

type PaguPaketItem = {
  id_sipd_penetapan: number
  kode_standar_harga: string
  nama_standar_harga: string
  nama_rekening: string
  rencana_pagu_paket: number
}

export function StepReview({ identitas, anggaran, formData, onOpenPagu, missingPagu = false }: Props) {
  const totalPagu = anggaran.reduce((s, a) => s + a.rencana_pagu_paket, 0)
  const fmt = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Review & Konfirmasi</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Periksa data, lalu simpan sebagai <b>Draft</b> atau <b>Ajukan Langsung</b> ke Verifikator.
        </p>
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

      {/* Detail Pekerjaan — fungsi/kegunaan, uraian & spesifikasi pekerjaan */}
      {(() => {
        const fd = formData as Record<string, unknown>
        const rows: Array<{ label: string; value: string }> = []
        const push = (keys: string[], label: string) => {
          for (const k of keys) {
            const v = fd?.[k]
            if (v !== undefined && v !== null && String(v).trim() !== "") {
              rows.push({ label, value: String(v) })
              return
            }
          }
        }
        push(["fungsi_kegunaan", "fungsi"], "Fungsi/Kegunaan")
        push(["uraian", "uraian_pekerjaan"], "Uraian Pekerjaan")
        push(["spesifikasi", "spesifikasi_pekerjaan"], "Spesifikasi Pekerjaan")
        if (rows.length === 0) return null
        return (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Detail Pekerjaan
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {rows.map((r) => (
                <div key={r.label} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{r.label}</p>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed break-words">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Pagu Paket — dikelola langsung di Review (arahan: hilangkan langkah RKA SIPD terpisah) */}
      <div className="space-y-3">
        <div className={`flex items-center justify-between gap-3 flex-wrap p-4 rounded-xl border ${missingPagu ? "border-rose-300 dark:border-rose-500/60 bg-rose-50/50 dark:bg-rose-950/20 ring-1 ring-rose-400/40" : "border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-500/5"}`}>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${missingPagu ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"}`}>
              <Layers className="h-3.5 w-3.5" /> Pagu Paket {missingPagu && <span className="text-[9px] font-semibold normal-case">— Wajib diisi</span>}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {anggaran.length > 0
                ? `${anggaran.length} item standar harga terpilih — total ${fmt(totalPagu)}`
                : "Belum ada — pilih standar harga & input pagu paket dari data SIPD."}
            </p>
          </div>
          {onOpenPagu && (
            <button
              type="button"
              onClick={onOpenPagu}
              className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              {anggaran.length > 0 ? "Ubah Pemilihan Pagu Paket" : "Pilih Standar Harga & Input Pagu"}
            </button>
          )}
        </div>

        {anggaran.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Belum Ada Pemilihan Pagu Paket</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Klik tombol di atas untuk memilih standar harga dari data SIPD. Minimal 1 item wajib dipilih sebelum menyimpan.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Anggaran Table */}
      {anggaran.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Rincian Pagu Paket</p>
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

      {/* RKBMD Items — per item Pagu Paket (arahan: RKBMD mengikuti kode rekening) */}
      {(() => {
        const fd = formData as Record<string, unknown>
        const perAnggaran = fd?.rkbmd_per_anggaran as
          | Array<{
              kode_rekening?: string
              nama_rekening?: string
              mode?: string
              items?: Array<Record<string, unknown>>
            }>
          | undefined
        const legacyRkbmd = fd?.rkbmd_items
        const legacyMode = fd?.rkbmd_mode as string | undefined

        // Mode baru: jawaban per item pagu paket
        if (Array.isArray(perAnggaran) && perAnggaran.some((p) => p.mode)) {
          const modeLabel = (m?: string) =>
            m === "rencana"
              ? "Rencana (Pengadaan)"
              : m === "aset"
                ? "Aset Dimiliki (Pemeliharaan)"
                : m === "tidak_butuh"
                  ? "Tidak Butuh RKBMD"
                  : m === "tidak_tersedia"
                    ? "Tidak Tersedia di RKBMD"
                    : null
          return (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Identifikasi Barang Tersedia (RKBMD) — per rekening ({perAnggaran.filter((p) => p.mode).length} item pagu)</p>
              <div className="space-y-2">
                {perAnggaran.filter((p) => p.mode).map((p, i) => (
                  <div key={String(p.kode_rekening ?? i)} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                        <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 mr-1.5">{String(p.kode_rekening ?? "")}</span>
                        {String(p.nama_rekening ?? "")}
                      </p>
                      <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        {modeLabel(p.mode)}
                      </span>
                    </div>
                    {p.items && p.items.length > 0 ? (
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50">
                          <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="font-semibold px-4 py-2 text-left">Nama Barang</th>
                            <th className="font-semibold px-4 py-2 text-right">Jumlah</th>
                            <th className="font-semibold px-4 py-2 text-right">Kondisi (B/RR/RB)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {p.items.map((it, j) => (
                            <tr key={String(it.id ?? j)} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="px-4 py-2">
                                <p className="text-[11px] text-slate-800 dark:text-slate-200">{String(it.nama_barang ?? "")}</p>
                                {it.kode_fikasi ? <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{String(it.kode_fikasi)}</p> : null}
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
                    ) : (
                      <p className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400">Tidak ada barang terpilih (berhenti di identifikasi RKBMD).</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        }

        // Fallback: paket lama (rkbmd_items + rkbmd_mode)
        const rkbmd = legacyRkbmd
        const modeLabel =
          legacyMode === "tidak_butuh"
            ? "Tidak Butuh RKBMD"
            : legacyMode === "tidak_tersedia"
              ? "Tidak Tersedia di RKBMD"
              : null
        if ((!Array.isArray(rkbmd) || rkbmd.length === 0) && !modeLabel) return null
        if (modeLabel && (!Array.isArray(rkbmd) || rkbmd.length === 0)) {
          return (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Identifikasi Barang Tersedia (RKBMD)</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{modeLabel}</p>
            </div>
          )
        }
        return (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Identifikasi Barang Tersedia (RKBMD) — {(rkbmd as unknown[]).length} item</p>
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
            Data dapat disimpan sebagai <b>Draft</b> atau langsung <b>Ajukan Langsung</b> ke Verifikator (status Diajukan). Tekan salah satu tombol di bawah untuk menyimpan dan mengonfirmasi usulan Anda.
          </p>
        </div>
      </div>
    </div>
  )
}

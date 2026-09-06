"use client"

import { IdentifikasiKebutuhan } from "@/types/identifikasi"
import { X, Building2, Layers, DollarSign, Calendar, Shield, MapPin, Tag, CheckCircle2, User } from "lucide-react"

interface IdentifikasiDetailModalProps {
  item: IdentifikasiKebutuhan | null
  onClose: () => void
}

export function IdentifikasiDetailModal({ item, onClose }: IdentifikasiDetailModalProps) {
  if (!item) return null

  const fmt = (v: number | string) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v ?? 0))

  const fd = (item.form_data || {}) as Record<string, unknown>
  const lokasiList = Array.isArray(fd.lokasi) ? (fd.lokasi as Array<Record<string, string>>) : []
  const metodePengadaan = String(fd.metode_pengadaan || item.cara_pengadaan || "-")
  const volume = fd.volume ? `${fd.volume} ${fd.volume_satuan || "Unit"}` : "-"

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Disetujui":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
      case "Menunggu Review":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
      case "Ditolak":
        return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-200 dark:border-red-500/30"
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {item.nama_paket}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(item.status_review)}`}>
                  {item.status_review}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ID Usulan: #{item.id} &bull; {item.cara_pengadaan} {item.jenis_pengadaan ? `(${item.jenis_pengadaan})` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Top Banner Pagu */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Total Rencana Pagu Paket
              </p>
              <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {fmt(item.total_pagu || 0)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                <Tag className="h-3.5 w-3.5 text-blue-600" />
                {item.jenis_pengadaan || item.cara_pengadaan}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                {metodePengadaan}
              </span>
            </div>
          </div>

          {/* Pembuat & SKPD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-500" /> Perangkat Daerah (SKPD)
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">{item.nama_skpd || "—"}</p>
              <p className="font-mono text-[10px] text-slate-400">Kode SKPD: {item.kode_skpd || "—"}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-500" /> Pejabat Pembuat Komitmen (PPK)
              </p>
              <p className="font-semibold text-slate-900 dark:text-white text-xs">
                {item.pembuat?.nama || item.nama_user || "—"}
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                Username: @{item.pembuat?.username || "—"}
              </p>
            </div>
          </div>

          {/* Hierarki Nomenklatur Perencanaan */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Nomenklatur Perencanaan SIPD
            </p>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold">Program</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{item.nama_program || item.kode_program || "—"}</p>
                {item.kode_program && <p className="font-mono text-[10px] text-slate-400 mt-0.5">Kode: {item.kode_program}</p>}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Kegiatan</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{item.nama_kegiatan || item.kode_kegiatan || "—"}</p>
                {item.kode_kegiatan && <p className="font-mono text-[10px] text-slate-400 mt-0.5">Kode: {item.kode_kegiatan}</p>}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold">Sub Kegiatan</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{item.nama_sub_kegiatan || item.kode_sub_kegiatan || "—"}</p>
                {item.kode_sub_kegiatan && <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Kode: {item.kode_sub_kegiatan}</p>}
              </div>
            </div>
          </div>

          {/* Rincian Spesifikasi & Kebutuhan */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Detail Spesifikasi Paket
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Uraian Pekerjaan</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{String(fd.uraian || fd.uraian_pekerjaan || "—")}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Spesifikasi Teknis</p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5">{String(fd.spesifikasi || fd.spesifikasi_pekerjaan || "—")}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Volume Kebutuhan</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{volume}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Sumber Dana</p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{String(fd.sumber_dana || "—")}</p>
              </div>
            </div>
          </div>

          {/* Waktu Pelaksanaan */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Jadwal & Waktu Pelaksanaan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Pemanfaatan</p>
                <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.waktu_pemanfaatan_awal ? `${item.waktu_pemanfaatan_awal} s/d ${item.waktu_pemanfaatan_akhir || ""}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Pemilihan Penyedia</p>
                <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.waktu_pemilihan_awal ? `${item.waktu_pemilihan_awal} s/d ${item.waktu_pemilihan_akhir || ""}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Pelaksanaan Pekerjaan</p>
                <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                  {item.waktu_pelaksanaan_pekerjaan_awal ? `${item.waktu_pelaksanaan_pekerjaan_awal} s/d ${item.waktu_pelaksanaan_pekerjaan_akhir || ""}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Multi Lokasi */}
          {lokasiList.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Lokasi Pengadaan ({lokasiList.length})
              </p>
              <div className="space-y-1.5">
                {lokasiList.map((loc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {loc.detail || `Lokasi ${idx + 1}`}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Kec. {loc.kecamatan || "-"}, {loc.kabupaten || "-"}, {loc.provinsi || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rincian Anggaran RKA SIPD */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Rincian Rekening & Standar Harga ({item.anggaran?.length || 0} Item)
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr className="text-[10px] uppercase text-slate-400 text-left">
                    <th className="font-semibold px-3 py-2">Standar Harga (SSH/ASB)</th>
                    <th className="font-semibold px-3 py-2">Rekening Belanja</th>
                    <th className="font-semibold px-3 py-2 text-right">Pagu Paket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(!item.anggaran || item.anggaran.length === 0) ? (
                    <tr>
                      <td colSpan={3} className="text-center py-6 text-slate-400">Tidak ada rincian anggaran.</td>
                    </tr>
                  ) : (
                    item.anggaran.map((ang) => (
                      <tr key={ang.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {ang.standar_harga?.nama_standar_harga || ang.nama_standar_harga || "Standar Harga"}
                          </p>
                          <p className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                            {ang.standar_harga?.kode_standar_harga || ang.kode_standar_harga || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            {ang.sipd_penetapan?.kode_rekening || ang.kode_rekening || "-"}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {ang.nama_rekening || ang.sipd_penetapan?.nama_sumber_dana || "-"}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-xs text-slate-900 dark:text-white">
                          {fmt(ang.pagu)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catatan Reviewer jika ada */}
          {item.catatan_reviewer && (
            <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Catatan Reviewer</p>
              <p className="text-xs text-amber-900 dark:text-amber-100">{item.catatan_reviewer}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

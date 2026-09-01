"use client"

import { User } from "@/types/user"
import { X, Building2, Briefcase, FileCode, Shield, Calendar, Layers } from "lucide-react"

interface UserDetailModalProps {
  user: User | null
  onClose: () => void
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  if (!user) return null

  const isRolePpk = user.role === "PPK"
  const skpdName = user.skpd?.nama_skpd || user.nama_skpd || "Tidak terikat SKPD (Pusat / LPSE)"
  const skpdCode = user.skpd?.kode_skpd || user.kode_skpd || null
  const subKegiatanList = user.sub_kegiatan || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              {user.nama.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                {user.nama}
              </h2>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                @{user.username} • ID: {user.id}
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
          {/* Main Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                <span>Role & Hak Akses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20">
                  {user.role}
                </span>
                {isRolePpk && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    <Layers className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    {subKegiatanList.length} Sub Kegiatan
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                <span>Terdaftar Sejak</span>
              </div>
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
                {new Date(user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Unit Kerja (SKPD & Sub Kegiatan Multi-select) */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Unit Kerja & Penugasan SKPD
            </p>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div>
                <p className="text-[11px] text-slate-400">Perangkat Daerah (SKPD)</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                  {skpdName}
                </p>
                {skpdCode && (
                  <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                    Kode SKPD: {skpdCode}
                  </p>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 mb-1.5">Daftar Pemetaan Sub Kegiatan (PPK)</p>
                {isRolePpk && subKegiatanList.length > 0 ? (
                  <div className="space-y-1.5">
                    {subKegiatanList.map((sub) => (
                      <div
                        key={sub.kode_sub_kegiatan}
                        className="p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">
                            {sub.nama_sub_kegiatan}
                          </p>
                          <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                            Kode: {sub.kode_sub_kegiatan}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isRolePpk ? (
                  <p className="text-amber-600 dark:text-amber-400 text-xs italic">
                    Belum ada sub kegiatan yang dipetakan untuk PPK ini.
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-xs">
                    Tidak memiliki relasi Sub Kegiatan (pemetaan sub kegiatan hanya berlaku untuk peran <b>PPK</b>).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informasi Kepegawaian (Field JSONB info) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Informasi Kepegawaian (Kolom JSONB: info)
              </p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                jsonb
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">NIP</p>
                <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {user.info?.nip || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase">Jabatan</p>
                <p className="font-medium text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.info?.jabatan || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase">Pangkat & Golongan</p>
                <p className="font-medium text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.info?.pangkat ? `${user.info.pangkat} (${user.info?.golongan || ""})` : "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase">Nomor Kontak / WhatsApp</p>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.info?.no_hp || "—"}
                </p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase">Email Kedinasan</p>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.info?.email_dinas || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Raw JSON Preview */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <FileCode className="h-3.5 w-3.5" /> Response Payload (docs/users.md)
            </p>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-3.5 overflow-x-auto">
              <pre className="font-mono text-[11px] text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
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

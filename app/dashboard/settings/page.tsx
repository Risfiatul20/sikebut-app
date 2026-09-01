"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Settings, User, Bell, Shield, Database, Server, CheckCircle2, RefreshCw, Layers, FolderTree } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"akun" | "notifikasi" | "sistem">("akun")
  const { data: session } = useSession()

  const tabs = [
    { id: "akun" as const, label: "Akun Saya", icon: User },
    { id: "notifikasi" as const, label: "Notifikasi", icon: Bell },
    { id: "sistem" as const, label: "Sistem", icon: Server },
  ]

  const userName = session?.user?.name || session?.user?.username || "Pengguna"
  const userUsername = session?.user?.username || session?.user?.email || "-"
  const userRole = session?.user?.role || "-"
  const userSkpd = session?.user?.namaSkpd || "-"
  const userKodeSkpd = session?.user?.kodeSkpd || ""
  const userInfo = session?.user?.info || {}
  const userPrograms = session?.user?.programs || []
  const userSubKegiatan = session?.user?.subkegiatans || session?.user?.subKegiatan || []

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Settings className="h-4 w-4" />
          </span>
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Pengaturan Sistem</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelola akun, notifikasi, dan konfigurasi sistem aplikasi.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden min-h-[500px]">
        {/* Tabs */}
        <div className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <nav className="p-3 space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${activeTab === tab.id ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                <tab.icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {activeTab === "akun" && (
            <>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Profil Akun Anda</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", value: userName, icon: User },
                  { label: "Username", value: `@${userUsername}`, icon: Shield },
                  { label: "Peran / Role", value: userRole, icon: Shield },
                  { label: "Perangkat Daerah", value: `${userSkpd}${userKodeSkpd ? ` (${userKodeSkpd})` : ""}`, icon: Database },
                  ...(userInfo?.nip ? [{ label: "NIP", value: String(userInfo.nip), icon: User }] : []),
                  ...(userInfo?.jabatan ? [{ label: "Jabatan", value: String(userInfo.jabatan), icon: User }] : []),
                  ...(userInfo?.pangkat ? [{ label: "Pangkat / Golongan", value: `${userInfo.pangkat} (${userInfo.golongan || ""})`, icon: User }] : []),
                  ...(userInfo?.no_hp ? [{ label: "Nomor Kontak", value: String(userInfo.no_hp), icon: User }] : []),
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <item.icon className="h-3 w-3 text-blue-500" /> {item.label}
                    </p>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Data Programs & Sub Kegiatan dari Session (Khusus PPK) */}
              {(userPrograms.length > 0 || userSubKegiatan.length > 0) && (
                <div className="space-y-4 pt-2">
                  {userPrograms.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <FolderTree className="h-3.5 w-3.5 text-blue-500" /> Program yang Dikelola ({userPrograms.length})
                      </p>
                      <div className="space-y-1.5">
                        {userPrograms.map((prog, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-start justify-between gap-2 text-xs">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{prog.nama_program}</p>
                              <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Kode: {prog.kode_program}</p>
                            </div>
                            {prog.nama_bidang_urusan && (
                              <span className="text-[10px] text-slate-400 shrink-0">{prog.nama_bidang_urusan}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {userSubKegiatan.length > 0 && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-amber-500" /> Sub Kegiatan yang Dipetakan ({userSubKegiatan.length})
                      </p>
                      <div className="space-y-1.5">
                        {userSubKegiatan.map((sub, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg border border-amber-200/70 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 flex items-start justify-between gap-2 text-xs">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{sub.nama_sub_kegiatan}</p>
                              <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">Kode: {sub.kode_sub_kegiatan}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ubah Kata Sandi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi Lama</label>
                    <input type="password" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi Baru</label>
                    <input type="password" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" placeholder="••••••••" />
                  </div>
                </div>
                <button className="h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">Simpan Perubahan</button>
              </div>
            </>
          )}

          {activeTab === "notifikasi" && (
            <>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Pengaturan Notifikasi</h2>
              <div className="space-y-3">
                {[
                  { label: "Notifikasi Email saat Verifikasi", desc: "Terima email saat verifikator menyetujui/menolak usulan", default: true },
                  { label: "Pengingat Deadline", desc: "Pengingat otomatis sebelum batas waktu pengisian RKA", default: true },
                  { label: "Notifikasi Sinkronisasi SIPD", desc: "Pemberitahuan saat data SIPD berhasil diimpor", default: false },
                  { label: "Update Sistem", desc: "Pemberitahuan pembaruan fitur baru", default: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:ring-2 peer-focus:ring-blue-500/40 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "sistem" && (
            <>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Informasi Sistem</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Versi Aplikasi", value: "1.0.0-beta.1", icon: Server },
                  { label: "Framework", value: "Next.js 16.3.3 + React 19", icon: Database },
                  { label: "Status SIPD-RI", value: "Terhubung (Demo)", icon: CheckCircle2, color: "text-emerald-500" },
                  { label: "Database", value: "PostgreSQL 16 (Dev)", icon: Database },
                  { label: "Tahun Anggaran Aktif", value: "2026", icon: Shield },
                  { label: "Terakhir Sync", value: "31 Agustus 2026, 10:30 WIB", icon: RefreshCw },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <item.icon className={`h-3 w-3 ${item.color || ""}`} /> {item.label}
                    </p>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1.5">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Mode Pengembangan
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">Aplikasi saat ini menggunakan data dummy. Untuk produksi, hubungkan ke API backend dan database SIPD-RI yang sesungguhnya.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

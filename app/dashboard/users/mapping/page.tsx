"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Link2, Plus, Search, Trash2, Loader2, Users, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MappingRow {
  id: number
  user_id: number
  username: string
  nama: string
  role: string
  kode_skpd: string | null
  nama_skpd: string | null
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string | null
  created_at: string | null
}

interface PpkUser {
  id: number
  username: string
  nama: string
  kode_skpd: string | null
}

interface SubKegiatanOption {
  kode_sub_kegiatan: string
  nama_sub_kegiatan: string
}

export default function UserMappingPage() {
  const { data: session } = useSession()
  const [mappings, setMappings] = useState<MappingRow[]>([])
  const [ppkUsers, setPpkUsers] = useState<PpkUser[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [searchSub, setSearchSub] = useState("")
  const [subOptions, setSubOptions] = useState<SubKegiatanOption[]>([])
  const [selectedSub, setSelectedSub] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const canManage = useMemo(() => {
    const role = session?.user?.role ?? ""
    return ["Admin", "Kepala OPD", "Kepala Sub Unit"].includes(role)
  }, [session?.user?.role])

  const loadMappings = useCallback(async () => {
    try {
      const res = await fetch("/api/user-sub-kegiatan", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setMappings(json?.data ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat mapping")
    }
  }, [])

  const loadPpkUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/user-sub-kegiatan/ppk-users", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setPpkUsers(json?.data ?? [])
    } catch {
      // abaikan; dropdown kosong
    }
  }, [])

  // Muat sub kegiatan (data asli, difilter SKPD user jika bukan Admin)
  const loadSubOptions = useCallback(async () => {
    try {
      const kodeSkpd = session?.user?.kodeSkpd
      const qs = kodeSkpd ? `?kode_skpd=${encodeURIComponent(kodeSkpd)}&per_page=500` : "?per_page=500"
      const res = await fetch(`/api/ref-sub-kegiatan${qs}`, { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setSubOptions((json?.data ?? []) as SubKegiatanOption[])
    } catch {
      setSubOptions([])
    }
  }, [session?.user?.kodeSkpd])

  useEffect(() => {
    loadMappings()
    loadPpkUsers()
    loadSubOptions()
    setLoading(false)
  }, [loadMappings, loadPpkUsers, loadSubOptions])

  const filteredSubOptions = useMemo(() => {
    const s = searchSub.toLowerCase().trim()
    if (!s) return subOptions
    return subOptions.filter(
      (o) =>
        o.kode_sub_kegiatan.toLowerCase().includes(s) ||
        o.nama_sub_kegiatan.toLowerCase().includes(s)
    )
  }, [subOptions, searchSub])

  const addMapping = async () => {
    if (!selectedUser || !selectedSub) {
      setNotice("Pilih PPK dan sub kegiatan terlebih dahulu.")
      return
    }
    setBusy(true)
    setNotice(null)
    try {
      const res = await fetch("/api/user-sub-kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(selectedUser), kode_sub_kegiatan: selectedSub }),
        cache: "no-store",
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg =
          json?.errors?.kode_sub_kegiatan?.[0] ||
          json?.errors?.user_id?.[0] ||
          json?.message ||
          `Gagal (HTTP ${res.status})`
        setNotice(msg)
      } else {
        setNotice("Mapping sub kegiatan berhasil ditambahkan.")
        setSelectedSub("")
        setSearchSub("")
        await loadMappings()
      }
    } catch {
      setNotice("Gagal terhubung ke server.")
    } finally {
      setBusy(false)
    }
  }

  const removeMapping = async (id: number) => {
    setBusy(true)
    setNotice(null)
    try {
      const res = await fetch(`/api/user-sub-kegiatan/${id}`, { method: "DELETE", cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setNotice("Mapping sub kegiatan berhasil dihapus.")
      await loadMappings()
    } catch {
      setNotice("Gagal menghapus mapping.")
    } finally {
      setBusy(false)
    }
  }

  const fmtWaktu = (iso: string | null) => {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Link2 className="h-4 w-4" />
          </span>
          <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Mapping PPK ↔ Sub Kegiatan</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {canManage
            ? "Kelola sub kegiatan yang boleh dikelola setiap PPK (Admin / Kepala OPD / Kepala Sub Unit)."
            : "Daftar sub kegiatan yang dipetakan ke akun Anda."}
        </p>
      </div>

      {!canManage && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
          Akun Anda (PPK) hanya dapat melihat mapping milik sendiri. Pengelolaan mapping dilakukan oleh Admin / Kepala OPD / Kepala Sub Unit.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      {notice && (
        <div className={`rounded-lg border px-4 py-3 text-xs ${notice.includes("berhasil") ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200"}`}>
          {notice}
        </div>
      )}

      {canManage && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-blue-600" /> Tambah Mapping Baru
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pilih PPK</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">— Pilih PPK —</option>
                {ppkUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cari &amp; Pilih Sub Kegiatan</label>
              <input
                type="text"
                value={searchSub}
                onChange={(e) => setSearchSub(e.target.value)}
                placeholder="Cari kode / nama sub kegiatan..."
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <select
                value={selectedSub}
                onChange={(e) => setSelectedSub(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-xs focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">— Pilih hasil pencarian —</option>
                {filteredSubOptions.slice(0, 100).map((o) => (
                  <option key={o.kode_sub_kegiatan} value={o.kode_sub_kegiatan}>
                    {o.kode_sub_kegiatan} — {o.nama_sub_kegiatan}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" onClick={addMapping} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
              Tambah Mapping
            </Button>
          </div>
        </div>
      )}

      {/* Tabel Mapping */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-blue-600" /> Daftar Mapping ({mappings.length})
          </p>
          <button
            type="button"
            onClick={() => {
              loadMappings()
              loadPpkUsers()
            }}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Muat ulang
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : mappings.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-center text-slate-400">
            <Layers className="h-8 w-8 mb-2" />
            <p className="text-xs">Belum ada mapping sub kegiatan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-[10px] uppercase text-slate-400 text-left">
                  <th className="font-semibold px-4 py-2.5">PPK</th>
                  <th className="font-semibold px-4 py-2.5">SKPD</th>
                  <th className="font-semibold px-4 py-2.5">Sub Kegiatan</th>
                  <th className="font-semibold px-4 py-2.5">Dipetakan</th>
                  {canManage && <th className="font-semibold px-4 py-2.5 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{m.nama}</p>
                      <p className="font-mono text-[10px] text-slate-400">@{m.username}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-slate-700 dark:text-slate-300">{m.nama_skpd || "—"}</p>
                      {m.kode_skpd && <p className="font-mono text-[10px] text-slate-400">{m.kode_skpd}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-slate-800 dark:text-slate-200">{m.nama_sub_kegiatan || m.kode_sub_kegiatan}</p>
                      <p className="font-mono text-[10px] text-blue-600 dark:text-blue-400">{m.kode_sub_kegiatan}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{fmtWaktu(m.created_at)}</td>
                    {canManage && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => removeMapping(m.id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" /> Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
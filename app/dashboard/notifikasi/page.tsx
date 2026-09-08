  "use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react"
import { NotificationItem } from "@/types/notification"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"
import { Button } from "@/components/ui/button"

const fmtWaktu = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function NotifikasiPage() {
  const [items, setItems] = useState<NotificationItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications?limit=100", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setItems(json?.data ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat notifikasi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST", cache: "no-store" })
      setItems((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? null)
    } catch {
      // abaikan
    }
  }

  const unreadCount = items?.filter((n) => !n.is_read).length ?? 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-slate-900 dark:text-white">Notifikasi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pemberitahuan status paket pengadaan (diajukan, dikembalikan, disetujui).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Tandai semua dibaca ({unreadCount})
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Muat ulang
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
          <strong>Gagal memuat data:</strong> {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col" style={{ maxHeight: "min(72vh, 640px)" }}>
        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items && items.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto min-h-0" style={{ overflowY: "auto" }}>
            {items.map((n) => (
              <div
                key={n.id}
                className={`px-5 py-4 flex items-start gap-3 ${n.is_read ? "" : "bg-blue-50/40 dark:bg-blue-500/5"}`}
              >
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.is_read ? "bg-slate-200 dark:bg-slate-700" : "bg-blue-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{n.pesan}</p>
                    <p className="font-mono text-[10px] text-slate-400 whitespace-nowrap">{fmtWaktu(n.created_at)}</p>
                  </div>
                  {n.nama_paket && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Paket: {n.nama_paket}
                      {n.identifikasi_kebutuhan_id ? ` · #${n.identifikasi_kebutuhan_id}` : ""}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${n.tipe === "paket_diajukan" ? statusBadgeClass("Diajukan") : statusBadgeClass("Disetujui")}`}>
                      {n.tipe === "paket_diajukan" ? statusLabel("Diajukan") : n.tipe === "paket_direview" ? "Review" : n.tipe}
                    </span>
                    {!n.is_read && <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">Baru</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center text-slate-400">
            <Bell className="h-8 w-8 mb-2" />
            <p className="text-xs">Belum ada notifikasi.</p>
          </div>
        )}
      </div>
    </div>
  )
}
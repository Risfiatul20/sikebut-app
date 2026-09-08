"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { NotificationItem } from "@/types/notification"
import Link from "next/link"
import { useRouter } from "next/navigation"

const fmtWaktu = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotificationItem[] | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        fetch("/api/notifications/unread-count", { cache: "no-store" }),
        fetch("/api/notifications?limit=8", { cache: "no-store" }),
      ])
      if (countRes.ok) {
        const c = await countRes.json()
        setUnread(c?.data?.unread_count ?? 0)
      }
      if (listRes.ok) {
        const l = await listRes.json()
        setItems(l?.data ?? [])
      }
      setError(false)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 30000)
    return () => clearInterval(t)
  }, [refresh])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST", cache: "no-store" })
      setUnread(0)
      setItems((prev) => prev?.map((n) => ({ ...n, is_read: true })) ?? null)
    } catch {
      // abaikan
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          if (!open) refresh()
        }}
        className="relative h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Notifikasi</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
            {items === null && !error ? (
              <div className="p-6 flex items-center justify-center text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : error ? (
              <div className="p-4 text-xs text-rose-600 dark:text-rose-400">Gagal memuat notifikasi.</div>
            ) : items && items.length > 0 ? (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.identifikasi_kebutuhan_id ? `/dashboard/identifikasi/data` : "/dashboard/notifikasi"}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${n.is_read ? "" : "bg-blue-50/40 dark:bg-blue-500/5"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${n.is_read ? "bg-transparent" : "bg-blue-500"}`} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-800 dark:text-slate-200 leading-snug">{n.pesan}</p>
                      <p className="text-[9px] text-slate-400 mt-1">{fmtWaktu(n.created_at)}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Belum ada notifikasi.</div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2">
            <Link
              href="/dashboard/notifikasi"
              onClick={() => {
                setOpen(false)
                router.push("/dashboard/notifikasi")
              }}
              className="block text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
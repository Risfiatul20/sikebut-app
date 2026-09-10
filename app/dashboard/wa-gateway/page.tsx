"use client"

import { useCallback, useEffect, useState } from "react"
import {
  MessageCircle,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Trash2,
  LogOut,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Layers,
} from "lucide-react"
import { WaDevice, WaDeviceStatus, WaGatewayStatus, WaMessageLog, WA_STATUS_LABEL } from "@/types/wa-gateway"

const STATUS_STYLE: Record<WaDeviceStatus, string> = {
  connecting: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  connected: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  disconnected: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  blocked: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  logged_out: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
}

function StatusDot({ status }: { status: WaDeviceStatus }) {
  const dot =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
        ? "bg-blue-500 animate-pulse"
        : status === "blocked"
          ? "bg-rose-500"
          : "bg-slate-400"
  return <span className={`h-2 w-2 rounded-full ${dot} shrink-0`} />
}

export default function WaGatewayPage() {
  const [status, setStatus] = useState<WaGatewayStatus | null>(null)
  const [logs, setLogs] = useState<WaMessageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form tambah device
  const [showAdd, setShowAdd] = useState(false)
  const [newId, setNewId] = useState("")
  const [newNama, setNewNama] = useState("")
  const [newPriority, setNewPriority] = useState(0)
  const [saving, setSaving] = useState(false)

  // QR scan
  const [qrDevice, setQrDevice] = useState<WaDevice | null>(null)
  const [qrData, setQrData] = useState<{ qrDataUrl?: string; status?: string; nomor?: string } | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)

  // Tes kirim
  const [testNomor, setTestNomor] = useState("")
  const [testPesan, setTestPesan] = useState("")
  const [testBusy, setTestBusy] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const [statusRes, logRes] = await Promise.all([
        fetch("/api/wa-gateway", { cache: "no-store" }),
        fetch("/api/wa-gateway/messages?limit=15", { cache: "no-store" }),
      ])
      if (statusRes.ok) {
        const s = await statusRes.json()
        setStatus(s?.data ?? null)
      }
      if (logRes.ok) {
        const l = await logRes.json()
        setLogs(l?.data ?? [])
      }
      setError(null)
    } catch {
      setError("Gagal memuat data gateway.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [load])

  const addDevice = async () => {
    if (!newId.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/wa-gateway/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: newId.trim(), nama: newNama.trim() || null, priority: newPriority }),
        cache: "no-store",
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || "Gagal menambah device")
      }
      setShowAdd(false)
      setNewId("")
      setNewNama("")
      setNewPriority(0)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menambah device")
    } finally {
      setSaving(false)
    }
  }

  const openQr = async (device: WaDevice) => {
    setQrDevice(device)
    setQrData(null)
    setQrError(null)
    setQrLoading(true)

    // Polling otomatis: QR kadang butuh waktu (koneksi Baileys ke server WA).
    // Coba tiap 3 detik sampai QR muncul / device connected / batas 45 detik.
    const MAX_ATTEMPTS = 15
    let attempt = 0

    while (attempt < MAX_ATTEMPTS) {
      attempt += 1
      try {
        const res = await fetch(`/api/wa-gateway/devices/${device.device_id}/qr`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || "Gagal mengambil QR")
        const data = json?.data ?? null

        // QR siap → tampilkan dan berhenti
        if (data?.qrDataUrl) {
          setQrData(data)
          setQrLoading(false)
          return
        }
        // Sudah connected → berhenti
        if (data?.status === "connected") {
          setQrData(data)
          setQrLoading(false)
          return
        }
      } catch (e) {
        setQrError(e instanceof Error ? e.message : "Gagal mengambil QR")
        setQrLoading(false)
        return
      }

      // Belum ada QR → tunggu 3 detik lalu coba lagi
      await new Promise((r) => setTimeout(r, 3000))
    }

    setQrLoading(false)
    setQrError("QR belum tersedia setelah beberapa saat. Coba klik QR Baru, atau pastikan koneksi internet lancar.")
  }

  const logoutDevice = async (device: WaDevice) => {
    if (!confirm(`Logout device "${device.nama || device.device_id}"? Sesi tersimpan, tinggal scan ulang saat dipakai.`)) return
    try {
      await fetch(`/api/wa-gateway/devices/${device.device_id}/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store",
      })
      await load()
    } catch {
      setError("Gagal logout device.")
    }
  }

  const deleteDevice = async (device: WaDevice) => {
    if (!confirm(`Hapus device "${device.nama || device.device_id}"? Folder sesi ikut dihapus — wajib scan ulang dari awal.`)) return
    try {
      await fetch(`/api/wa-gateway/devices/${device.device_id}`, { method: "DELETE", cache: "no-store" })
      if (qrDevice?.device_id === device.device_id) setQrDevice(null)
      await load()
    } catch {
      setError("Gagal menghapus device.")
    }
  }

  const setPriority = async (device: WaDevice, priority: number) => {
    try {
      await fetch(`/api/wa-gateway/devices/${device.device_id}/priority`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
        cache: "no-store",
      })
      await load()
    } catch {
      setError("Gagal mengubah prioritas.")
    }
  }

  const testSend = async () => {
    if (!testNomor.trim() || !testPesan.trim()) return
    setTestBusy(true)
    setTestMsg(null)
    try {
      const res = await fetch("/api/wa-gateway/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomor: testNomor.trim(), pesan: testPesan.trim() }),
        cache: "no-store",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || "Gagal mengirim")
      setTestMsg({ ok: true, text: "Pesan WA terkirim!" })
      setTimeout(load, 1500)
    } catch (e) {
      setTestMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal mengirim pesan" })
    } finally {
      setTestBusy(false)
    }
  }

  const devices = status?.devices ?? []
  const connectedCount = devices.filter((d) => d.status === "connected").length

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">WhatsApp Gateway</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Notifikasi web juga dikirim ke WhatsApp. Kelola device utama &amp; backup, scan QR, dan pantau pengiriman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Segarkan
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Device
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800/50 bg-rose-50/60 dark:bg-rose-950/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Smartphone className="h-3 w-3" /> Status Gateway
          </p>
          <p className={`text-sm font-bold mt-1.5 flex items-center gap-2 ${status?.reachable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {status?.reachable ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Aktif
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" /> Tidak Terjangkau
              </>
            )}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">{status?.gateway_url || "—"}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Device Terhubung</p>
          <p className="text-sm font-bold mt-1.5 text-slate-900 dark:text-white">
            {connectedCount} / {devices.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{devices.length === 0 ? "Belum ada device — tambah lalu scan QR" : "Utama + backup otomatis"}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Cara Kerja
          </p>
          <p className="text-[11px] font-medium mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
            Notifikasi dikirim via device prioritas 0. Kalau diblokir/logout → otomatis pindah ke device berikutnya.
          </p>
        </div>
      </div>

      {/* Daftar device */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Device WhatsApp ({devices.length})</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="p-10 text-center">
            <QrCode className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Belum ada device. Klik "Tambah Device" lalu scan QR dengan WhatsApp Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {devices.map((device) => (
              <div key={device.id} className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-slate-500" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{device.nama || device.device_id}</p>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${STATUS_STYLE[device.status]}`}>
                        <StatusDot status={device.status} /> {WA_STATUS_LABEL[device.status]}
                      </span>
                      {device.priority === 0 && device.status === "connected" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-[9px] font-bold">
                          UTAMA
                        </span>
                      )}
                      {device.priority > 0 && device.status === "connected" && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[9px] font-bold">
                          BACKUP
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                      {device.device_id} · {device.nomor ? `+${device.nomor}` : "belum scan"} · prioritas {device.priority}
                      {device.last_heartbeat ? ` · heartbeat ${new Date(device.last_heartbeat).toLocaleTimeString("id-ID")}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  {/* Prioritas */}
                  <select
                    value={device.priority}
                    onChange={(e) => setPriority(device, Number(e.target.value))}
                    className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 focus:outline-none"
                    title="Prioritas: 0 = utama, 1+ = backup"
                  >
                    <option value={0}>Utama</option>
                    <option value={1}>Backup 1</option>
                    <option value={2}>Backup 2</option>
                    <option value={3}>Backup 3</option>
                  </select>

                  {device.status !== "connected" && (
                    <button
                      type="button"
                      onClick={() => openQr(device)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" /> Scan
                    </button>
                  )}

                  {device.status === "connected" && (
                    <button
                      type="button"
                      onClick={() => openQr(device)}
                      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" /> QR
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => logoutDevice(device)}
                    title="Logout (sesi tersimpan, scan ulang saat dipakai)"
                    className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDevice(device)}
                    title="Hapus device + sesi (wajib scan ulang)"
                    className="h-8 w-8 rounded-lg border border-rose-200 dark:border-rose-800/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tes kirim */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="h-4 w-4 text-slate-400" /> Tes Kirim Pesan
          </h2>
          <p className="text-[11px] text-slate-400">Uji alur notifikasi end-to-end: kirim langsung ke nomor WhatsApp mana pun.</p>
          <div className="space-y-2">
            <input
              type="text"
              value={testNomor}
              onChange={(e) => setTestNomor(e.target.value)}
              placeholder="Nomor tujuan (contoh: 0812xxxxxxxx)"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            />
            <textarea
              value={testPesan}
              onChange={(e) => setTestPesan(e.target.value)}
              placeholder="Isi pesan…"
              rows={3}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors resize-none"
            />
            <button
              type="button"
              onClick={testSend}
              disabled={testBusy || !testNomor.trim() || !testPesan.trim()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
            >
              {testBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Kirim Sekarang
            </button>
            {testMsg && (
              <p className={`text-[11px] font-medium ${testMsg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {testMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Log pengiriman */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Log Pengiriman (terbaru)</h2>
          </div>
          {logs.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">Belum ada pengiriman.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {log.nama_paket || log.nama_user || `#${log.id}`}
                    </p>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                        log.status === "sent"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : log.status === "failed"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300"
                      }`}
                    >
                      {log.status === "sent" ? "Terkirim" : log.status === "failed" ? "Gagal" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{log.pesan}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                    → +{log.nomor_tujuan} {log.device_id ? `· ${log.device_id}` : ""} ·{" "}
                    {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : ""}
                    {log.error ? ` · ${log.error}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal tambah device */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" /> Tambah Device WhatsApp
              </h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Beri nama device, lalu klik Scan untuk memindai QR dengan WhatsApp. Device pertama = utama (prioritas 0), berikutnya = backup.
            </p>
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">ID Device (unik, contoh: wa-utama)</label>
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="wa-utama"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Nama (opsional)</label>
                <input
                  type="text"
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="WA Utama — HP Dinas"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Prioritas</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none"
                >
                  <option value={0}>0 — Utama</option>
                  <option value={1}>1 — Backup 1</option>
                  <option value={2}>2 — Backup 2</option>
                  <option value={3}>3 — Backup 3</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowAdd(false)} className="h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Batal
              </button>
              <button
                type="button"
                onClick={addDevice}
                disabled={saving || !newId.trim()}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Tambah Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR scan */}
      {qrDevice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-600" /> Scan QR — {qrDevice.nama || qrDevice.device_id}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setQrDevice(null)
                  load()
                }}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {qrLoading ? (
              <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-[11px]">Menyiapkan QR…</p>
              </div>
            ) : qrError ? (
              <div className="py-8 text-center">
                <AlertTriangle className="h-6 w-6 text-rose-500 mx-auto" />
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2">{qrError}</p>
              </div>
            ) : qrData?.qrDataUrl ? (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrData.qrDataUrl} alt="QR Code WhatsApp" className="h-56 w-56" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Buka <span className="font-semibold">WhatsApp → Setelan → Perangkat tertaut → Tautkan perangkat</span>, lalu scan QR ini.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQrData(null)
                    openQr(qrDevice)
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5 inline mr-1" /> QR Baru
                </button>
              </div>
            ) : qrData?.status === "connected" ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">Device terhubung!</p>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{qrData.nomor ? `+${qrData.nomor}` : ""}</p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">QR belum tersedia, coba beberapa saat lagi…</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
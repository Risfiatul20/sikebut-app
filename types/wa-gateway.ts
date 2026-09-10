export type WaDeviceStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "blocked"
  | "logged_out"
  | "pending"

export type WaDevice = {
  id: number
  device_id: string
  nama: string | null
  nomor: string | null
  status: WaDeviceStatus
  is_active: boolean
  priority: number
  last_heartbeat: string | null
  created_at: string | null
}

export type WaGatewayStatus = {
  reachable: boolean
  gateway_url: string
  devices: WaDevice[]
}

export type WaMessageLog = {
  id: number
  user_id: number | null
  nama_user: string | null
  nomor_tujuan: string
  pesan: string
  status: "pending" | "sent" | "failed"
  device_id: string | null
  error: string | null
  identifikasi_kebutuhan_id: number | null
  nama_paket: string | null
  sent_at: string | null
  created_at: string | null
}

export const WA_STATUS_LABEL: Record<WaDeviceStatus, string> = {
  connecting: "Menghubungkan…",
  connected: "Terhubung",
  disconnected: "Terputus",
  blocked: "Diblokir",
  logged_out: "Logout",
  pending: "Menunggu Scan",
}
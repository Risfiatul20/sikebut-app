export interface NotificationItem {
  id: number
  tipe: string
  pesan: string
  identifikasi_kebutuhan_id: number | null
  nama_paket: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationListResponse {
  data: NotificationItem[]
}

export interface NotificationUnreadResponse {
  data: {
    unread_count: number
  }
}
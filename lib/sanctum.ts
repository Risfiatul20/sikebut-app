const API_URL = process.env.API_URL || "http://127.0.0.1:8000"

export interface SanctumSkpd {
  kode_skpd: string
  nama_skpd: string
  parent_kode_skpd?: string | null
}

export interface SanctumSubKegiatan {
  kode_sub_kegiatan: string
  kode_kegiatan: string
  nama_sub_kegiatan: string
}

export interface SanctumUserData {
  id: number | string
  nama?: string
  name?: string
  username: string
  role?: string
  kode_skpd?: string | null
  info?: Record<string, unknown> | null
  created_at?: string
  skpd?: SanctumSkpd | null
  sub_kegiatan?: SanctumSubKegiatan[] | null
  [key: string]: unknown
}

export interface SanctumLoginResponse {
  message?: string
  token_type?: string
  access_token?: string
  user?: SanctumUserData
  [key: string]: unknown
}

/**
 * Login ke Laravel Sanctum menggunakan TOKEN-based auth (bukan SPA cookie).
 *
 * Catatan penting:
 * - Alur `sanctum/csrf-cookie` HANYA berlaku untuk SPA mode cookie-based, dan
 *   tidak bisa dipakai dari server-side Next.js (cookie respons fetch server
 *   tidak pernah masuk ke cookie store browser) -> menyebabkan error 419.
 * - Untuk Next.js App Router, gunakan token bearer: kirim credentials,
 *   terima token, simpan di JWT NextAuth, pakai sebagai `Authorization: Bearer`.
 */
export async function sanctumLogin(
  username: string,
  password: string
): Promise<SanctumLoginResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    const err = new Error(`Login gagal (${res.status}): ${body.slice(0, 500)}`)
    console.error("[sanctumLogin]", err.message)
    throw err
  }

  return res.json()
}

/**
 * Fetch terautentikasi ke backend Laravel.
 * Token diambil dari NextAuth session (disimpan saat login).
 */
export async function sanctumFetch(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })
}

/**
 * Logout dari Laravel Sanctum: mencabut (revoke) token akses user.
 * Dipanggil dari events.signOut NextAuth saat sesi diakhiri.
 */
export async function sanctumLogout(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })
    if (!res.ok) {
      console.error("[sanctumLogout] Gagal logout backend:", res.status)
      return false
    }
    return true
  } catch (err) {
    console.error("[sanctumLogout] Backend tidak terjangkau:", err)
    return false
  }
}

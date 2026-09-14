import type { SanctumUserData } from "@/lib/sanctum"
import type { AuthProgram, AuthKegiatan, AuthSubKegiatan } from "@/types/next-auth"

/**
 * Daftar referensi milik user (program / kegiatan / sub kegiatan hasil mapping PPK)
 * TIDAK disimpan di dalam cookie sesi.
 *
 * Alasan: untuk PPK dengan puluhan sub kegiatan, payload ini bisa puluhan kilobyte.
 * Cookie sesi NextAuth memecah nilai >4KB menjadi banyak cookie (`authjs.session-token.0`,
 * `.1`, ...). Semua cookie itu ikut terkirim di SETIAP request sehingga melewati batas
 * buffer header nginx -> "400 Bad Request: Request Header Or Cookie Too Large".
 *
 * Solusi: cookie hanya menyimpan kredensial kecil (id, username, role, apiToken), lalu
 * daftar referensi diambil ulang dari backend dan di-cache di memori server.
 */
export interface SessionRefs {
  programs: AuthProgram[]
  kegiatans: AuthKegiatan[]
  subKegiatan: AuthSubKegiatan[]
}

export interface SessionRefsResult {
  /** true = data berhasil diambil dari backend (aman untuk menimpa session). */
  ok: boolean
  refs: SessionRefs
}

const API_URL = process.env.API_URL || "http://127.0.0.1:8000"
/** Lama cache data yang berhasil diambil. */
const TTL_OK_MS = 5 * 60 * 1000
/** Lama cache kegagalan (agar backend mati tidak dihantam berulang kali). */
const TTL_FAIL_MS = 15 * 1000
/** Batas jumlah token yang di-cache agar memori server aman. */
const MAX_ENTRIES = 200
const FETCH_TIMEOUT_MS = 5000

const EMPTY_REFS: SessionRefs = { programs: [], kegiatans: [], subKegiatan: [] }

const cache = new Map<string, { at: number; result: SessionRefsResult }>()

function pruneCache() {
  const now = Date.now()
  for (const [token, entry] of cache) {
    const ttl = entry.result.ok ? TTL_OK_MS : TTL_FAIL_MS
    if (now - entry.at > ttl) cache.delete(token)
  }
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

/**
 * Ambil daftar program/kegiatan/sub kegiatan milik user (cached, aman gagal).
 * Gagal jaringan / backend down -> `ok: false` dan session lama dibiarkan apa adanya.
 */
export async function getSessionRefs(apiToken?: string | null): Promise<SessionRefsResult> {
  if (!apiToken) return { ok: false, refs: EMPTY_REFS }

  const cached = cache.get(apiToken)
  if (cached) {
    const ttl = cached.result.ok ? TTL_OK_MS : TTL_FAIL_MS
    if (Date.now() - cached.at < ttl) return cached.result
  }

  try {
    const res = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!res.ok) {
      const result: SessionRefsResult = { ok: false, refs: EMPTY_REFS }
      pruneCache()
      cache.set(apiToken, { at: Date.now(), result })
      return result
    }

    const json = (await res.json()) as { user?: SanctumUserData }
    const user = json?.user
    if (!user) return { ok: false, refs: EMPTY_REFS }

    const result: SessionRefsResult = {
      ok: true,
      refs: {
        programs: (user.programs ?? []) as AuthProgram[],
        kegiatans: (user.kegiatans ?? []) as AuthKegiatan[],
        subKegiatan: (user.sub_kegiatan ?? []) as AuthSubKegiatan[],
      },
    }
    pruneCache()
    cache.set(apiToken, { at: Date.now(), result })
    return result
  } catch {
    const result: SessionRefsResult = { ok: false, refs: EMPTY_REFS }
    pruneCache()
    cache.set(apiToken, { at: Date.now(), result })
    return result
  }
}

/** Buang cache sebuah token (mis. setelah profil diperbarui). */
export function invalidateSessionRefs(apiToken?: string | null) {
  if (apiToken) cache.delete(apiToken)
}

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sanctumLogin, sanctumLogout, SanctumUserData } from "@/lib/sanctum"
import { getSessionRefs, invalidateSessionRefs } from "@/lib/session-refs"
import { AuthUserInfo } from "@/types/next-auth"

/**
 * Backend mengirim role lowercase ("admin", "ppk", dst).
 * Normalisasi ke label yang dipakai UI (UserRole di types/user.ts).
 */
function normalizeRole(role?: string | null): string {
  const key = (role ?? "").toLowerCase().trim()
  const map: Record<string, string> = {
    "admin": "Admin",
    "kepala opd": "Kepala OPD",
    "kepala sub unit": "Kepala Sub Unit",
    "ppk": "PPK",
    "verifikator": "Verifikator",
  }
  return map[key] ?? (role ?? "")
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const usernameStr = credentials.username as string
        const passwordStr = credentials.password as string

        try {
          const json = await sanctumLogin(usernameStr, passwordStr)

          // Format response sesuai API login:
          // { message, token_type, access_token, user: { ..., skpd: {...}|null, programs: [...], subkegiatans: [...] } }
          const user = (json.user ?? {}) as SanctumUserData
          const apiToken = String(json.access_token || json.token || "")

          // Relasi SKPD: nama diambil dari objek skpd; tanpa relasi -> "-"
          const kodeSkpd = String(user.kode_skpd || user.skpd?.kode_skpd || "")
          const namaSkpd = String(user.skpd?.nama_skpd || user.nama_skpd || "-")

          // Sesi hanya menyimpan data user dan SKPD esensial.
          // Data program, kegiatan, dan subkegiatan TIDAK disimpan di JWT cookie
          // agar ukuran cookie tetap sangat kecil dan mencegah error Nginx 494.
          return {
            id: String(user.id ?? ""),
            username: user.username || usernameStr,
            name: user.nama || user.name || user.username || usernameStr,
            email: user.username || usernameStr,
            apiToken: apiToken,
            role: normalizeRole(user.role),
            kodeSkpd: kodeSkpd || "",
            namaSkpd: namaSkpd || "-",
            info: (user.info || {}) as AuthUserInfo,
          }
        } catch (error) {
          console.error("Backend login error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session }) {
      return !!session?.user
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.apiToken = user.apiToken
        token.role = user.role
        token.kodeSkpd = user.kodeSkpd
        token.namaSkpd = user.namaSkpd
        token.info = user.info
      }

      // PENENTING: hanya data kecil yang disimpan di cookie sesi.
      // Daftar program/kegiatan/sub kegiatan (bisa puluhan KB untuk PPK) sengaja
      // TIDAK disimpan di cookie — kalau disimpan, cookie terpecah jadi banyak
      // bagian (`authjs.session-token.0/.1/...`) dan memicu 400
      // "Request Header Or Cookie Too Large" di nginx. Daftar itu diambil ulang
      // server-side melalui lib/session-refs.ts. Baris `delete` di bawah juga
      // menyusutkan cookie milik sesi lama yang masih menyimpan data besar.
      delete token.subKegiatan
      delete token.subkegiatans
      delete token.kegiatans
      delete token.programs

      // Saat updateSession() dipanggil (mis. simpan No. WhatsApp) — ambil ulang info dari backend.
      if (trigger === "update" && token.apiToken) {
        try {
          const res = await fetch(`${process.env.API_URL || "http://127.0.0.1:8000"}/api/v1/auth/me`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.apiToken}`,
            },
            cache: "no-store",
          })
          if (res.ok) {
            const json = await res.json()
            const fresh = json?.user
            if (fresh) {
              if (fresh.info) token.info = fresh.info
              if (fresh.nama) token.name = fresh.nama
            }
          }
          // Profil berubah -> cache daftar referensi ikut disegarkan.
          invalidateSessionRefs(token.apiToken as string)
        } catch {
          // Jangan gagalkan session kalau backend sedang tidak bisa diakses.
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.username) session.user.username = token.username as string
      if (token.apiToken) session.user.apiToken = token.apiToken as string
      if (token.role) session.user.role = token.role as string
      if (token.kodeSkpd) session.user.kodeSkpd = token.kodeSkpd as string
      if (token.namaSkpd) session.user.namaSkpd = token.namaSkpd as string
      if (token.info) session.user.info = token.info

      // Data referensi diambil dari cache server (bukan dari cookie).
      // Kalau backend sedang tidak bisa diakses, session dibiarkan seperti adanya.
      if (token.apiToken) {
        const { ok, refs } = await getSessionRefs(token.apiToken as string)
        if (ok) {
          session.user.programs = refs.programs
          session.user.kegiatans = refs.kegiatans
          session.user.subKegiatan = refs.subKegiatan
          session.user.subkegiatans = refs.subKegiatan
        }
      }

      return session
    },
  },
  events: {
    // Saat user logout: cabut token akses di backend Laravel Sanctum
    async signOut(message) {
      const token = message as { apiToken?: string } | null
      if (token?.apiToken) {
        await sanctumLogout(token.apiToken as string)
      }
    },
  },
})

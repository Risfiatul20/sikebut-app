import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sanctumLogin, sanctumLogout, SanctumUserData } from "@/lib/sanctum"

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

          // Format response sesuai API login asli:
          // { message, token_type, access_token, user: { ..., skpd: {...}|null, sub_kegiatan: [...] } }
          const user = (json.user ?? {}) as SanctumUserData
          const apiToken = json.access_token ?? ""

          // Relasi SKPD: nama diambil dari objek skpd; tanpa relasi -> "-"
          const kodeSkpd = user.kode_skpd ?? user.skpd?.kode_skpd ?? ""
          const namaSkpd = user.skpd?.nama_skpd ?? "-"

          return {
            id: String(user.id ?? ""),
            username: user.username || usernameStr,
            name: user.nama || user.name || user.username || usernameStr,
            email: user.username || usernameStr,
            apiToken: apiToken,
            role: normalizeRole(user.role),
            kodeSkpd,
            namaSkpd: namaSkpd || "-",
            info: user.info ?? {},
            subKegiatan: user.sub_kegiatan ?? [],
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
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.apiToken = user.apiToken
        token.role = user.role
        token.kodeSkpd = user.kodeSkpd
        token.namaSkpd = user.namaSkpd
        token.info = user.info
        token.subKegiatan = user.subKegiatan
      }
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.username) session.user.username = token.username as string
      if (token.apiToken) session.user.apiToken = token.apiToken as string
      if (token.role) session.user.role = token.role as string
      if (token.kodeSkpd) session.user.kodeSkpd = token.kodeSkpd as string
      if (token.namaSkpd) session.user.namaSkpd = token.namaSkpd as string
      if (token.info) session.user.info = token.info
      if (token.subKegiatan) session.user.subKegiatan = token.subKegiatan
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

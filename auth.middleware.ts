import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

/**
 * Instance NextAuth KHUSUS untuk middleware (proxy) pelindung `/dashboard`.
 *
 * Mengapa dipisah dari `auth.ts`:
 * - Callback `session` di `auth.ts` mengambil daftar referensi (program/kegiatan/
 *   sub kegiatan) dari backend. Kalau instance yang sama dipakai middleware,
 *   setiap navigasi `/dashboard` akan ikut memicu permintaan ke backend → lambat.
 * - Middleware hanya butuh 1 hal: "ada sesi atau tidak". Instance di bawah ini
 *   cukup mendekode cookie JWT (nama cookie + `AUTH_SECRET` sama dengan `auth.ts`),
 *   tanpa panggilan jaringan apa pun.
 */
export const { auth: proxy } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {},
      // Provider ini tidak pernah dipakai untuk login di middleware;
      // hanya syarat agar konfigurasi NextAuth valid.
      authorize: () => null,
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
})

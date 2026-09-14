// Pelindung rute /dashboard. Pakai instance ringan (tanpa panggilan backend),
// lihat penjelasan di auth.middleware.ts.
export { proxy } from "@/auth.middleware"

export const config = {
  matcher: ["/dashboard/:path*"],
}

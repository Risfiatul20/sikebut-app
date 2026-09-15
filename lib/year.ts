import { cookies } from "next/headers"

export const DEFAULT_YEAR = 2026

/**
 * Mengambil tahun aktif dari cookie `sikebut_year` pada Next.js Server / API Route.
 * Fallback ke tahun berjalan atau DEFAULT_YEAR jika cookie belum ada/invalid.
 */
export async function getSelectedYear(): Promise<string> {
  const cookieStore = await cookies()
  const val = cookieStore.get("sikebut_year")?.value
  if (val && /^\d{4}$/.test(val)) {
    return val
  }
  const current = new Date().getFullYear()
  return String(Math.max(DEFAULT_YEAR, current))
}

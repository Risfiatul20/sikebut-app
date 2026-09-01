import { auth } from "@/auth"
import { sanctumFetch } from "@/lib/sanctum"

/**
 * Fetch wrapper ke backend Laravel Sanctum
 * Otomatis menyertakan session cookie + Bearer token dari NextAuth session
 */
export async function getApi<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await auth()

  if (!session?.user.apiToken) {
    throw new Error("Unauthorized")
  }

  const res = await sanctumFetch(
    path,
    {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    },
    session.user.apiToken
  )

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

/**
 * POST helper ke backend Sanctum
 */
export async function postApi<T>(path: string, data: unknown): Promise<T> {
  return getApi<T>(path, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

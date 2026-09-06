"use client"

import { useState, useCallback } from "react"
import { StatusReview } from "@/types/identifikasi"

export interface ReviewPayload {
  status_review: StatusReview
  catatan_reviewer: string | null
  catatan_reviewer_detail: Record<string, unknown> | null
}

export function useReviewPaket() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const reset = useCallback(() => {
    setError(null)
    setSuccessMsg(null)
  }, [])

  const review = useCallback(
    async (paketId: number, payload: ReviewPayload): Promise<boolean> => {
      reset()
      setIsLoading(true)
      try {
        const res = await fetch(`/api/identifikasi/${paketId}/review`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        })

        const text = await res.text()
        let json: { success?: boolean; message?: string; error?: string } = {}
        try {
          json = text ? JSON.parse(text) : {}
        } catch {
          // not JSON
        }

        if (res.ok && (json.success || res.status === 200)) {
          setSuccessMsg(json.message || "Hasil review berhasil disimpan")
          return true
        }
        setError(json.message || json.error || `Gagal review paket (status ${res.status})`)
        return false
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan")
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [reset]
  )

  return { review, isLoading, error, successMsg, reset }
}

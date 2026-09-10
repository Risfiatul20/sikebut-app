"use client"

import { statusLabel } from "@/lib/status-paket"
import { MessageCircle, RefreshCw, XCircle, AlertCircle } from "lucide-react"

interface CatatanVerifikatorPanelProps {
  catatanReviewer?: string | null
  catatanReviewerDetail?: Record<string, string> | null
  statusReview?: string
  paketId?: string | number
  onAjukanReview?: () => void
  isSubmitting?: boolean
}

export function CatatanVerifikatorPanel({
  catatanReviewer,
  statusReview,
  onAjukanReview,
  isSubmitting = false,
}: CatatanVerifikatorPanelProps) {
  const isDitolak = statusReview === "Perlu Perbaikan"
  const hasGlobalNote = Boolean(catatanReviewer?.trim())

  if (!hasGlobalNote && !isDitolak) {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 overflow-hidden animate-in fade-in duration-200">
      <div className="p-3 px-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            {isDitolak ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" /> : <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-xs text-amber-900 dark:text-amber-100">
                Catatan Umum Verifikator
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                isDitolak
                  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border-amber-200 dark:border-amber-500/30"
              }`}>
                {statusLabel(statusReview) || "Perlu Perbaikan"}
              </span>
            </div>
            {hasGlobalNote && (
              <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed font-medium break-words">
                {catatanReviewer}
              </p>
            )}
            {!hasGlobalNote && (
              <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
                Harap perhatikan masukan dari Verifikator sebelum mengajukan kembali paket ini.
              </p>
            )}
          </div>
        </div>

        {isDitolak && onAjukanReview && (
          <button
            type="button"
            onClick={onAjukanReview}
            disabled={isSubmitting}
            className="h-7 px-3 shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSubmitting ? "animate-spin" : ""}`} />
            <span>Ajukan Ulang</span>
          </button>
        )}
      </div>
    </div>
  )
}
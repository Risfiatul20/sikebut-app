"use client"

import { useState } from "react"
import { statusLabel } from "@/lib/status-paket"
import { MessageCircle, ListChecks, AlertCircle, ChevronDown, ChevronUp, RefreshCw, XCircle } from "lucide-react"

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
  catatanReviewerDetail,
  statusReview,
  onAjukanReview,
  isSubmitting = false,
}: CatatanVerifikatorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const detailEntries = Object.entries(catatanReviewerDetail || {}).filter(([_, v]) => Boolean(v?.trim()))
  const hasGlobalNote = Boolean(catatanReviewer?.trim())
  const hasDetailNotes = detailEntries.length > 0
  const isDitolak = statusReview === "Perlu Perbaikan"

  if (!hasGlobalNote && !hasDetailNotes && !isDitolak) {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 overflow-hidden shadow-2xs animate-in fade-in duration-200">
      {/* Header Panel */}
      <div className="p-3.5 px-4 flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 bg-amber-100/50 dark:bg-amber-900/20">
        <div className="flex items-center gap-2.5">
          <span className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            {isDitolak ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" /> : <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs text-amber-900 dark:text-amber-100">
                Catatan Verifikator
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                isDitolak
                  ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border-amber-200 dark:border-amber-500/30"
              }`}>
                {statusLabel(statusReview) || "Perlu Perbaikan"}
              </span>
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
              Harap perhatikan masukan dari Verifikator sebelum mengajukan kembali paket ini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDitolak && onAjukanReview && (
            <button
              type="button"
              onClick={onAjukanReview}
              disabled={isSubmitting}
              className="h-7 px-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isSubmitting ? "animate-spin" : ""}`} />
              <span>Ajukan Ulang</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/40 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body Panel */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Catatan Global */}
          {hasGlobalNote && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <MessageCircle className="h-3 w-3 text-amber-600" /> Catatan Umum Paket:
              </p>
              <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-800/40 leading-relaxed font-medium">
                {catatanReviewer}
              </p>
            </div>
          )}

          {/* Catatan Per-Field */}
          {hasDetailNotes && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <ListChecks className="h-3 w-3 text-amber-600" /> Catatan per Field Isian ({detailEntries.length}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {detailEntries.map(([path, note]) => (
                  <div
                    key={path}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/40 space-y-1"
                  >
                    <p className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      {path}
                    </p>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

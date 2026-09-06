"use client"

import { AlertCircle } from "lucide-react"

interface FieldCatatanBadgeProps {
  note?: string | null
}

export function FieldCatatanBadge({ note }: FieldCatatanBadgeProps) {
  if (!note?.trim()) return null

  return (
    <div className="mt-1.5 flex items-start gap-1.5 p-2 px-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 text-[11px] text-amber-900 dark:text-amber-200 animate-in fade-in duration-150">
      <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="leading-tight">
        <span className="font-bold text-[9px] uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
          Catatan Verifikator:
        </span>
        <span className="font-medium">{note}</span>
      </div>
    </div>
  )
}

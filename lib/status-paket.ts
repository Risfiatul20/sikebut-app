/**
 * Vocabulary STATUS REVIEW resmi (sistem of record) — disamakan dengan backend Laravel:
 *   Draft → Diajukan → Disetujui
 *                  ↘ Perlu Perbaikan (dikembalikan ke PPK)
 *
 * Label tampilan dibuat ramah: "Diajukan" ditampilkan sebagai "Menunggu Review".
 */

export type StatusReview = "Draft" | "Diajukan" | "Disetujui" | "Perlu Perbaikan"

export const STATUS_REVIEW_VALUES: StatusReview[] = [
  "Draft",
  "Diajukan",
  "Disetujui",
  "Perlu Perbaikan",
]

/** Label yang ditampilkan ke pengguna. */
export const STATUS_REVIEW_LABEL: Record<StatusReview, string> = {
  Draft: "Draft",
  Diajukan: "Menunggu Review",
  Disetujui: "Disetujui",
  "Perlu Perbaikan": "Perlu Perbaikan",
}

/** Ambil label tampilan; nilai tak dikenal ditampilkan apa adanya. */
export function statusLabel(status?: string | null): string {
  if (!status) return "-"
  return STATUS_REVIEW_LABEL[status as StatusReview] ?? status
}

/** Class Tailwind untuk badge status (border + bg + text). */
export function statusBadgeClass(status?: string | null): string {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    case "Diajukan":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
    case "Disetujui":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
    case "Perlu Perbaikan":
      return "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-200 dark:border-red-500/30"
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  }
}

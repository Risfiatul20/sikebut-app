"use client"

import { useMemo, useState } from "react"
import { IdentifikasiKebutuhan } from "@/types/identifikasi"
import { useReviewPaket } from "@/hooks/useReviewPaket"
import { IdentifikasiDetailModal } from "@/components/identifikasi/identifikasi-detail-modal"
import {
  X,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  ShieldCheck,
  FileText,
  MessageCircle,
  ListChecks,
  AlertCircle,
  DollarSign,
} from "lucide-react"

interface ReviewPaketModalProps {
  item: IdentifikasiKebutuhan | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FieldComment {
  path: string
  label: string
  value: string
}

const buildFieldComments = (item: IdentifikasiKebutuhan): FieldComment[] => {
  const fd = (item.form_data || {}) as Record<string, unknown>
  const result: FieldComment[] = []

  const mainFields: Array<[string, string, unknown]> = [
    ["nama_paket", "Nama Paket", fd.nama_paket],
    ["uraian", "Uraian Pekerjaan", fd.uraian || fd.uraian_pekerjaan],
    ["spesifikasi", "Spesifikasi", fd.spesifikasi || fd.spesifikasi_pekerjaan],
    ["volume", "Volume", fd.volume ? `${fd.volume} ${fd.volume_satuan || ""}` : null],
    ["sumber_dana", "Sumber Dana", fd.sumber_dana],
    ["metode_pengadaan", "Metode Pengadaan", fd.metode_pengadaan || item.cara_pengadaan],
    ["status_review", "Status Review Saat Ini", item.status_review],
  ]
  mainFields.forEach(([path, label, value]) => {
    result.push({ path, label, value: value ? String(value) : "-" })
  })

  const lokasiList = Array.isArray(fd.lokasi) ? (fd.lokasi as Array<Record<string, string>>) : []
  if (lokasiList.length > 0) {
    result.push({
      path: "lokasi",
      label: `Lokasi Pengadaan (${lokasiList.length} item)`,
      value: lokasiList.map((l) => l.detail || `${l.kecamatan || ""}, ${l.kabupaten || ""}`).filter(Boolean).join(" | "),
    })
  }

  if (item.anggaran && item.anggaran.length > 0) {
    item.anggaran.forEach((ag, idx) => {
      result.push({
        path: `anggaran.${idx}`,
        label: `Rincian Anggaran #${idx + 1}: ${ag.standar_harga?.nama_standar_harga || ag.nama_standar_harga || ag.kode_standar_harga}`,
        value: `Rekening ${ag.sipd_penetapan?.kode_rekening || ag.kode_rekening || "-"} • Pagu: Rp ${Number(ag.pagu).toLocaleString("id-ID")}`,
      })
    })
  }

  return result
}

const formatRupiah = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(v ?? 0))

export function ReviewPaketModal({ item, open, onClose, onSuccess }: ReviewPaketModalProps) {
  const { review, isLoading, error, successMsg } = useReviewPaket()
  const [activeTab, setActiveTab] = useState<"detail" | "catatan" | "keputusan">("catatan")
  const [fieldComments, setFieldComments] = useState<Record<string, string>>({})
  const [globalComment, setGlobalComment] = useState("")
  const [decisionStatus, setDecisionStatus] = useState<"Disetujui" | "Ditolak" | "Menunggu Review" | "Draft">("Disetujui")

  // Inisialisasi state lokal dari props `item` (derive via useMemo, bukan setState di dalam useEffect)
  const initialComments = useMemo<Record<string, string>>(() => {
    if (!item) return {}
    return (item.catatan_reviewer_detail as Record<string, string> | null) || {}
  }, [item])
  const initialGlobalComment = useMemo(() => item?.catatan_reviewer || "", [item])
  const initialDecisionStatus = useMemo<"Disetujui" | "Ditolak" | "Menunggu Review" | "Draft">(() => {
    if (!item) return "Disetujui"
    if (item.status_review === "Draft") return "Disetujui"
    return item.status_review
  }, [item])
  const initialActiveTab = useMemo<"detail" | "catatan" | "keputusan">(() => "catatan", [])

  // Pakai state lokal dengan nilai derived — agar perubahan fieldComments bisa terjadi saat user mengetik
  // Inisialisasi hanya dijalankan satu kali saat mount; perubahan item berikutnya diabaikan untuk menjaga UX tetap
  // (state yang relevan hanya berubah ketika user berinteraksi; tidak perlu reset ke nilai item baru setiap saat item berubah)
  void initialComments
  void initialGlobalComment
  void initialDecisionStatus
  void initialActiveTab

  const fieldCommentsList = useMemo(() => (item ? buildFieldComments(item) : []), [item])

  const getFieldCommentValue = (path: string) => fieldComments[path] || ""

  const setFieldCommentValue = (path: string, value: string) => {
    setFieldComments((prev) => {
      const next = { ...prev }
      if (value) next[path] = value
      else delete next[path]
      return next
    })
  }

  const submitReview = async (status: "Disetujui" | "Ditolak" | "Menunggu Review") => {
    if (!item) return

    const cleanedDetails: Record<string, string> = {}
    Object.entries(fieldComments).forEach(([k, v]) => {
      if (v && v.trim()) cleanedDetails[k] = v.trim()
    })

    const ok = await review(item.id, {
      status_review: status,
      catatan_reviewer: globalComment.trim() || null,
      catatan_reviewer_detail: Object.keys(cleanedDetails).length > 0 ? cleanedDetails : null,
    })

    if (ok) {
      onSuccess()
      setTimeout(() => onClose(), 600)
    }
  }

  if (!open || !item) return null

  const totalPagu = item.anggaran?.reduce((s, a) => Number(s) + Number(a.pagu), 0) || 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">Review Paket oleh Verifikator</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                  ID #{item.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {item.nama_paket} • {item.nama_skpd} • Status Saat Ini: {item.status_review}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 w-fit">
            {[
              { id: "catatan", label: "Catatan Verifikator", icon: MessageCircle },
              { id: "detail", label: "Detail Paket", icon: FileText },
              { id: "keputusan", label: "Keputusan Review", icon: ShieldCheck },
            ].map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    activeTab === t.id
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Toast messages */}
        {error && (
          <div className="mx-6 mt-3 p-2.5 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {successMsg}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === "catatan" && (
            <div className="p-6 space-y-5">
              {/* Catatan Global */}
              <section className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Catatan Global (untuk keseluruhan paket)
                </p>
                <textarea
                  value={globalComment}
                  onChange={(e) => setGlobalComment(e.target.value)}
                  rows={3}
                  placeholder="Berikan catatan umum untuk seluruh paket (opsional)."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
                />
                <p className="text-[10px] text-slate-500 italic">Disimpan di kolom <code>catatan_reviewer</code> pada tabel <code>dev.identifikasi_kebutuhan</code>.</p>
              </section>

              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Catatan per-Field */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5" /> Catatan per Field Isian ({Object.keys(fieldComments).filter(k => fieldComments[k]?.trim()).length}/{fieldCommentsList.length})
                  </p>
                  <span className="text-[10px] text-slate-500 italic">Disimpan di JSONB <code>catatan_reviewer_detail</code></span>
                </div>

                <div className="space-y-2.5">
                  {fieldCommentsList.map((fc) => {
                    const value = getFieldCommentValue(fc.path)
                    const hasNote = !!value?.trim()
                    return (
                      <div
                        key={fc.path}
                        className={`p-3 rounded-lg border transition-colors ${
                          hasNote
                            ? "border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-950/20"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {fc.label}
                            </p>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 mt-0.5 truncate" title={fc.value}>
                              {fc.value}
                            </p>
                          </div>
                          {hasNote && (
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                              ada catatan
                            </span>
                          )}
                        </div>
                        <textarea
                          value={value}
                          onChange={(e) => setFieldCommentValue(fc.path, e.target.value)}
                          rows={1}
                          placeholder="Catatan untuk field ini (opsional)..."
                          className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none"
                        />
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === "detail" && (
            <div className="p-6">
              <IdentifikasiDetailModal item={item} onClose={onClose} />
            </div>
          )}

          {activeTab === "keputusan" && (
            <div className="p-6 space-y-5">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Ringkasan Paket
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-slate-500">Total Pagu</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                      {formatRupiah(totalPagu)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">SKPD</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.nama_skpd}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500">PPK / Pembuat</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {item.pembuat?.nama || item.nama_user || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <section className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Status & Keputusan Verifikator
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "Disetujui", label: "Setujui", desc: "Usulan final & disetujui", icon: CheckCircle2, color: "emerald" },
                    { value: "Ditolak", label: "Minta Perbaikan", desc: "Kembalikan ke PPK untuk direvisi", icon: XCircle, color: "red" },
                    { value: "Menunggu Review", label: "Simpan Catatan Saja", desc: "Status tetap Menunggu Review", icon: MessageSquareWarning, color: "amber" },
                  ].map((opt) => {
                    const Icon = opt.icon
                    const isSelected = decisionStatus === opt.value
                    const colorClass = opt.color === "emerald" ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10" : opt.color === "red" ? "border-red-500 bg-red-50/60 dark:bg-red-500/10" : "border-amber-500 bg-amber-50/60 dark:bg-amber-500/10"
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDecisionStatus(opt.value as typeof decisionStatus)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected ? `${colorClass} shadow-sm` : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${
                            opt.color === "emerald" ? "text-emerald-600" : opt.color === "red" ? "text-red-600" : "text-amber-600"
                          }`} />
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <MessageCircle className="h-3.5 w-3.5 text-slate-400" />
                  <span>Catatan Global: <b className="text-slate-900 dark:text-white">{globalComment.trim() || <em className="text-slate-400">tidak ada</em>}</b></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                  <span>Catatan per-Field: <b className="text-slate-900 dark:text-white">{Object.values(fieldComments).filter((v) => v?.trim()).length} dari {fieldCommentsList.length}</b></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => submitReview("Menunggu Review")}
                  disabled={isLoading}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <MessageSquareWarning className="h-4 w-4" />
                  Simpan Catatan (Status Tetap)
                </button>
                <button
                  type="button"
                  onClick={() => submitReview("Ditolak")}
                  disabled={isLoading}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Minta Perbaikan
                </button>
                <button
                  type="button"
                  onClick={() => submitReview("Disetujui")}
                  disabled={isLoading}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Setujui (Final)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { IdentifikasiKebutuhan, RiwayatItem } from "@/types/identifikasi"
import { statusLabel, statusBadgeClass } from "@/lib/status-paket"
import { getFieldSections, formatFieldValue, FieldDef } from "@/lib/field-registry"
import { useReviewPaket } from "@/hooks/useReviewPaket"
import { FieldCatatanBadge } from "@/components/identifikasi/field-catatan-badge"
import {
  X,
  Layers,
  Building2,
  DollarSign,
  Calendar,
  Shield,
  MapPin,
  Tag,
  CheckCircle2,
  User,
  History,
  Loader2,
  Pencil,
  MessageCircle,
  ListChecks,
  AlertCircle,
  ShieldCheck,
  XCircle,
  MessageSquareWarning,
} from "lucide-react"

interface DetailReviewModalProps {
  item: IdentifikasiKebutuhan | null
  canReview: boolean
  onClose: () => void
  onSuccess: () => void
}

const fmtRupiah = (v: number | string) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(
    Number(v ?? 0)
  )

const fmtWaktu = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

// ---------------------------------------------------------------------------
// Satu baris field: label + nilai + ikon pensil (tambah catatan verifikator)
// ---------------------------------------------------------------------------
function FieldRow({
  def,
  value,
  note,
  readOnly,
  onNote,
}: {
  def: { key: string; label: string }
  value: string
  note?: string
  readOnly?: boolean
  onNote?: (v: string) => void
}) {
  const [open, setOpen] = useState(Boolean(note?.trim()))
  const hasNote = Boolean(note?.trim())

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        hasNote
          ? "border-amber-300 dark:border-amber-700/50 bg-amber-50/40 dark:bg-amber-950/20"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {def.label}
          </p>
          <p className="text-xs text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed break-words">{value}</p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            title={open ? "Tutup kolom catatan" : "Tambah catatan verifikator untuk field ini"}
            className={`h-6 w-6 shrink-0 rounded-md flex items-center justify-center transition-colors ${
              hasNote
                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                : "bg-slate-100 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-900/30 dark:text-slate-500 dark:hover:text-indigo-300"
            }`}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      {hasNote && <FieldCatatanBadge note={note} />}

      {open && !readOnly && (
        <textarea
          value={note || ""}
          onChange={(e) => onNote?.(e.target.value)}
          rows={2}
          placeholder="Catatan verifikator untuk field ini (opsional)..."
          className="mt-2 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors resize-none"
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal terpadu: Detail Paket + Catatan Verifikator + Keputusan Review
// ---------------------------------------------------------------------------
export function DetailReviewModal({ item, canReview, onClose, onSuccess }: DetailReviewModalProps) {
  const { review, isLoading, error, successMsg, setError } = useReviewPaket()
  const [fieldComments, setFieldComments] = useState<Record<string, string>>({})
  const [globalComment, setGlobalComment] = useState("")
  const [pendingAction, setPendingAction] = useState<"approve" | "return" | "note" | null>(null)
  const [riwayat, setRiwayat] = useState<RiwayatItem[] | null>(null)
  const [riwayatError, setRiwayatError] = useState(false)

  // Reset state setiap kali item berubah (perbaikan bug: state tidak pernah di-reset antar paket)
  useEffect(() => {
    if (!item) return
    setFieldComments((item.catatan_reviewer_detail as Record<string, string> | null) || {})
    setGlobalComment(item.catatan_reviewer || "")
    setPendingAction(null)
    setError(null)
    setRiwayat(null)
    setRiwayatError(false)

    let cancelled = false
    fetch(`/api/identifikasi/${item.id}/riwayat`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        const json = await res.json()
        if (!cancelled) setRiwayat(json.data ?? [])
      })
      .catch(() => {
        if (!cancelled) setRiwayatError(true)
      })
    return () => {
      cancelled = true
    }
  }, [item?.id, item])

  const fd = useMemo(() => ((item?.form_data || {}) as Record<string, unknown>) ?? {}, [item])
  const sections = useMemo(() => getFieldSections(item?.jenis_pengadaan), [item?.jenis_pengadaan])

  // Kumpulkan baris field untuk penghitung catatan
  const allFieldDefs = useMemo<FieldDef[]>(() => sections.flatMap((s) => s.fields), [sections])

  // Nilai terformat per field (hanya field yang terisi)
  const fieldValues = useMemo(() => {
    const map: Record<string, string> = {}
    if (!item) return map
    allFieldDefs.forEach((f) => {
      const v = formatFieldValue(f, fd)
      if (v) map[f.key] = v
    })
    return map
  }, [allFieldDefs, fd, item])

  const lokasiList = useMemo(
    () => (Array.isArray(fd.lokasi) ? (fd.lokasi as Array<Record<string, string>>) : []),
    [fd]
  )
  const lokasiValue = lokasiList
    .map((l) => l.detail || [l.kecamatan, l.kabupaten, l.provinsi].filter(Boolean).join(", "))
    .filter(Boolean)
    .join(" | ")
  const volumeRaw = fd.volume ? `${fd.volume} ${fd.volume_satuan || "Unit"}` : null

  const setFieldComment = (path: string, value: string) => {
    setFieldComments((prev) => {
      const next = { ...prev }
      if (value && value.trim()) next[path] = value
      else delete next[path]
      return next
    })
  }

  const countedNotes = Object.values(fieldComments).filter((v) => v?.trim()).length

  const submitReview = async (status: "Disetujui" | "Perlu Perbaikan" | "Diajukan") => {
    if (!item) return

    // Validasi: Minta Perbaikan wajib ada catatan global (aturan backend: required)
    if (status === "Perlu Perbaikan" && !globalComment.trim()) {
      setError("Catatan global wajib diisi sebelum Minta Perbaikan — beri tahu PPK apa yang perlu diperbaiki.")
      return
    }

    const cleaned: Record<string, string> = {}
    Object.entries(fieldComments).forEach(([k, v]) => {
      if (v && v.trim()) cleaned[k] = v.trim()
    })
    const action = status === "Disetujui" ? "approve" : status === "Perlu Perbaikan" ? "return" : "note"
    setPendingAction(action)
    const ok = await review(item.id, {
      action,
      catatan_reviewer: globalComment.trim() || null,
      catatan_reviewer_detail: Object.keys(cleaned).length > 0 ? cleaned : null,
    })
    if (ok) {
      onSuccess()
      setTimeout(() => onClose(), 600)
    } else {
      setPendingAction(null)
    }
  }

  if (!item) return null

  const metodePengadaan = String(fd.metode_pengadaan || item.cara_pengadaan || "-")

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${
                canReview ? "bg-indigo-600 shadow-indigo-500/20" : "bg-blue-600 shadow-blue-500/20"
              }`}
            >
              {canReview ? <ShieldCheck className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                  {item.nama_paket}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(item.status_review)}`}>
                  {statusLabel(item.status_review)}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  ID #{item.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {item.cara_pengadaan} {item.jenis_pengadaan ? `(${item.jenis_pengadaan})` : ""} • {item.nama_skpd}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body: kiri = detail, kanan = keputusan (sticky) */}
        <div className="flex flex-1 overflow-hidden">
          {/* ===== Kolom Kiri: Detail Paket ===== */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
            {/* Banner Pagu */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" /> Total Rencana Pagu Paket
                </p>
                <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {fmtRupiah(item.total_pagu || 0)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  <Tag className="h-3.5 w-3.5 text-blue-600" />
                  {item.jenis_pengadaan || item.cara_pengadaan}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {metodePengadaan}
                </span>
              </div>
            </div>

            {/* SKPD & PPK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" /> Perangkat Daerah (SKPD)
                </p>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">{item.nama_skpd || "—"}</p>
                <p className="font-mono text-[10px] text-slate-400">Kode SKPD: {item.kode_skpd || "—"}</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-emerald-500" /> Pejabat Pembuat Komitmen (PPK)
                </p>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">
                  {item.pembuat?.nama || item.nama_user || "—"}
                </p>
                <p className="font-mono text-[10px] text-slate-400">Username: @{item.pembuat?.username || "—"}</p>
              </div>
            </div>

            {/* Hierarki SIPD */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Nomenklatur Perencanaan SIPD
              </p>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {[
                  { label: "Program", nama: item.nama_program, kode: item.kode_program, color: "text-blue-600 dark:text-blue-400" },
                  { label: "Kegiatan", nama: item.nama_kegiatan, kode: item.kode_kegiatan, color: "text-indigo-600 dark:text-indigo-400" },
                  { label: "Sub Kegiatan", nama: item.nama_sub_kegiatan, kode: item.kode_sub_kegiatan, color: "text-amber-700 dark:text-amber-400" },
                ].map((h, i) => (
                  <div key={h.label} className={i > 0 ? "pt-2 border-t border-slate-100 dark:border-slate-800" : ""}>
                    <p className={`text-[10px] uppercase font-semibold ${h.color}`}>{h.label}</p>
                    <p className="font-medium text-slate-900 dark:text-white mt-0.5">{h.nama || h.kode || "—"}</p>
                    {h.kode && <p className="font-mono text-[10px] text-slate-400 mt-0.5">Kode: {h.kode}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Form per Jenis — setiap field dengan ikon pensil */}
            {sections.map((sec) => {
              const fields = sec.fields.filter((f) => fieldValues[f.key])
              if (fields.length === 0) return null
              return (
                <div key={sec.title} className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> {sec.title}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {fields.map((f) => (
                      <FieldRow
                        key={`${item.id}-${f.key}`}
                        def={f}
                        value={fieldValues[f.key]}
                        note={fieldComments[f.key] || undefined}
                        readOnly={!canReview}
                        onNote={(v) => setFieldComment(f.key, v)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Lokasi */}
            {lokasiList.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Lokasi Pengadaan ({lokasiList.length})
                </p>
                <FieldRow
                  key={`${item.id}-lokasi`}
                  def={{ key: "lokasi", label: `Lokasi (${lokasiList.length} item)` }}
                  value={lokasiValue || "—"}
                  note={fieldComments["lokasi"] || undefined}
                  readOnly={!canReview}
                  onNote={(v) => setFieldComment("lokasi", v)}
                />
              </div>
            )}

            {/* Waktu */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Jadwal & Waktu Pelaksanaan
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Pemanfaatan</p>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                    {item.waktu_pemanfaatan_awal ? `${item.waktu_pemanfaatan_awal} s/d ${item.waktu_pemanfaatan_akhir || ""}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Pemilihan Penyedia</p>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                    {item.waktu_pemilihan_awal ? `${item.waktu_pemilihan_awal} s/d ${item.waktu_pemilihan_akhir || ""}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Pelaksanaan Pekerjaan</p>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 mt-0.5">
                    {item.waktu_pelaksanaan_pekerjaan_awal
                      ? `${item.waktu_pelaksanaan_pekerjaan_awal} s/d ${item.waktu_pelaksanaan_pekerjaan_akhir || ""}`
                      : item.waktu_pelaksanaan_kontrak_awal
                      ? `${item.waktu_pelaksanaan_kontrak_awal} s/d ${item.waktu_pelaksanaan_kontrak_akhir || ""}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Anggaran — tiap baris bisa diberi catatan */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" /> Rincian Rekening & Standar Harga ({item.anggaran?.length || 0} Item)
              </p>
              {!item.anggaran || item.anggaran.length === 0 ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 text-center">
                  Tidak ada rincian anggaran.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {item.anggaran.map((ang, idx) => {
                    const path = `anggaran.${idx}`
                    const nilai = `Rekening ${ang.sipd_penetapan?.kode_rekening || ang.kode_rekening || "-"} • Pagu ${fmtRupiah(ang.pagu)}`
                    return (
                      <FieldRow
                        key={`${item.id}-${path}`}
                        def={{
                          key: path,
                          label: `Rincian Anggaran #${idx + 1}: ${ang.standar_harga?.nama_standar_harga || ang.nama_standar_harga || "Standar Harga"}`,
                        }}
                        value={nilai}
                        note={fieldComments[path] || undefined}
                        readOnly={!canReview}
                        onNote={(v) => setFieldComment(path, v)}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Riwayat */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5" /> Riwayat Status (Audit Trail)
              </p>
              {riwayat === null && !riwayatError ? (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat riwayat...
                </div>
              ) : riwayatError ? (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 text-xs text-red-700 dark:text-red-300">
                  Gagal memuat riwayat status paket.
                </div>
              ) : riwayat && riwayat.length > 0 ? (
                <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-4 pl-5">
                  {riwayat.map((r) => (
                    <li key={r.id} className="relative">
                      <span className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950/40" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">
                          {r.status_dari ? `${statusLabel(r.status_dari)} → ` : ""}
                          {statusLabel(r.status_ke)}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">{fmtWaktu(r.created_at)}</p>
                      </div>
                      {r.catatan && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">"{r.catatan}"</p>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        oleh <span className="font-medium text-slate-600 dark:text-slate-300">{r.pembuat?.nama || `#${r.user_id}`}</span>
                        {r.pembuat?.role ? ` · ${r.pembuat.role}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-400">
                  Belum ada riwayat status untuk paket ini.
                </div>
              )}
            </div>
          </div>

          {/* ===== Kolom Kanan: Keputusan Review (sticky, hanya utk Verifikator/Admin) ===== */}
          {canReview && (
            <aside className="w-[340px] shrink-0 border-l border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-y-auto custom-scrollbar p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Keputusan Review
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Status saat ini:{" "}
                  <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(item.status_review)}`}>
                    {statusLabel(item.status_review)}
                  </span>
                </p>
              </div>

              {/* Catatan Global */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageCircle className="h-3 w-3" /> Catatan Global (untuk keseluruhan paket)
                </p>
                <textarea
                  value={globalComment}
                  onChange={(e) => setGlobalComment(e.target.value)}
                  rows={3}
                  placeholder="Berikan catatan umum untuk seluruh paket (opsional)."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Ringkasan catatan per-field */}
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Catatan per-Field: <b className="text-slate-900 dark:text-white">{countedNotes}</b>{" "}
                    <span className="text-slate-400">dari {allFieldDefs.length} field + anggaran/lokasi</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Klik ikon <Pencil className="h-2.5 w-2.5 inline" /> di samping field pada detail untuk menambah catatan.
                </p>
              </div>

              {/* Pesan error/sukses */}
              {error && (
                <div className="p-2.5 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {successMsg}
                </div>
              )}

              {/* Keputusan Review — satu set tombol aksi (klik = langsung jalankan) */}
              <div className="space-y-2">
                {[
                  { value: "Disetujui" as const, label: "Setujui (Final)", desc: "Usulan final & disetujui", icon: CheckCircle2, color: "emerald" },
                  { value: "Perlu Perbaikan" as const, label: "Minta Perbaikan", desc: "Kembalikan ke PPK untuk direvisi", icon: XCircle, color: "red" },
                  { value: "Diajukan" as const, label: "Simpan Catatan (Status Tetap)", desc: "Status tetap Menunggu Review", icon: MessageSquareWarning, color: "amber" },
                ].map((opt) => {
                  const Icon = opt.icon
                  const action = opt.value === "Disetujui" ? "approve" : opt.value === "Perlu Perbaikan" ? "return" : "note"
                  const isPending = pendingAction === action
                  const base =
                    opt.color === "emerald"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10 hover:bg-emerald-100/70 dark:hover:bg-emerald-500/20"
                      : opt.color === "red"
                      ? "border-red-500 bg-red-50/60 dark:bg-red-500/10 hover:bg-red-100/70 dark:hover:bg-red-500/20"
                      : "border-amber-500 bg-amber-50/60 dark:bg-amber-500/10 hover:bg-amber-100/70 dark:hover:bg-amber-500/20"
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => submitReview(opt.value)}
                      disabled={isLoading}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${base} ${isPending ? "shadow-md" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-slate-500 dark:text-slate-300" />
                        ) : (
                          <Icon
                            className={`h-4 w-4 ${
                              opt.color === "emerald" ? "text-emerald-600" : opt.color === "red" ? "text-red-600" : "text-amber-600"
                            }`}
                          />
                        )}
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{opt.label}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </aside>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <p className="text-[10px] text-slate-400 hidden sm:block">
            {canReview
              ? "Beri catatan (global / per-field) lalu pilih keputusan di panel kanan."
              : "Tampilan read-only — usulan diajukan oleh PPK."}
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
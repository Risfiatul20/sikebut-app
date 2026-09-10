"use client"

import { X, Send, FileText, AlertTriangle, Building2 } from "lucide-react"

interface PayloadPreviewModalProps {
  isOpen: boolean
  payload: unknown
  totalPagu: number
  isSaving: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PayloadPreviewModal({
  isOpen,
  payload,
  totalPagu,
  isSaving,
  onClose,
  onConfirm,
}: PayloadPreviewModalProps) {
  if (!isOpen) return null

  const fmt = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v ?? 0)

  // Ekstrak data ringkasan dari payload (mendukung format flat sesuai backend docs/api-identifikasi.md)
  const p = payload as {
    nama_paket?: string
    cara_pengadaan?: string
    jenis_pengadaan?: string
    kode_skpd?: string
    kode_program?: string
    kode_kegiatan?: string
    kode_sub_kegiatan?: string
    identitas?: {
      nama_skpd?: string
      kode_skpd?: string
      nama_program?: string
      nama_kegiatan?: string
      nama_sub_kegiatan?: string
      cara_pengadaan?: string
      jenis_pengadaan?: string
    }
    form_data?: {
      nama_paket?: string
      uraian?: string
      sumber_dana?: string
      volume?: number
      volume_satuan?: string
    }
    anggaran?: unknown[]
    status_review?: string
  }

  // Mode simpan: Draft (biasa) atau Diajukan (Ajukan Langsung → langsung kirim ke Verifikator)
  const isAjukanLangsung = p?.status_review === "Diajukan"

  const namaPaket = p?.nama_paket || p?.form_data?.nama_paket || "—"
  const namaSkpd = p?.identitas?.nama_skpd || p?.kode_skpd || "—"
  const program = p?.identitas?.nama_program || p?.kode_program || "—"
  const kegiatan = p?.identitas?.nama_kegiatan || p?.kode_kegiatan || "—"
  const subKegiatan = p?.identitas?.nama_sub_kegiatan || p?.kode_sub_kegiatan || "—"
  const caraPengadaan = p?.cara_pengadaan || p?.identitas?.cara_pengadaan || "—"
  const jenisPengadaan = p?.jenis_pengadaan || p?.identitas?.jenis_pengadaan || ""
  const jumlahAnggaran = p?.anggaran?.length || 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Konfirmasi Simpan Usulan Kebutuhan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Status usulan akan disimpan sebagai{" "}
                <b className="text-slate-700 dark:text-slate-300">{isAjukanLangsung ? "Diajukan (langsung ke Verifikator)" : "Draft"}</b>{" "}
                pada sistem PBJ SIPD-RI.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 space-y-5 custom-scrollbar text-xs">
          {/* Pesan Konfirmasi (Muncul di development maupun production) */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Apakah Anda yakin ingin menyimpan usulan identifikasi kebutuhan ini?
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                {isAjukanLangsung ? (
                  <>Data akan tersimpan dengan status <b>Diajukan</b> dan <b>langsung masuk ke antrean review Verifikator</b>. Pastikan semua data sudah final sebelum mengajukan.</>
                ) : (
                  <>Data akan tersimpan dengan status <b>Draft</b>. Anda masih dapat mengubah rincian spesifikasi dan pagu paket kapan saja sebelum diajukan ke tahap review/verifikasi.</>
                )}
              </p>
            </div>
          </div>

          {/* Rincian Ringkasan Paket */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Ringkasan Usulan Paket
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Nama Paket Pengadaan</p>
                <p className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">{namaPaket}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Perangkat Daerah (SKPD)</p>
                <p className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">{namaSkpd}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Program & Kegiatan</p>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                  {program} &bull; {kegiatan}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Sub Kegiatan</p>
                <p className="text-[11px] font-medium text-slate-900 dark:text-white mt-0.5">{subKegiatan}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Metode Pengadaan</p>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {caraPengadaan} {jenisPengadaan ? `(${jenisPengadaan})` : ""}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-medium">Total Rencana Pagu ({jumlahAnggaran} Item RKA)</p>
                <p className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {fmt(totalPagu)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Status Simpan: <span className="font-semibold text-slate-800 dark:text-slate-200">{isAjukanLangsung ? "Diajukan Langsung" : "Draft Usulan"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSaving}
              className="px-4 py-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              {isSaving ? "Menyimpan..." : isAjukanLangsung ? "Ya, Simpan & Ajukan Langsung" : "Ya, Simpan sebagai Draft"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { WizardLayout, WizardStep } from "@/components/identifikasi/wizard-layout"
import { StepIdentitas } from "@/components/identifikasi/step-identitas"
import { StepFormBarang } from "@/components/identifikasi/step-form-barang"
import { StepFormKonstruksi } from "@/components/identifikasi/step-form-konstruksi"
import { StepFormJasaLainnya } from "@/components/identifikasi/step-form-jasa-lainnya"
import { StepFormKonsultansi } from "@/components/identifikasi/step-form-konsultansi"
import { StepFormSwakelola } from "@/components/identifikasi/step-form-swakelola"
import { ModalPagu } from "@/components/identifikasi/modal-pagu"
import { StepReview } from "@/components/identifikasi/step-review"
import { CatatanVerifikatorPanel } from "@/components/identifikasi/catatan-verifikator-panel"
import { PayloadPreviewModal } from "@/components/identifikasi/payload-preview-modal"
import { getInitialFormData } from "@/lib/mock-identifikasi"
import { validasiIdentitas, validasiFormWajib, validasiSebelumSimpan, ValidasiError } from "@/lib/validasi-wizard"
import {
  FormIdentitas,
  FormBarang,
  FormKonstruksi,
  FormJasaLainnya,
  FormKonsultansi,
  FormSwakelola,
  PaguPaketItem,
  IdentifikasiKebutuhan,
} from "@/types/identifikasi"
import { FileText, CheckCircle2, AlertTriangle, List, Pencil, Loader2 } from "lucide-react"

function IdentifikasiPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editIdStr = searchParams.get("id")
  const isEditMode = Boolean(editIdStr)

  const [currentStep, setCurrentStep] = useState(0)
  const [identitas, setIdentitas] = useState<FormIdentitas>(() => ({
    kode_skpd: "",
    nama_skpd: "-",
    kode_program: "",
    nama_program: "",
    kode_kegiatan: "",
    nama_kegiatan: "",
    kode_sub_kegiatan: "",
    nama_sub_kegiatan: "",
    // Arahan atasan: Cara Pengadaan TIDAK langsung terisi — harus dipilih dulu,
    // sama seperti Jenis Pengadaan (tidak ada default "Penyedia").
    cara_pengadaan: "",
    jenis_pengadaan: "",
  }))
  const [formData, setFormData] = useState<unknown>({})
  const [anggaran, setAnggaran] = useState<PaguPaketItem[]>([])
  const [isPaguOpen, setIsPaguOpen] = useState(false)
  const [validasiErrors, setValidasiErrors] = useState<ValidasiError[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [catatanReviewer, setCatatanReviewer] = useState<string | null>(null)
  const [catatanReviewerDetail, setCatatanReviewerDetail] = useState<Record<string, string> | null>(null)
  const [statusReview, setStatusReview] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const userData = useMemo(
    () => ({
      nama: session?.user?.name || session?.user?.username || "Pengguna",
      nama_skpd: session?.user?.namaSkpd || "-",
      kode_skpd: session?.user?.kodeSkpd || "",
      role: session?.user?.role || "-",
    }),
    [session]
  )

  // Load detail usulan jika dalam mode Edit (?id=X)
  useEffect(() => {
    if (!editIdStr) return

    const editId = parseInt(editIdStr, 10)
    if (isNaN(editId)) return

    let cancel = false
    async function loadEditData() {
      setIsLoadingDetail(true)
      try {
        const res = await fetch(`/api/identifikasi?id=${editId}`)
        if (!res.ok) throw new Error(`Gagal memuat paket #${editId}`)

        const json = await res.json()
        const item: IdentifikasiKebutuhan = json.data || json

        if (!cancel && item) {
          setIdentitas({
            kode_skpd: item.kode_skpd || "",
            nama_skpd: item.nama_skpd || "-",
            kode_program: item.kode_program || "",
            nama_program: item.nama_program || "",
            kode_kegiatan: item.kode_kegiatan || "",
            nama_kegiatan: item.nama_kegiatan || "",
            kode_sub_kegiatan: item.kode_sub_kegiatan || "",
            nama_sub_kegiatan: item.nama_sub_kegiatan || "",
            cara_pengadaan: item.cara_pengadaan,
            jenis_pengadaan: item.jenis_pengadaan || "",
          })

          // Normalisasi: pastikan field RKBMD per-anggaran selalu tersedia (paket lama tidak punya)
          setFormData({
            rkbmd_items: [],
            rkbmd_mode: "",
            rkbmd_per_anggaran: [],
            ...(item.form_data || {}),
          })
          setCatatanReviewer(item.catatan_reviewer || null)
          setCatatanReviewerDetail((item.catatan_reviewer_detail as Record<string, string> | null) || null)
          setStatusReview(item.status_review || null)

          const mappedAnggaran: PaguPaketItem[] = (item.anggaran || []).map((ag, idx) => ({
            id: `pagu-${Date.now()}-${idx}-${ag.id_sipd_penetapan}`,
            id_sipd_penetapan: ag.id_sipd_penetapan,
            kode_standar_harga: ag.kode_standar_harga || ag.standar_harga?.kode_standar_harga || "",
            nama_standar_harga: ag.nama_standar_harga || ag.standar_harga?.nama_standar_harga || "",
            kode_rekening: ag.kode_rekening || ag.sipd_penetapan?.kode_rekening || "",
            nama_rekening: ag.nama_rekening || ag.sipd_penetapan?.kode_rekening || "",
            pagu_sipd: Number(ag.sipd_penetapan?.pagu_sipd || ag.pagu || 0),
            pagu_tertagih: 0,
            rencana_pagu_paket: Number(ag.pagu || 0),
            is_belanja_pengadaan: ag.sipd_penetapan?.is_belanja_pengadaan ?? undefined,
            is_rkbmd_pengadaan: ag.sipd_penetapan?.is_rkbmd_pengadaan ?? undefined,
            is_rkbmd_pemeliharaan_rehab: ag.sipd_penetapan?.is_rkbmd_pemeliharaan_rehab ?? undefined,
            is_rkbmd_pemeliharaan_rutin: ag.sipd_penetapan?.is_rkbmd_pemeliharaan_rutin ?? undefined,
          }))
          setAnggaran(mappedAnggaran)
        }
      } catch (err) {
        if (!cancel) {
          setToastMsg(err instanceof Error ? err.message : "Gagal memuat detail paket edit.")
        }
      } finally {
        if (!cancel) setIsLoadingDetail(false)
      }
    }

    loadEditData()
    return () => {
      cancel = true
    }
  }, [editIdStr])

  // Hitung data identitas efektif dengan sinkronisasi session instan ketika reload
  const effectiveIdentitas = useMemo<FormIdentitas>(
    () => ({
      ...identitas,
      kode_skpd: identitas.kode_skpd || session?.user?.kodeSkpd || "",
      nama_skpd:
        identitas.nama_skpd && identitas.nama_skpd !== "-"
          ? identitas.nama_skpd
          : session?.user?.namaSkpd || "-",
    }),
    [identitas, session?.user?.kodeSkpd, session?.user?.namaSkpd]
  )

  // Admin boleh mengganti SKPD; selain admin terkunci ke SKPD session
  const isAdmin = (session?.user?.role || "").toLowerCase() === "admin"

  const tipeForm =
    effectiveIdentitas.cara_pengadaan === "Swakelola"
      ? "Swakelola"
      : effectiveIdentitas.jenis_pengadaan

  const getFormSteps = (): WizardStep[] => {
    const steps: WizardStep[] = [
      { id: 0, label: "Identitas", description: "OPD, Program, Pengadaan" },
    ]
    if (tipeForm) {
      steps.push({ id: 1, label: `Form ${tipeForm}`, description: "Spesifikasi & Kebutuhan" })
      steps.push({ id: 2, label: "Review", description: "Pagu Paket & Konfirmasi" })
    }
    return steps
  }

  const formSteps = getFormSteps()

  const totalPagu = useMemo(
    () => anggaran.reduce((s, a) => s + (a.rencana_pagu_paket || 0), 0),
    [anggaran]
  )

  // Helper normalisasi tanggal: konversi "YYYY-MM", "MM/YYYY", "MM-YYYY" → "YYYY-MM-DD"
  // (browser tertentu mengirim format MM/YYYY; backend hanya menerima tanggal standar)
  const parseMonthYear = (str: string): { year: number; month: number } | null => {
    let m = str.match(/^(\d{4})[-/](\d{1,2})$/) // YYYY-MM / YYYY/MM
    if (m) return { year: Number(m[1]), month: Number(m[2]) }
    m = str.match(/^(\d{1,2})[-/](\d{4})$/) // MM/YYYY / MM-YYYY
    if (m) return { year: Number(m[2]), month: Number(m[1]) }
    return null
  }

  const normalizeStartDate = (val?: unknown): string | null => {
    if (!val || typeof val !== "string" || !val.trim()) return null
    const str = val.trim()
    if (/^\d{4}-\d{2}$/.test(str)) return `${str}-01` // YYYY-MM → awal bulan
    const p = parseMonthYear(str)
    if (p && p.month >= 1 && p.month <= 12) {
      return `${p.year}-${String(p.month).padStart(2, "0")}-01`
    }
    return str
  }

  const normalizeEndDate = (val?: unknown): string | null => {
    if (!val || typeof val !== "string" || !val.trim()) return null
    const str = val.trim()
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [year, month] = str.split("-").map(Number)
      return `${str}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`
    }
    const p = parseMonthYear(str)
    if (p && p.month >= 1 && p.month <= 12) {
      const lastDay = new Date(p.year, p.month, 0).getDate()
      return `${p.year}-${String(p.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    }
    return str
  }

  // Payload yang disesuaikan persis dengan Store/Update IdentifikasiKebutuhanRequest (docs/api-identifikasi.md)
  const payload = useMemo(() => {
    const isSwakelola = effectiveIdentitas.cara_pengadaan === "Swakelola"
    const fd = (formData || {}) as Record<string, unknown>

    let waktuAwalPekerjaan = normalizeStartDate(fd.waktu_pelaksanaan_pekerjaan_awal)
    let waktuAkhirPekerjaan = normalizeEndDate(fd.waktu_pelaksanaan_pekerjaan_akhir)

    if (isSwakelola) {
      waktuAwalPekerjaan = normalizeStartDate(fd.waktu_awal)
      waktuAkhirPekerjaan = normalizeEndDate(fd.waktu_akhir)
    }

    const anggaranPayload = anggaran.map((item) => ({
      id_sipd_penetapan: item.id_sipd_penetapan,
      kode_standar_harga: item.kode_standar_harga || null,
      pagu: item.rencana_pagu_paket,
      perubahan_standar: null,
    }))

    const namaPaket =
      typeof fd.nama_paket === "string" && fd.nama_paket.trim()
        ? fd.nama_paket.trim()
        : effectiveIdentitas.nama_sub_kegiatan || "Usulan Kebutuhan Pengadaan"

    return {
      ...(isEditMode && editIdStr ? { id: parseInt(editIdStr, 10) } : {}),
      nama_paket: namaPaket,
      cara_pengadaan: effectiveIdentitas.cara_pengadaan,
      jenis_pengadaan: isSwakelola ? null : effectiveIdentitas.jenis_pengadaan || null,
      kode_skpd: effectiveIdentitas.kode_skpd || userData.kode_skpd || null,
      kode_klpd: null,
      kode_program: effectiveIdentitas.kode_program || null,
      kode_kegiatan: effectiveIdentitas.kode_kegiatan || null,
      kode_sub_kegiatan: effectiveIdentitas.kode_sub_kegiatan || null,
      status_review: "Draft",
      waktu_pemanfaatan_awal: normalizeStartDate(fd.waktu_pemanfaatan_awal),
      waktu_pemanfaatan_akhir: normalizeEndDate(fd.waktu_pemanfaatan_akhir),
      waktu_pemilihan_awal: normalizeStartDate(fd.waktu_pemilihan_awal),
      waktu_pemilihan_akhir: normalizeEndDate(fd.waktu_pemilihan_akhir),
      waktu_pelaksanaan_kontrak_awal: normalizeStartDate(fd.waktu_pelaksanaan_kontrak_awal),
      waktu_pelaksanaan_kontrak_akhir: normalizeEndDate(fd.waktu_pelaksanaan_kontrak_akhir),
      waktu_pelaksanaan_pekerjaan_awal: waktuAwalPekerjaan,
      waktu_pelaksanaan_pekerjaan_akhir: waktuAkhirPekerjaan,
      form_data: fd,
      catatan_reviewer: catatanReviewer,
      catatan_reviewer_detail: catatanReviewerDetail,
      anggaran: anggaranPayload,
    }
  }, [effectiveIdentitas, formData, anggaran, userData, isEditMode, editIdStr, catatanReviewer, catatanReviewerDetail])

  const handleIdentitasChange = (data: FormIdentitas) => {
    setValidasiErrors([])
    setIdentitas(data)

    const nextTipe = data.cara_pengadaan === "Swakelola" ? "Swakelola" : data.jenis_pengadaan || ""
    const prevTipe =
      identitas.cara_pengadaan === "Swakelola" ? "Swakelola" : identitas.jenis_pengadaan || ""

    // Reset form HANYA saat struktur form benar-benar berganti jenis pengadaan.
    // - Ganti Program/Kegiatan/Sub Kegiatan → isian form TIDAK direset (dipertahankan).
    // - Klik ulang kartu Cara/Jenis yang sama, atau transisi lewat nilai kosong
    //   (mis. klik "Penyedia" lagi yang sementara mengosongkan jenis) → TIDAK direset.
    // - Pemilihan jenis PERTAMA KALI (prevTipe kosong) WAJIB menginisialisasi formData
    //   (kalau tidak, step form render dengan data kosong → crash `data.lokasi.map`).
    if (nextTipe && nextTipe !== prevTipe) {
      const fresh = getInitialFormData(nextTipe) as Record<string, unknown>
      const prev = (formData || {}) as Record<string, unknown>
      // Pertahankan isian yang portabel antar jenis (nama paket, volume, lokasi, waktu, dll.)
      const carried: Record<string, unknown> = {}
      for (const key of Object.keys(fresh)) {
        const v = prev[key]
        if (v === undefined || v === null) continue
        if (typeof v === "string" && v.trim() === "") continue
        if (typeof v === "number" && v === 0) continue
        if (Array.isArray(v) && v.length === 0) continue
        carried[key] = v
      }
      setFormData({ ...fresh, ...carried })
    }
  }

  // Pengaman: pastikan formData selalu punya seluruh field dasar + array wajib
  // (lokasi, rkbmd_items, dst.) saat masuk step form — apa pun jalurnya
  // (usulan baru, edit paket lama yang field-nya tidak lengkap, dsb.).
  useEffect(() => {
    if (currentStep < 1 || !tipeForm) return
    const fd = (formData || {}) as Record<string, unknown>
    const fresh = getInitialFormData(tipeForm) as Record<string, unknown>
    const missing = Object.keys(fresh).filter((k) => !(k in fd))
    if (missing.length > 0) {
      const patched: Record<string, unknown> = { ...fresh }
      for (const k of Object.keys(fd)) patched[k] = fd[k]
      setFormData(patched)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, tipeForm])

  const handleNext = () => {
    if (currentStep === 0 && !tipeForm) return
    // Validasi sebelum pindah langkah (arahan: opsi kosong wajib diisi)
    const errs =
      currentStep === 0
        ? validasiIdentitas(effectiveIdentitas)
        : validasiFormWajib(tipeForm, (formData || {}) as Record<string, unknown>)
    if (errs.length > 0) {
      setValidasiErrors(errs)
      return
    }
    setValidasiErrors([])
    setCurrentStep((s) => Math.min(s + 1, formSteps.length - 1))
  }

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0))

  // Mode simpan: "draft" = simpan sebagai Draft, "ajukan" = simpan + langsung diajukan ke Verifikator
  const [saveMode, setSaveMode] = useState<"draft" | "ajukan">("draft")

  const handleSaveClick = (mode: "draft" | "ajukan" = "draft") => {
    if (isLoadingDetail || isSaving) return
    // Validasi menyeluruh sebelum simpan/submit
    const errs = validasiSebelumSimpan({
      identitas: effectiveIdentitas,
      jenis: tipeForm,
      formData: (formData || {}) as Record<string, unknown>,
      totalAnggaran: totalPagu,
    })
    if (errs.length > 0) {
      setValidasiErrors(errs)
      // Auto-lompat ke langkah pertama yang bermasalah (supaya user langsung melihat field yang wajib diisi)
      const stepTerendah = Math.min(...errs.map((e) => e.step))
      if (stepTerendah < currentStep) setCurrentStep(stepTerendah)
      return
    }
    setValidasiErrors([])
    setSaveMode(mode)
    setPreviewOpen(true)
  }

  const handleConfirmSave = () => {
    setPreviewOpen(false)
    handleSubmit()
  }

  const handleAjukanReviewFromEdit = async () => {
    if (!editIdStr) return
    const editId = parseInt(editIdStr, 10)
    if (isNaN(editId)) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/identifikasi/${editId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit" }),
      })
      const result = await res.json()
      if (res.ok) {
        setToastMsg(`Paket #${editId} berhasil diajukan ulang ke Verifikator`)
        setTimeout(() => {
          router.push("/dashboard/identifikasi/data")
        }, 1500)
      } else {
        setToastMsg(`Gagal: ${result.error || result.message || "Gagal mengajukan paket"}`)
      }
    } catch {
      setToastMsg("Gagal: Terjadi gangguan jaringan.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const isUpdating = isEditMode && editIdStr
      const endpoint = isUpdating ? `/api/identifikasi?id=${editIdStr}` : "/api/identifikasi"
      const method = isUpdating ? "PUT" : "POST"

      const isAjukanLangsung = saveMode === "ajukan"
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, status_review: isAjukanLangsung ? "Diajukan" : "Draft" }),
      })
      const result = await res.json()
      if (res.ok && (result.success || result.data)) {
        const statusMsg = isAjukanLangsung
          ? "berhasil disimpan dan LANGSUNG DIAJUKAN ke Verifikator"
          : "berhasil disimpan sebagai Draft ke database"
        setToastMsg(
          result.message ||
            (isUpdating
              ? `Usulan paket (#${editIdStr}) ${statusMsg}`
              : `Identifikasi kebutuhan ${statusMsg}`)
        )

        setTimeout(() => {
          setToastMsg(null)
          // Arahan atasan: setelah simpan (Draft ATAU Ajukan Langsung) dari halaman
          // Review, otomatis langsung pindah ke daftar usulan.
          router.push("/dashboard/identifikasi/data")
        }, 1500)
      } else {
        const errorDetail =
          result.message ||
          result.error ||
          (result.errors
            ? Object.values(result.errors).flat().join(", ")
            : "Gagal menyimpan usulan kebutuhan.")
        setToastMsg(`Gagal: ${errorDetail}`)
        setTimeout(() => setToastMsg(null), 6000)
      }
    } catch {
      setToastMsg("Gagal: Terjadi gangguan jaringan saat menghubungi server.")
      setTimeout(() => setToastMsg(null), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  // Nama langkah untuk banner validasi (0 = Identitas, 1 = Form, 2 = Review)
  const STEP_LABELS: Record<number, string> = { 0: "Identitas", 1: "Form", 2: "Review" }

  // Kumpulkan key field yang kosong per langkah — untuk highlight per-field di tiap step
  const missingKeysIdentitas = validasiErrors.filter((e) => e.step === 0).map((e) => e.key || "").filter(Boolean)
  const missingKeysForm = validasiErrors.filter((e) => e.step === 1).map((e) => e.key || "").filter(Boolean)
  const missingPagu = validasiErrors.some((e) => e.step === 2)

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepIdentitas
            data={effectiveIdentitas}
            onChange={handleIdentitasChange}
            userData={userData}
            isAdmin={isAdmin}
            missing={missingKeysIdentitas}
          />
        )
      case 1:
        if (tipeForm === "Barang")
          return (
            <StepFormBarang
              data={formData as unknown as FormBarang}
              onChange={(d) => { setFormData(d); setValidasiErrors([]) }}
              catatanReviewerDetail={catatanReviewerDetail}
              kodeSubKegiatan={effectiveIdentitas.kode_sub_kegiatan}
              kodeSkpd={effectiveIdentitas.kode_skpd}
              identifikasiId={isEditMode && editIdStr ? parseInt(editIdStr, 10) : undefined}
              onOpenPagu={() => setIsPaguOpen(true)}
              totalPagu={totalPagu}
              anggaran={anggaran}
              missing={missingKeysForm}
            />
          )
        if (tipeForm === "Konstruksi")
          return (
            <StepFormKonstruksi
              data={formData as unknown as FormKonstruksi}
              onChange={(d) => { setFormData(d); setValidasiErrors([]) }}
              catatanReviewerDetail={catatanReviewerDetail}
              kodeSubKegiatan={effectiveIdentitas.kode_sub_kegiatan}
              kodeSkpd={effectiveIdentitas.kode_skpd}
              identifikasiId={isEditMode && editIdStr ? parseInt(editIdStr, 10) : undefined}
              onOpenPagu={() => setIsPaguOpen(true)}
              totalPagu={totalPagu}
              anggaran={anggaran}
              missing={missingKeysForm}
            />
          )
        if (tipeForm === "Jasa Lainnya")
          return (
            <StepFormJasaLainnya
              data={formData as unknown as FormJasaLainnya}
              onChange={(d) => { setFormData(d); setValidasiErrors([]) }}
              catatanReviewerDetail={catatanReviewerDetail}
              onOpenPagu={() => setIsPaguOpen(true)}
              totalPagu={totalPagu}
              missing={missingKeysForm}
            />
          )
        if (tipeForm === "Konsultansi")
          return (
            <StepFormKonsultansi
              data={formData as unknown as FormKonsultansi}
              onChange={(d) => { setFormData(d); setValidasiErrors([]) }}
              catatanReviewerDetail={catatanReviewerDetail}
              onOpenPagu={() => setIsPaguOpen(true)}
              totalPagu={totalPagu}
              missing={missingKeysForm}
            />
          )
        if (tipeForm === "Swakelola")
          return (
            <StepFormSwakelola
              data={formData as unknown as FormSwakelola}
              onChange={(d) => { setFormData(d); setValidasiErrors([]) }}
              catatanReviewerDetail={catatanReviewerDetail}
              onOpenPagu={() => setIsPaguOpen(true)}
              totalPagu={totalPagu}
              missing={missingKeysForm}
            />
          )
        return null
      case 2:
        return (
          <StepReview
            identitas={effectiveIdentitas}
            anggaran={anggaran}
            formData={formData}
            onOpenPagu={() => setIsPaguOpen(true)}
            missingPagu={missingPagu}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Loading detail indicator saat mode edit */}
      {isLoadingDetail && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 flex items-center gap-3 text-xs text-blue-700 dark:text-blue-300">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>Memuat data paket #{editIdStr} untuk diedit...</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {isEditMode ? <Pencil className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {isEditMode ? `Edit Identifikasi Kebutuhan (#${editIdStr})` : "Identifikasi Kebutuhan Pengadaan"}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isEditMode
              ? "Perbarui rincian usulan paket pengadaan yang belum difinalisasi."
              : "Formulir dinamis identifikasi kebutuhan PBJ terintegrasi SIPD-RI."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/identifikasi/data"
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
          >
            <List className="h-3.5 w-3.5" />
            <span>Lihat Daftar Usulan</span>
          </Link>
        </div>
      </div>

      {/* Banner validasi — opsi kosong wajib diisi saat pindah langkah / simpan / submit */}
      {validasiErrors.length > 0 && (
        <div className="rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 p-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Data belum lengkap — lengkapi field berikut sebelum melanjutkan:
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-rose-700 dark:text-rose-300">
            {validasiErrors.map((e, i) => (
              <li key={`${e.step}-${e.key || ""}-${i}`}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(e.step)}
                  className="inline-flex items-start gap-1.5 text-left hover:underline group"
                  title={`Klik untuk ke Langkah ${STEP_LABELS[e.step] || e.step + 1}`}
                >
                  <span className="mt-0.5 shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-200/70 dark:bg-rose-500/20 text-[9px] font-bold text-rose-800 dark:text-rose-300">
                    Langkah {STEP_LABELS[e.step] || e.step + 1}
                  </span>
                  <span className="group-hover:underline">{e.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Catatan Verifikator jika ada / saat mode edit */}
      {isEditMode && (catatanReviewer || catatanReviewerDetail || statusReview === "Perlu Perbaikan") && (
        <CatatanVerifikatorPanel
          catatanReviewer={catatanReviewer}
          catatanReviewerDetail={catatanReviewerDetail}
          statusReview={statusReview || undefined}
          paketId={editIdStr || undefined}
          onAjukanReview={handleAjukanReviewFromEdit}
          isSubmitting={isSaving}
        />
      )}

      <WizardLayout
        steps={formSteps}
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={() => handleSaveClick("draft")}
        onSubmitDirect={() => handleSaveClick("ajukan")}
        isLastStep={currentStep === formSteps.length - 1}
        totalPagu={totalPagu}
        isDisabled={isLoadingDetail || isSaving}
      >
        {renderCurrentStep()}
      </WizardLayout>

      <ModalPagu
        isOpen={isPaguOpen}
        onClose={() => setIsPaguOpen(false)}
        onSelect={setAnggaran}
        currentSelections={anggaran}
        kodeSubKegiatan={effectiveIdentitas.kode_sub_kegiatan}
        kodeSkpd={effectiveIdentitas.kode_skpd}
      />

      <PayloadPreviewModal
        isOpen={previewOpen}
        payload={{ ...payload, status_review: saveMode === "ajukan" ? "Diajukan" : "Draft" }}
        totalPagu={totalPagu} isSaving={isSaving}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  )
}

export default function IdentifikasiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-xs text-slate-400 gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span>Memuat halaman identifikasi kebutuhan...</span>
        </div>
      }
    >
      <IdentifikasiPageContent />
    </Suspense>
  )
}
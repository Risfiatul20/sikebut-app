"use client"

import { useState, useMemo } from "react"
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
import { PayloadPreviewModal } from "@/components/identifikasi/payload-preview-modal"
import { getInitialFormData } from "@/lib/mock-identifikasi"
import { FormIdentitas, FormBarang, FormKonstruksi, FormJasaLainnya, FormKonsultansi, FormSwakelola, PaguPaketItem } from "@/types/identifikasi"
import { FileText, CheckCircle2, AlertTriangle } from "lucide-react"

export default function IdentifikasiPage() {
  const { data: session } = useSession()
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
    cara_pengadaan: "Penyedia",
    jenis_pengadaan: "",
  }))
  const [formData, setFormData] = useState<unknown>({})
  const [anggaran, setAnggaran] = useState<PaguPaketItem[]>([])
  const [isPaguOpen, setIsPaguOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const userData = useMemo(() => ({
    nama: session?.user?.name || session?.user?.username || "Pengguna",
    nama_skpd: session?.user?.namaSkpd || "-",
    kode_skpd: session?.user?.kodeSkpd || "",
    role: session?.user?.role || "-",
  }), [session])

  // Hitung data identitas efektif dengan sinkronisasi session instan ketika reload
  const effectiveIdentitas = useMemo<FormIdentitas>(() => ({
    ...identitas,
    kode_skpd: identitas.kode_skpd || session?.user?.kodeSkpd || "",
    nama_skpd: identitas.nama_skpd && identitas.nama_skpd !== "-" ? identitas.nama_skpd : (session?.user?.namaSkpd || "-"),
  }), [identitas, session?.user?.kodeSkpd, session?.user?.namaSkpd])

  // Admin boleh mengganti SKPD; selain admin terkunci ke SKPD session
  const isAdmin = (session?.user?.role || "").toLowerCase() === "admin"

  const tipeForm = effectiveIdentitas.cara_pengadaan === "Swakelola" ? "Swakelola" : effectiveIdentitas.jenis_pengadaan

  const getFormSteps = (): WizardStep[] => {
    const steps: WizardStep[] = [
      { id: 0, label: "Identitas", description: "OPD, Program, Pengadaan" },
    ]
    if (tipeForm) {
      steps.push({ id: 1, label: `Form ${tipeForm}`, description: "Spesifikasi & Kebutuhan" })
      steps.push({ id: 2, label: "Pagu Paket", description: "Pilih RKA SIPD" })
      steps.push({ id: 3, label: "Review", description: "Konfirmasi & Simpan" })
    }
    return steps
  }

  const formSteps = getFormSteps()

  const totalPagu = useMemo(() => anggaran.reduce((s, a) => s + (a.rencana_pagu_paket || 0), 0), [anggaran])

  // Helper normalisasi tanggal: konversi "YYYY-MM" ke "YYYY-MM-DD" dan string kosong ke null
  const normalizeStartDate = (val?: unknown): string | null => {
    if (!val || typeof val !== "string" || !val.trim()) return null
    const str = val.trim()
    if (str.length === 7) return `${str}-01` // "2026-01" -> "2026-01-01"
    return str
  }

  const normalizeEndDate = (val?: unknown): string | null => {
    if (!val || typeof val !== "string" || !val.trim()) return null
    const str = val.trim()
    if (str.length === 7) {
      const [year, month] = str.split("-").map(Number)
      if (year && month) {
        const lastDay = new Date(year, month, 0).getDate()
        return `${str}-${String(lastDay).padStart(2, "0")}`
      }
    }
    return str
  }

  // Payload yang disesuaikan persis dengan StoreIdentifikasiKebutuhanRequest (docs/api-identifikasi.md)
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

    const namaPaket = (typeof fd.nama_paket === "string" && fd.nama_paket.trim())
      ? fd.nama_paket.trim()
      : effectiveIdentitas.nama_sub_kegiatan || "Usulan Kebutuhan Pengadaan"

    return {
      nama_paket: namaPaket,
      cara_pengadaan: effectiveIdentitas.cara_pengadaan,
      jenis_pengadaan: isSwakelola ? null : (effectiveIdentitas.jenis_pengadaan || null),
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
      catatan_reviewer: null,
      catatan_reviewer_detail: null,
      anggaran: anggaranPayload,
    }
  }, [effectiveIdentitas, formData, anggaran, userData])

  const handleIdentitasChange = (data: FormIdentitas) => {
    setIdentitas(data)
    if (data.cara_pengadaan !== identitas.cara_pengadaan || data.jenis_pengadaan !== identitas.jenis_pengadaan) {
      setFormData(getInitialFormData(data.cara_pengadaan === "Swakelola" ? "Swakelola" : data.jenis_pengadaan || ""))
    }
  }

  const handleNext = () => {
    if (currentStep === 0 && !tipeForm) return
    setCurrentStep((s) => Math.min(s + 1, formSteps.length - 1))
  }

  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 0))

  // Tampilkan preview payload sebelum benar-benar disimpan
  const handleSaveClick = () => {
    setPreviewOpen(true)
  }

  const handleConfirmSave = () => {
    setPreviewOpen(false)
    handleSubmit()
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/identifikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (res.ok && (result.success || result.data)) {
        setToastMsg(result.message || "Identifikasi kebutuhan berhasil disimpan sebagai Draft ke database")
        setTimeout(() => setToastMsg(null), 4000)
        setCurrentStep(0)
        setFormData({})
        setAnggaran([])
      } else {
        const errorDetail =
          result.message ||
          result.error ||
          (result.errors ? Object.values(result.errors).flat().join(", ") : "Gagal menyimpan usulan kebutuhan.")
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepIdentitas
            data={effectiveIdentitas}
            onChange={handleIdentitasChange}
            userData={userData}
            isAdmin={isAdmin}
          />
        )
      case 1:
        if (tipeForm === "Barang") return <StepFormBarang data={formData as unknown as FormBarang} onChange={(d) => setFormData(d)} onOpenPagu={() => setIsPaguOpen(true)} totalPagu={totalPagu} />
        if (tipeForm === "Konstruksi") return <StepFormKonstruksi data={formData as unknown as FormKonstruksi} onChange={(d) => setFormData(d)} onOpenPagu={() => setIsPaguOpen(true)} totalPagu={totalPagu} />
        if (tipeForm === "Jasa Lainnya") return <StepFormJasaLainnya data={formData as unknown as FormJasaLainnya} onChange={(d) => setFormData(d)} onOpenPagu={() => setIsPaguOpen(true)} totalPagu={totalPagu} />
        if (tipeForm === "Konsultansi") return <StepFormKonsultansi data={formData as unknown as FormKonsultansi} onChange={(d) => setFormData(d)} onOpenPagu={() => setIsPaguOpen(true)} totalPagu={totalPagu} />
        if (tipeForm === "Swakelola") return <StepFormSwakelola data={formData as unknown as FormSwakelola} onChange={(d) => setFormData(d)} onOpenPagu={() => setIsPaguOpen(true)} totalPagu={totalPagu} />
        return null
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Pagu Paket (RKA SIPD)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pilih standar harga dan input rencana pagu paket dari data SIPD.</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sub Kegiatan Aktif</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{effectiveIdentitas.nama_sub_kegiatan || "Belum dipilih"}</p>
              </div>
              <button onClick={() => setIsPaguOpen(true)} className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors">
                {anggaran.length > 0 ? `Ubah Pemilihan (${anggaran.length} item)` : "Pilih Standar Harga & Input Pagu"}
              </button>
            </div>
            {anggaran.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <tr className="text-[10px] uppercase text-slate-400">
                      <th className="font-semibold px-4 py-2 text-left">Standar Harga</th>
                      <th className="font-semibold px-4 py-2 text-left">Rekening</th>
                      <th className="font-semibold px-4 py-2 text-right">Pagu Paket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {anggaran.map((a, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2"><p className="text-[11px]">{a.nama_standar_harga}</p></td>
                        <td className="px-4 py-2"><p className="font-mono text-[10px] text-emerald-600">{a.nama_rekening}</p></td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-xs">
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(a.rencana_pagu_paket)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                      <td colSpan={2} className="px-4 py-2 text-[11px] font-semibold">Total</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-sm text-blue-700 dark:text-blue-300">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalPagu)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            {anggaran.length === 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Belum Ada Pemilihan Pagu</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">Klik tombol di atas untuk memilih standar harga dari RKA SIPD.</p>
                </div>
              </div>
            )}
          </div>
        )
      case 3:
        return <StepReview identitas={effectiveIdentitas} anggaran={anggaran} formData={formData} />
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" />
            </span>
            <h1 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Identifikasi Kebutuhan Pengadaan</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Formulir dinamis identifikasi kebutuhan PBJ terintegrasi SIPD-RI.</p>
        </div>
      </div>

      <WizardLayout steps={formSteps} currentStep={currentStep} onPrev={handlePrev} onNext={handleNext} onSubmit={handleSaveClick} isLastStep={currentStep === formSteps.length - 1} totalPagu={totalPagu}>
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
        payload={payload}
        totalPagu={totalPagu}
        isSaving={isSaving}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  )
}

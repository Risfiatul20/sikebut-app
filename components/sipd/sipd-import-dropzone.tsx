"use client"

import { useState, useRef } from "react"
import { SipdVersionInfo } from "@/types/sipd"
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, Loader2, ArrowRight, AlertCircle, XCircle } from "lucide-react"

interface SipdImportDropzoneProps {
  onImportSuccess: (version: SipdVersionInfo, count: number) => void
  existingVersions: SipdVersionInfo[]
}

type ImportPhase = "idle" | "uploading" | "processing" | "done" | "error"

export function SipdImportDropzone({ onImportSuccess, existingVersions }: SipdImportDropzoneProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [versionName, setVersionName] = useState<string>("Penetapan Perubahan APBD 2026")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<ImportPhase>("idle")
  const [statusMessage, setStatusMessage] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const isProcessing = phase === "uploading" || phase === "processing"

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0])
      setPhase("idle")
      setStatusMessage("")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setPhase("idle")
      setStatusMessage("")
    }
  }

  // Generate downloadable CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      "kode_daerah",
      "nama_daerah",
      "tahun",
      "kode_skpd",
      "nama_skpd",
      "kode_urusan",
      "nama_urusan",
      "kode_bidang_urusan",
      "nama_bidang_urusan",
      "kode_program",
      "nama_program",
      "kode_kegiatan",
      "nama_kegiatan",
      "kode_sub_kegiatan",
      "nama_sub_kegiatan",
      "kode_sumber_dana",
      "nama_sumber_dana",
      "kode_rekening",
      "nama_rekening",
      "kode_standar_harga",
      "nama_standar_harga",
      "pagu",
    ]

    const exampleRow = [
      "13",
      "Provinsi Sumatera Barat",
      "2026",
      "4.01.0.00.0.00.01.0006",
      "BIRO PENGADAAN BARANG DAN JASA",
      "4",
      "Urusan Pemerintahan Umum",
      "4.01",
      "Kesekretariatan Daerah",
      "4.01.07",
      "PROGRAM KEBIJAKAN DAN PELAYANAN PENGADAAN BARANG DAN JASA",
      "4.01.07.1.02",
      "Pengelolaan Layanan Pengadaan Secara Elektronik",
      "4.01.07.1.02.0002",
      "Pengembangan Sistem Informasi Pengadaan Barang dan Jasa",
      "1.1",
      "PENDAPATAN ASLI DAERAH (PAD)",
      "5.1.02.01.001.00052",
      "Belanja Makanan dan Minuman Kegiatan",
      "8.1.02.01.01.0052.00013",
      "Makan/Minum kegiatan",
      "855000",
    ]

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), exampleRow.join(",")].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `template_import_sipd_penetapan_apbd.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Impor NYATA: unggah berkas ke backend → polling status → selesai/gagal
  const runImportProcess = async () => {
    if (!selectedFile) return

    setIsDragging(false)
    setPhase("uploading")
    setStatusMessage("Mengunggah berkas ke server...")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("tahun", String(selectedYear))
      formData.append("nama_versi", versionName.trim() || `Penetapan APBD ${selectedYear}`)

      const res = await fetch("/api/sipd/import", { method: "POST", body: formData })
      const json = await res.json()

      if (!res.ok) {
        setPhase("error")
        setStatusMessage(json.error || json.message || `Gagal mengunggah berkas (status ${res.status})`)
        return
      }

      const importId = json.import_id
      setPhase("processing")
      setStatusMessage("Berkas diterima, memproses & menyimpan rincian ke database...")

      // Polling status impor (backend queue) sampai selesai/gagal
      const maxAttempts = 60 // 60 x 2.5s ≈ 2.5 menit
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 2500))
        const statusRes = await fetch(`/api/sipd/import-status/${importId}`, { cache: "no-store" })
        if (!statusRes.ok) {
          setPhase("error")
          setStatusMessage("Gagal memeriksa status impor di server.")
          return
        }
        const statusJson = await statusRes.json()

        if (statusJson.status === "completed") {
          // Versi baru yang berhasil diimpor (dihitung backend = versi tertinggi tahun tsb)
          const nextVersi = existingVersions.filter((v) => v.tahun === selectedYear).length + 1
          const count = 0 // jumlah baris dihitung dari reload tabel (backend)
          const version: SipdVersionInfo = {
            versi: nextVersi,
            nama_versi: versionName.trim() || `Versi ${nextVersi} - Penetapan APBD ${selectedYear}`,
            tahun: selectedYear,
            total_pagu: 0,
            total_rincian: 0,
            tanggal_impor: new Date().toISOString(),
            status: "Aktif",
          }
          setPhase("done")
          setStatusMessage("Impor selesai. Data tersimpan di database.")
          onImportSuccess(version, count)
          setSelectedFile(null)
          setTimeout(() => setPhase("idle"), 1500)
          return
        }

        if (statusJson.status === "failed") {
          setPhase("error")
          setStatusMessage(statusJson.error_message || "Impor gagal diproses di server.")
          return
        }
      }

      setPhase("error")
      setStatusMessage("Waktu pemrosesan habis. Silakan periksa status impor di server.")
    } catch {
      setPhase("error")
      setStatusMessage("Terjadi kesalahan jaringan saat mengunggah berkas.")
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-5">
      {/* Top Config Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tahun Anggaran <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          >
            <option value={2026}>Tahun 2026 (Tahun Berjalan)</option>
            <option value={2025}>Tahun 2025 (Historis)</option>
            <option value={2027}>Tahun 2027 (Rencana)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Label / Keterangan Versi APBD <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Penetapan APBD Murni 2026 / Pergeseran RKA Tahap 1"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-4 ring-blue-500/10"
            : selectedFile
            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10"
            : "border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls,.csv"
          className="hidden"
        />

        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
          selectedFile ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        }`}>
          {selectedFile ? <FileSpreadsheet className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
        </div>

        <div>
          {selectedFile ? (
            <div>
              <p className="font-semibold text-xs text-slate-900 dark:text-white">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB • Siap untuk diproses
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Pilih atau seret berkas ekspor SIPD-RI ke sini
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Mendukung format Microsoft Excel (<code className="font-mono">.xlsx</code>, <code className="font-mono">.xls</code>) atau <code className="font-mono">.csv</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processing / Result Status */}
      {isProcessing && (
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 flex items-center gap-2.5 animate-in fade-in duration-200">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
              {phase === "uploading" ? "Mengunggah berkas..." : "Memproses & menyimpan ke database..."}
            </p>
            <p className="text-[10px] text-blue-700/70 dark:text-blue-300/70 mt-0.5">{statusMessage}</p>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{statusMessage}</p>
        </div>
      )}

      {phase === "error" && (
        <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 flex items-center gap-2.5 animate-in fade-in duration-200">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-xs font-semibold text-red-800 dark:text-red-300 break-words">{statusMessage}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Download Template Format CSV"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Format Template CSV</span>
        </button>

        <div className="flex items-center gap-2">
          {selectedFile && !isProcessing && (
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Batalkan
            </button>
          )}

          <button
            type="button"
            onClick={runImportProcess}
            disabled={isProcessing || !selectedFile}
            className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{phase === "uploading" ? "Mengunggah..." : "Memproses..."}</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Mulai Impor Versi Ini</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
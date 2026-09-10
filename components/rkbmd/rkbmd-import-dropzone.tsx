"use client"

import { useState, useRef } from "react"
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, Loader2, ArrowRight, AlertCircle } from "lucide-react"
import { RkbmdType, RkbmdImportResponse, RkbmdImportStatus } from "@/types/rkbmd"

interface RkbmdImportDropzoneProps {
  type: RkbmdType
  title: string
  onImportSuccess: () => void
}

export function RkbmdImportDropzone({ type, title, onImportSuccess }: RkbmdImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importStatus, setImportStatus] = useState<RkbmdImportStatus | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null)
    const maxSize = 20 * 1024 * 1024 // 20MB per docs/import-rkbmd.md
    if (file.size > maxSize) {
      setErrorMsg("Ukuran file melebihi batas maksimum 20MB")
      return
    }
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      setErrorMsg("Format file harus .xlsx, .xls, atau .csv")
      return
    }
    setSelectedFile(file)
  }

  const pollStatus = async (importId: string) => {
    try {
      const res = await fetch(`/api/rkbmd/import-status/${importId}`)
      if (res.ok) {
        const json: RkbmdImportStatus = await res.json()
        setImportStatus(json)
        if (json.status === "processing") {
          setTimeout(() => pollStatus(importId), 1500)
        } else if (json.status === "completed") {
          setIsUploading(false)
          onImportSuccess()
        } else if (json.status === "failed") {
          setIsUploading(false)
          setErrorMsg(json.error_message || "Gagal memproses impor berkas RKBMD")
        }
      }
    } catch {
      setIsUploading(false)
      onImportSuccess()
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    setErrorMsg(null)
    setImportStatus(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const endpoint = type === "pengadaan" ? "/api/rkbmd/pengadaan" : "/api/rkbmd/pemeliharaan"
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const json: RkbmdImportResponse = await res.json()

      if (res.ok && json.success) {
        setImportStatus({
          success: true,
          status: "processing",
          file_name: selectedFile.name,
          updated_at: new Date().toISOString(),
        })
        pollStatus(json.import_id)
      } else {
        setIsUploading(false)
        setErrorMsg(json.message || "Gagal mengunggah berkas")
      }
    } catch {
      setIsUploading(false)
      setErrorMsg("Terjadi gangguan jaringan saat mengunggah berkas")
    }
  }

  // Format CSV Template Download — header HARUS sama persis dengan kolom yang
  // dibaca import class backend (WithHeadingRow), supaya data benar-benar masuk.
  // Kolom id_* bersifat opsional: kosongkan → sistem generate otomatis.
  const handleDownloadTemplate = () => {
    const headers = type === "pengadaan"
      ? [
          "id_pengadaan", "kode_skpd", "nama_skpd", "kode_program", "nama_program",
          "kode_giat", "nama_giat_nama_giat", "kode_sub_giat", "nama_sub_giat_nama_sub_giat",
          "kode_fikasi", "nama_barang", "jumlah_barang", "satuan", "jumlah_maksimum",
          "cara_pemenuhan", "keterangan", "periode", "nm_status",
        ]
      : [
          "id_pemeliharaan", "kode_skpd", "nama_skpd", "kode_program", "nama_program",
          "kode_kegiatan", "nama_giat_nama_giat", "kode_sub_kegiatan", "nama_sub_giat_nama_sub_giat",
          "kode_fikasi", "nama_barang", "jumlah_barang", "satuan", "kondisi_b",
          "kondisi_rr", "kondisi_rb", "nama_pemeliharaan", "jumlah_pemeliharaan",
          "satuan_pemeliharaan", "keterangan", "periode", "nm_status",
        ]

    const exampleRow = type === "pengadaan"
      ? [
          "", "4.01.0.00.0.00.01.0006", "BIRO PENGADAAN BARANG DAN JASA", "4.01.07",
          "PROGRAM KEBIJAKAN DAN PELAYANAN PENGADAAN BARANG DAN JASA", "4.01.07.1.02",
          "Pengelolaan Layanan Pengadaan Secara Elektronik", "4.01.07.1.02.0003",
          "Pengembangan Sistem Informasi Pengadaan Barang dan Jasa", "1.01.01.01.001",
          "Laptop Pengelolaan SPSE", "4", "Unit", "4", "Pengadaan Langsung",
          "Contoh baris — hapus baris ini sebelum impor", "2026", "Draft",
        ]
      : [
          "", "4.01.0.00.0.00.01.0006", "BIRO PENGADAAN BARANG DAN JASA", "4.01.07",
          "PROGRAM KEBIJAKAN DAN PELAYANAN PENGADAAN BARANG DAN JASA", "4.01.07.1.02",
          "Pengelolaan Layanan Pengadaan Secara Elektronik", "4.01.07.1.02.0003",
          "Pengembangan Sistem Informasi Pengadaan Barang dan Jasa", "1.01.01.01.001",
          "Laptop Pengelolaan SPSE", "4", "Unit", "2", "1", "1", "Pemeliharaan rutin",
          "2", "Kegiatan", "Contoh baris — hapus baris ini sebelum impor", "2026", "Draft",
        ]

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), exampleRow.join(",")].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `template_import_rkbmd_${type}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">Formulir Impor Berkas {title}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Unggah file Excel/CSV RKBMD ({type === "pengadaan" ? "POST /api/v1/import/rkbmd-pengadaan" : "POST /api/v1/import/rkbmd-pemeliharaan"}). Max 20MB.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-slate-400" />
          <span>Download Template CSV</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20 flex items-center gap-2 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
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
                {(selectedFile.size / 1024).toFixed(1)} KB • Siap diimpor
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Pilih atau seret berkas RKBMD {title} ke sini
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Format yang didukung: <code className="font-mono">.xlsx</code>, <code className="font-mono">.xls</code>, atau <code className="font-mono">.csv</code> (Maksimum 20MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Import Status Indicator */}
      {importStatus && (
        <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-1.5">
              {importStatus.status === "processing" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              ) : importStatus.status === "completed" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              Status Impor: <span className="capitalize">{importStatus.status}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">{importStatus.file_name}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {importStatus.status === "processing" && "Sistem sedang memproses baris data RKBMD di latar belakang (GET /api/v1/import/status/{id})..."}
            {importStatus.status === "completed" && "Impor selesai! Data RKBMD telah ditambahkan ke database."}
            {importStatus.status === "failed" && `Impor gagal: ${importStatus.error_message}`}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {selectedFile && (
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null)
              setErrorMsg(null)
              setImportStatus(null)
            }}
            disabled={isUploading}
            className="h-8 px-3 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
          >
            Batal
          </button>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mulai Impor {title}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

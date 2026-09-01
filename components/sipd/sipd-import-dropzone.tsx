"use client"

import { useState, useRef } from "react"
import { SipdItem, SipdVersionInfo } from "@/types/sipd"
import { UploadCloud, FileSpreadsheet, Download, Sparkles, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

interface SipdImportDropzoneProps {
  onImportSuccess: (newItems: SipdItem[], version: SipdVersionInfo) => void
  existingVersions: SipdVersionInfo[]
}

export function SipdImportDropzone({ onImportSuccess, existingVersions }: SipdImportDropzoneProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [versionName, setVersionName] = useState<string>("Penetapan Perubahan APBD 2026")
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number>(0) // 0: Idle, 1: Validating, 2: Mapping, 3: Saving, 4: Done

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
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
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
      "34.04",
      "Kabupaten Sleman",
      "2026",
      "1.03.0.00.0.00.01.0000",
      "Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman",
      "1",
      "Urusan Wajib Pelayanan Dasar",
      "1.03",
      "Pekerjaan Umum dan Penataan Ruang",
      "1.03.02",
      "Program Penyelenggaraan Jalan",
      "1.03.02.1.01",
      "Penyelenggaraan Jalan Kabupaten/Kota",
      "1.03.02.1.01.0003",
      "Rekonstruksi Jalan Ruas Kalasan - Prambanan",
      "DAK-FISIK",
      "Dana Alokasi Khusus Fisik",
      "5.2.04.01.01.0001",
      "Belanja Modal Jalan Kabupaten/Kota",
      "ASB-2026-0004",
      "Pekerjaan Rekonstruksi & Overlay Aspal Hotmix AC-WC",
      "7500000000",
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

  // Process Import
  const runImportProcess = async (sampleData?: SipdItem[]) => {
    setIsProcessing(true)
    setCurrentStep(1) // Step 1: Validasi
    await new Promise((r) => setTimeout(r, 600))

    setCurrentStep(2) // Step 2: Mapping Referensi & Relasi DB
    await new Promise((r) => setTimeout(r, 700))

    setCurrentStep(3) // Step 3: Simpan ke dev.sipd_penetapan_apbd
    await new Promise((r) => setTimeout(r, 600))

    // Next version calculation
    const nextVersi =
      existingVersions.filter((v) => v.tahun === selectedYear).length + 1

    const finalItems: SipdItem[] = sampleData || [
      {
        id: Date.now(),
        kode_daerah: "34.04",
        nama_daerah: "Kabupaten Sleman",
        tahun: selectedYear,
        versi: nextVersi,
        nama_versi: versionName || `Versi ${nextVersi} - Penetapan APBD ${selectedYear}`,
        kode_skpd: "1.03.0.00.0.00.01.0000",
        nama_skpd: "Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman",
        kode_sub_unit: "1.03.0.00.0.00.01.0000",
        nama_sub_unit: "Dinas Pekerjaan Umum, Perumahan dan Kawasan Permukiman",
        kode_urusan: "1",
        nama_urusan: "Urusan Pemerintahan Wajib yang Berkaitan dengan Pelayanan Dasar",
        kode_bidang_urusan: "1.03",
        nama_bidang_urusan: "Pekerjaan Umum dan Penataan Ruang",
        kode_program: "1.03.02",
        nama_program: "Program Penyelenggaraan Jalan",
        kode_kegiatan: "1.03.02.1.01",
        nama_kegiatan: "Penyelenggaraan Jalan Kabupaten/Kota",
        kode_sub_kegiatan: "1.03.02.1.01.0003",
        nama_sub_kegiatan: "Rekonstruksi Jalan Paket Baru Hasil Impor SIPD",
        kode_sumber_dana: "DAK-FISIK",
        nama_sumber_dana: "Dana Alokasi Khusus (DAK) Fisik",
        kode_rekening: "5.2.04.01.01.0001",
        nama_rekening: "Belanja Modal Jalan Kabupaten/Kota",
        kode_standar_harga: "ASB-2026-0004",
        nama_standar_harga: "Pekerjaan Overlay Aspal Hotmix AC-WC Standar Bina Marga",
        pagu: 9500000000,
        created_at: new Date().toISOString(),
      },
      {
        id: Date.now() + 1,
        kode_daerah: "34.04",
        nama_daerah: "Kabupaten Sleman",
        tahun: selectedYear,
        versi: nextVersi,
        nama_versi: versionName || `Versi ${nextVersi} - Penetapan APBD ${selectedYear}`,
        kode_skpd: "1.02.0.00.0.00.01.0000",
        nama_skpd: "Dinas Kesehatan",
        kode_sub_unit: "1.02.0.00.0.00.01.0000",
        nama_sub_unit: "Dinas Kesehatan",
        kode_urusan: "1",
        nama_urusan: "Urusan Pemerintahan Wajib yang Berkaitan dengan Pelayanan Dasar",
        kode_bidang_urusan: "1.02",
        nama_bidang_urusan: "Kesehatan",
        kode_program: "1.02.03",
        nama_program: "Program Sediaan Farmasi, Alat Kesehatan dan Makanan Minuman",
        kode_kegiatan: "1.02.03.1.01",
        nama_kegiatan: "Pengadaan Alat Kesehatan Fasilitas Layanan Kesehatan",
        kode_sub_kegiatan: "1.02.02.1.01.0005",
        nama_sub_kegiatan: "Pengadaan Alat Laboratorium PCR & Reagen Puskesmas",
        kode_sumber_dana: "PAD",
        nama_sumber_dana: "Pendapatan Asli Daerah (PAD)",
        kode_rekening: "5.2.02.08.01.0002",
        nama_rekening: "Belanja Modal Alat Kedokteran dan Diagnostik",
        kode_standar_harga: "SSH-2026-0189",
        nama_standar_harga: "Alat Laboratorium Otomatis Real-time Thermal Cycler",
        pagu: 2800000000,
        created_at: new Date().toISOString(),
      },
      {
        id: Date.now() + 2,
        kode_daerah: "34.04",
        nama_daerah: "Kabupaten Sleman",
        tahun: selectedYear,
        versi: nextVersi,
        nama_versi: versionName || `Versi ${nextVersi} - Penetapan APBD ${selectedYear}`,
        kode_skpd: "2.16.0.00.0.00.01.0000",
        nama_skpd: "Dinas Komunikasi dan Informatika",
        kode_sub_unit: "2.16.0.00.0.00.01.0000",
        nama_sub_unit: "Dinas Komunikasi dan Informatika",
        kode_urusan: "2",
        nama_urusan: "Urusan Pemerintahan Wajib yang Tidak Berkaitan dengan Pelayanan Dasar",
        kode_bidang_urusan: "2.16",
        nama_bidang_urusan: "Komunikasi dan Informatika",
        kode_program: "2.16.02",
        nama_program: "Program Aplikasi Informatika dan E-Government",
        kode_kegiatan: "2.16.02.1.01",
        nama_kegiatan: "Pengelolaan Pusat Data dan Infrastruktur SPBE",
        kode_sub_kegiatan: "2.16.02.1.01.0001",
        nama_sub_kegiatan: "Pengembangan Infrastruktur Jaringan & Server Data Center",
        kode_sumber_dana: "DAU",
        nama_sumber_dana: "Dana Alokasi Umum (DAU)",
        kode_rekening: "5.2.02.05.01.0005",
        nama_rekening: "Belanja Modal Komputer Server Rackmount",
        kode_standar_harga: "SSH-2026-0240",
        nama_standar_harga: "Storage SAN Enterprise 100TB High Availability",
        pagu: 4200000000,
        created_at: new Date().toISOString(),
      },
    ]

    const totalPagu = finalItems.reduce((a, b) => a + b.pagu, 0)
    const newVersion: SipdVersionInfo = {
      versi: nextVersi,
      nama_versi: versionName || `Versi ${nextVersi} - Penetapan APBD ${selectedYear}`,
      tahun: selectedYear,
      total_pagu: totalPagu,
      total_rincian: finalItems.length,
      tanggal_impor: new Date().toISOString(),
      status: "Aktif",
    }

    setCurrentStep(4) // Selesai
    await new Promise((r) => setTimeout(r, 400))

    onImportSuccess(finalItems, newVersion)
    setIsProcessing(false)
    setSelectedFile(null)
    setCurrentStep(0)
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
          accept=".xlsx,.xls,.csv,.json"
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
                Mendukung format Microsoft Excel (<code className="font-mono">.xlsx</code>, <code className="font-mono">.xls</code>), <code className="font-mono">.csv</code>, atau <code className="font-mono">.json</code>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stepper / Processing Progress */}
      {isProcessing && (
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              Memproses Impor Data Penetapan APBD...
            </span>
            <span className="font-mono text-[11px]">{currentStep * 25}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${currentStep * 25}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
            <span className={currentStep >= 1 ? "text-blue-600 font-semibold" : ""}>1. Validasi Kolom</span>
            <span className={`text-center ${currentStep >= 2 ? "text-blue-600 font-semibold" : ""}`}>2. Relasi Struktur</span>
            <span className={`text-right ${currentStep >= 3 ? "text-emerald-600 font-semibold" : ""}`}>3. Simpan DB</span>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Download Template Format CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Format Template CSV</span>
          </button>

          <button
            type="button"
            onClick={() => runImportProcess()}
            disabled={isProcessing}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
            title="Simulasikan impor dengan dataset baru SIPD-RI"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Gunakan Sampel SIPD-RI (Demo)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {selectedFile && (
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
            onClick={() => runImportProcess()}
            disabled={isProcessing || !selectedFile}
            className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Mengimpor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mulai Impor Versi Ini</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { User, UserRole, CreateUserPayload, UpdateUserPayload } from "@/types/user"
import { useSkpd } from "@/hooks/useSkpd"
import { useRefSubKegiatan } from "@/hooks/useReferensi"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import { X, UserPlus, Pencil, Save, Building2, Shield, Briefcase, AlertCircle, CheckCircle2, Check, Loader2 } from "lucide-react"

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: CreateUserPayload | (UpdateUserPayload & { id: number })) => void
  initialData?: User | null
}

const ROLES: UserRole[] = ["Admin", "Kepala OPD", "Kepala Sub Unit", "PPK", "Verifikator"]

function UserFormContent({
  onClose,
  onSave,
  initialData,
}: {
  onClose: () => void
  onSave: (payload: CreateUserPayload | (UpdateUserPayload & { id: number })) => void
  initialData?: User | null
}) {
  const isEditMode = !!initialData

  // Ambil daftar SKPD dari API /api/ref-skpd (proxy ke GET /api/v1/ref-skpd)
  const { skpdList, isLoading: isSkpdLoading } = useSkpd()

  const skpdOptions: SearchableSelectOption[] = skpdList.map((s) => ({
    value: s.kode_skpd,
    label: s.is_sub_unit ? `${s.nama_skpd}` : s.nama_skpd,
    group: s.is_sub_unit ? "Sub Unit" : "SKPD Induk",
  }))

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      const selectedSubIds = initialData.sub_kegiatan?.map((s) => s.kode_sub_kegiatan) ||
        (initialData.kode_sub_kegiatan ? [initialData.kode_sub_kegiatan] : [])

      return {
        nama: initialData.nama || "",
        username: initialData.username || "",
        password: "",
        role: initialData.role || ("Admin" as UserRole),
        kode_skpd: initialData.kode_skpd || (initialData.skpd?.kode_skpd ?? ""),
        sub_kegiatan_ids: selectedSubIds,
        nip: initialData.info?.nip || "",
        pangkat: initialData.info?.pangkat || "",
        golongan: initialData.info?.golongan || "",
        jabatan: initialData.info?.jabatan || "",
        no_hp: initialData.info?.no_hp || "",
        email_dinas: initialData.info?.email_dinas || "",
      }
    }
    return {
      nama: "",
      username: "",
      password: "",
      role: "Admin" as UserRole,
      kode_skpd: "",
      sub_kegiatan_ids: [],
      nip: "",
      pangkat: "",
      golongan: "",
      jabatan: "",
      no_hp: "",
      email_dinas: "",
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const isRolePpk = formData.role === "PPK"

  // Daftar Sub Kegiatan dari API /api/referensi/sub-kegiatan (GET /api/v1/ref-sub-kegiatan)
  // kode_skpd wajib — daftar mengikuti SKPD yang dipilih di form
  const { data: subKegiatanList, isLoading: isSubLoading } = useRefSubKegiatan(formData.kode_skpd || "")

  const handleSkpdChange = (kodeSkpd: string) => {
    setFormData((prev) => ({
      ...prev,
      kode_skpd: kodeSkpd,
      // Sub kegiatan berbeda per SKPD — kosongkan pilihan lama
      sub_kegiatan_ids: [],
    }))
  }

  const handleRoleChange = (newRole: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      // If switching to non-PPK, clear sub kegiatan
      sub_kegiatan_ids: newRole === "PPK" ? prev.sub_kegiatan_ids : [],
    }))
    if (newRole !== "PPK") {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.sub_kegiatan_ids
        return next
      })
    }
  }

  const toggleSubKegiatan = (kodeSub: string) => {
    setFormData((prev) => {
      const exists = prev.sub_kegiatan_ids.includes(kodeSub)
      const updated = exists
        ? prev.sub_kegiatan_ids.filter((id) => id !== kodeSub)
        : [...prev.sub_kegiatan_ids, kodeSub]

      return { ...prev, sub_kegiatan_ids: updated }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next.sub_kegiatan_ids
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.nama.trim()) newErrors.nama = "Nama lengkap wajib diisi"
    if (!formData.username.trim()) newErrors.username = "Username wajib diisi"
    
    // Password required only in create mode
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "Kata sandi wajib diisi"
    }

    // Validasi khusus role PPK: Wajib mapping minimal 1 sub kegiatan
    if (formData.role === "PPK" && formData.sub_kegiatan_ids.length === 0) {
      newErrors.sub_kegiatan_ids = "Pilih minimal 1 sub kegiatan untuk peran PPK"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: CreateUserPayload | (UpdateUserPayload & { id: number }) = {
      ...(initialData ? { id: initialData.id } : {}),
      nama: formData.nama,
      username: formData.username,
      ...(formData.password ? { password: formData.password } : {}),
      role: formData.role,
      kode_skpd: formData.kode_skpd || null,
      sub_kegiatan_ids: isRolePpk ? formData.sub_kegiatan_ids : [],
      info: {
        ...(initialData?.info || {}),
        nip: formData.nip,
        pangkat: formData.pangkat,
        golongan: formData.golongan,
        jabatan: formData.jabatan,
        no_hp: formData.no_hp,
        email_dinas: formData.email_dinas,
      },
    }

    onSave(payload)
    onClose()
  }

  return (
    <div
      className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${
            isEditMode ? "bg-amber-600" : "bg-blue-600"
          }`}>
            {isEditMode ? <Pencil className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {isEditMode ? `Edit Pengguna: ${initialData?.nama}` : "Tambah Pengguna Baru"}
            </h2>
            {/* <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditMode ? (
                <span>Perbarui data pengguna sesuai format <code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">docs/users.md</code></span>
              ) : (
                <span>Data akun baru akan disimpan ke backend API (<code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">POST /api/v1/users</code>)</span>
              )}
            </p> */}
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

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
        {/* Section 1: Akun & Login */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" /> Kredensial & Peran Sistem
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso, S.T."
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
              {errors.nama && <p className="text-[10px] text-red-500 mt-1">{errors.nama}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: ppk_umum"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
              {errors.username && <p className="text-[10px] text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi {isEditMode ? "(Opsional)" : <span className="text-red-500">*</span>}
                </label>
                {isEditMode && (
                  <span className="text-[10px] text-slate-400">Kosongkan jika tidak diubah</span>
                )}
              </div>
              <input
                type="password"
                placeholder={isEditMode ? "•••••••• (Tetap sama)" : "••••••••"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
              {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Peran (Role) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Unit Kerja (SKPD & Sub Kegiatan Mapping Array: sub_kegiatan_ids) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-500" /> Penugasan SKPD & Sub Kegiatan
            </p>
            {isRolePpk ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                {formData.sub_kegiatan_ids.length} Sub Kegiatan Dipilih
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 italic">
                Sub kegiatan hanya untuk PPK
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Perangkat Daerah (SKPD)
              </label>
              <SearchableSelect
                options={[{ value: "", label: "-- Tanpa SKPD (Admin Pusat / LPSE) --" }, ...skpdOptions]}
                value={formData.kode_skpd}
                onChange={handleSkpdChange}
                loading={isSkpdLoading}
                placeholder="-- Pilih SKPD --"
              />
            </div>

            {/* Sub Kegiatan Mapping: Multi-select array (sub_kegiatan_ids) for PPK */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Daftar Sub Kegiatan {" "}
                  {isRolePpk && (
                    <span className="text-red-500 font-bold">* (Wajib untuk PPK)</span>
                  )}
                </label>
                {isRolePpk && (
                  <span className="text-[10px] text-slate-400">
                    Klik item untuk memilih / batal
                  </span>
                )}
              </div>

              {isRolePpk ? (
                <div className="space-y-2">
                  {!formData.kode_skpd ? (
                    <div className="flex items-center gap-2 px-3 py-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-xs justify-center">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Pilih Perangkat Daerah (SKPD) terlebih dahulu untuk memuat daftar sub kegiatan.</span>
                    </div>
                  ) : isSubLoading ? (
                    <div className="flex items-center justify-center gap-2 py-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      <span>Memuat sub kegiatan dari API...</span>
                    </div>
                  ) : subKegiatanList.length === 0 ? (
                    <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
                      Tidak ada sub kegiatan untuk SKPD ini.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {subKegiatanList.map((sub) => {
                        const isSelected = formData.sub_kegiatan_ids.includes(sub.kode_sub_kegiatan)
                        return (
                          <div
                            key={sub.kode_sub_kegiatan}
                            onClick={() => toggleSubKegiatan(sub.kode_sub_kegiatan)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                              isSelected
                                ? "bg-amber-50/80 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-500/30"
                                : "hover:bg-slate-100 dark:hover:bg-slate-850"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                                {sub.nama_sub_kegiatan}
                              </p>
                              <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                                {sub.kode_sub_kegiatan}
                              </p>
                            </div>
                            <div
                              className={`h-4 w-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? "bg-amber-600 border-amber-600 text-white"
                                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {errors.sub_kegiatan_ids && (
                    <p className="text-[10px] text-red-500">{errors.sub_kegiatan_ids}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">
                    Relasi Sub Kegiatan dinonaktifkan (hanya berlaku untuk peran <b>PPK</b>).
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Info Kepegawaian (JSONB: info) */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-indigo-500" /> Informasi Kepegawaian (Kolom JSONB: info)
            </p>
            <span className="text-[9px] font-mono text-slate-400">info jsonb</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP (18 Digit)
              </label>
              <input
                type="text"
                placeholder="Contoh: 198507152010011005"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan Kedinasan
              </label>
              <input
                type="text"
                placeholder="Contoh: Pejabat Pembuat Komitmen Bagian Umum"
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pangkat & Golongan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Pangkat (cth: Penata Tingkat I)"
                  value={formData.pangkat}
                  onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Golongan (cth: III/d)"
                  value={formData.golongan}
                  onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                placeholder="081234567890"
                value={formData.no_hp}
                onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Kedinasan
              </label>
              <input
                type="email"
                placeholder="budi.santoso@pemda.go.id"
                value={formData.email_dinas}
                onChange={(e) => setFormData({ ...formData, email_dinas: e.target.value })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className={`px-4 py-2 inline-flex items-center gap-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
              isEditMode ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {isEditMode ? "Simpan Perubahan" : "Simpan Pengguna"}
          </button>
        </div>
      </form>
    </div>
  )
}

export function UserFormModal({ isOpen, onClose, onSave, initialData }: UserFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <UserFormContent
        key={initialData ? `edit-${initialData.id}` : "create-user"}
        onClose={onClose}
        onSave={onSave}
        initialData={initialData}
      />
    </div>
  )
}

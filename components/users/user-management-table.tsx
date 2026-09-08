"use client"

import { useState, useEffect } from "react"
import { User, UserRole, UserListResponse, CreateUserPayload, UpdateUserPayload } from "@/types/user"
import { useSkpd } from "@/hooks/useSkpd"
import { usePermission } from "@/hooks/usePermission"
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select"
import {
  ColumnVisibilityDropdown,
  DEFAULT_VISIBLE_COLUMNS,
} from "./column-visibility-dropdown"
import { UserDetailModal } from "./user-detail-modal"
import { UserFormModal } from "./user-form-modal"
import {
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users as UsersIcon,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  UserCheck,
  RotateCcw,
  Loader2,
} from "lucide-react"

export function UserManagementTable() {
  const { can, canCreate, creatableRoles } = usePermission()
  const canCreateAnyUser = creatableRoles().length > 0

  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("ALL")
  const [selectedSkpd, setSelectedSkpd] = useState<string>("ALL")

  // Ambil daftar SKPD dari API /api/ref-skpd (GET /api/v1/ref-skpd)
  const { skpdList } = useSkpd()

  const roleOptions: SearchableSelectOption[] = [
    { value: "ALL", label: "Semua Peran" },
    { value: "Admin", label: "Admin" },
    { value: "Kepala OPD", label: "Kepala OPD" },
    { value: "Kepala Sub Unit", label: "Kepala Sub Unit" },
    { value: "PPK", label: "PPK (Relasi Sub Kegiatan)" },
    { value: "Verifikator", label: "Verifikator" },
  ]

  const skpdFilterOptions: SearchableSelectOption[] = [
    { value: "ALL", label: "Semua Perangkat Daerah" },
    ...skpdList.map((s) => ({
      value: s.kode_skpd,
      label: s.is_sub_unit ? `↳ ${s.nama_skpd}` : s.nama_skpd,
      group: s.is_sub_unit ? "Sub Unit" : "SKPD Induk",
    })),
  ]
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  // Sorting state
  const [sortField, setSortField] = useState<string>("nama")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Modals state
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<User | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  
  // Initial state with localStorage read if available in browser
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sikebut-users-columns")
        if (saved) return JSON.parse(saved)
      } catch {
        // fallback
      }
    }
    return DEFAULT_VISIBLE_COLUMNS
  })

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let cancel = false
    async function loadData() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          per_page: String(pageSize),
          sort_by: sortField,
          sort_direction: sortOrder,
        })

        if (search) params.set("search", search)
        if (selectedRole && selectedRole !== "ALL") params.set("role", selectedRole)
        if (selectedSkpd && selectedSkpd !== "ALL") params.set("kode_skpd", selectedSkpd)

        const res = await fetch(`/api/users?${params.toString()}`)
        if (res.ok && !cancel) {
          const json: UserListResponse = await res.json()
          if (json.data) {
            setUsers(json.data)
            if (json.meta) {
              setTotalPages(json.meta.last_page)
              setTotalRecords(json.meta.total)
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        if (!cancel) {
          setIsLoading(false)
        }
      }
    }

    loadData()
    return () => {
      cancel = true
    }
  }, [currentPage, pageSize, sortField, sortOrder, search, selectedRole, selectedSkpd, refreshTrigger])

  // Save visible columns to localStorage
  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const updated = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem("sikebut-users-columns", JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)
    try {
      localStorage.setItem("sikebut-users-columns", JSON.stringify(DEFAULT_VISIBLE_COLUMNS))
    } catch {
      // ignore
    }
  }

  const handleSelectAllColumns = () => {
    const allTrue: Record<string, boolean> = {
      nama: true,
      username: true,
      role: true,
      skpd: true,
      nip: true,
      jabatan: true,
      pangkat_golongan: true,
      sub_kegiatan: true,
      no_hp: true,
      created_at: true,
      aksi: true,
    }
    setVisibleColumns(allTrue)
    try {
      localStorage.setItem("sikebut-users-columns", JSON.stringify(allTrue))
    } catch {
      // ignore
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // User Action Handlers
  const handleOpenCreate = () => {
    setEditingUser(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setIsFormModalOpen(true)
  }

  const handleSaveUser = async (payload: CreateUserPayload | (UpdateUserPayload & { id: number })) => {
    try {
      if ("id" in payload && payload.id) {
        // Update user
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setRefreshTrigger((prev) => prev + 1)
        }
      } else {
        // Create user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          setCurrentPage(1)
          setRefreshTrigger((prev) => prev + 1)
        }
      }
    } catch (err) {
      console.error("Failed to save user:", err)
    } finally {
      setIsFormModalOpen(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        const res = await fetch(`/api/users?id=${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setRefreshTrigger((prev) => prev + 1)
        }
      } catch (err) {
        console.error("Failed to delete user:", err)
      }
    }
  }

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Nama Lengkap",
      "Username",
      "Role",
      "Kode SKPD",
      "Nama SKPD",
      "NIP",
      "Pangkat",
      "Golongan",
      "Jabatan",
      "Sub Kegiatan (PPK)",
      "No HP",
      "Email Dinas",
      "Tanggal Dibuat",
    ]
    const rows = users.map((u) => {
      const skpdName = u.skpd?.nama_skpd || u.nama_skpd || ""
      const skpdCode = u.skpd?.kode_skpd || u.kode_skpd || ""
      const subKegText = u.sub_kegiatan && u.sub_kegiatan.length > 0
        ? u.sub_kegiatan.map(s => `${s.kode_sub_kegiatan} (${s.nama_sub_kegiatan})`).join("; ")
        : (u.nama_sub_kegiatan || u.kode_sub_kegiatan || "")

      return [
        u.id,
        `"${u.nama}"`,
        `"${u.username}"`,
        `"${u.role}"`,
        `"${skpdCode}"`,
        `"${skpdName}"`,
        `"${u.info?.nip || ""}"`,
        `"${u.info?.pangkat || ""}"`,
        `"${u.info?.golongan || ""}"`,
        `"${u.info?.jabatan || ""}"`,
        `"${u.role === "PPK" ? subKegText : ""}"`,
        `"${u.info?.no_hp || ""}"`,
        `"${u.info?.email_dinas || ""}"`,
        `"${u.created_at}"`,
      ]
    })

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `data_users_sikebut_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper Badge Color for the 5 official roles
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30"
      case "Kepala OPD":
        return "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30"
      case "Kepala Sub Unit":
        return "bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30"
      case "PPK":
        return "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30"
      case "Verifikator":
        return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
    }
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <UsersIcon className="h-3.5 w-3.5 text-blue-500" /> Total Pengguna
          </p>
          <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white mt-1.5 font-mono">
            {totalRecords}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-amber-500" /> PPK (Sub Kegiatan)
          </p>
          <p className="font-display text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1.5 font-mono">
            {users.filter((u) => u.role === "PPK").length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verifikator
          </p>
          <p className="font-display text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 font-mono">
            {users.filter((u) => u.role === "Verifikator").length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-2xs">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-purple-500" /> Kepala OPD / Sub Unit
          </p>
          <p className="font-display text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1.5 font-mono">
            {users.filter((u) => u.role === "Kepala OPD" || u.role === "Kepala Sub Unit").length}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs overflow-hidden">
        {/* Table Control Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, username, NIP, sub kegiatan..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-56 sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Role Filter */}
            <SearchableSelect
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => {
                setSelectedRole(val)
                setCurrentPage(1)
              }}
              placeholder="Semua Peran"
            />

            {/* SKPD Filter */}
            <SearchableSelect
              options={skpdFilterOptions}
              value={selectedSkpd}
              onChange={(val) => {
                setSelectedSkpd(val)
                setCurrentPage(1)
              }}
              placeholder="Semua Perangkat Daerah"
            />

            {(search || selectedRole !== "ALL" || selectedSkpd !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSelectedRole("ALL")
                  setSelectedSkpd("ALL")
                  setCurrentPage(1)
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline px-1 py-1 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Filter
              </button>
            )}
          </div>

          {/* Action Buttons: Column Selector, Export, Tambah */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* FITUR MEMILIH KOLOM (COLUMN VISIBILITY SELECTOR) */}
            <ColumnVisibilityDropdown
              visibleColumns={visibleColumns}
              onToggleColumn={handleToggleColumn}
              onResetColumns={handleResetColumns}
              onSelectAllColumns={handleSelectAllColumns}
            />

            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Export data ke CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>

            {canCreateAnyUser && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Pengguna</span>
              </button>
            )}
          </div>
        </div>

        {/* Database Schema Tag Info */}
        {/* <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold">
              GET /api/v1/users
            </span>
            <span>
              Format relasi <code className="font-mono text-[10px] text-amber-700 dark:text-amber-400">skpd</code> &amp; <code className="font-mono text-[10px] text-amber-700 dark:text-amber-400">sub_kegiatan</code> array (khusus <b>PPK</b>).
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
            {totalRecords} total pengguna
          </div>
        </div> */}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 select-none">
                {visibleColumns.nama && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("nama")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Nama Lengkap</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.username && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Username</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.role && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Role</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.skpd && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("kode_skpd")}
                  >
                    <div className="flex items-center gap-1">
                      <span>SKPD / Unit Kerja</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {/* Optional Columns from dev.users & info jsonb */}
                {visibleColumns.nip && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 font-mono"
                    onClick={() => handleSort("nip")}
                  >
                    <div className="flex items-center gap-1">
                      <span>NIP (info)</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.jabatan && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("jabatan")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Jabatan (info)</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.pangkat_golongan && (
                  <th className="font-semibold px-4 py-3">Pangkat / Gol.</th>
                )}

                {/* Sub Kegiatan (Array objek sub_kegiatan) */}
                {visibleColumns.sub_kegiatan && (
                  <th className="font-semibold px-4 py-3">
                    Sub Kegiatan (PPK)
                  </th>
                )}

                {visibleColumns.no_hp && (
                  <th className="font-semibold px-4 py-3">No. HP</th>
                )}

                {visibleColumns.created_at && (
                  <th
                    className="font-semibold px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Tgl. Dibuat</span>
                      <ArrowUpDown className="h-3 w-3 opacity-60" />
                    </div>
                  </th>
                )}

                {visibleColumns.aksi && (
                  <th className="font-semibold px-4 py-3 text-right">Aksi</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                    className="text-center text-xs text-slate-400 py-12"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Memuat data pengguna dari backend...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                    className="text-center text-xs text-slate-400 py-10"
                  >
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const skpdName = user.skpd?.nama_skpd || user.nama_skpd || "-"
                  const skpdCode = user.skpd?.kode_skpd || user.kode_skpd || null
                  const subKegiatanList = user.sub_kegiatan || []

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Nama */}
                      {visibleColumns.nama && (
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-semibold text-[11px] text-slate-700 dark:text-slate-300 shrink-0">
                              {user.nama.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="leading-snug">{user.nama}</p>
                              {user.info?.nip && (
                                <p className="text-[10px] font-mono text-slate-400 block lg:hidden">
                                  NIP: {user.info.nip}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Username */}
                      {visibleColumns.username && (
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                          @{user.username}
                        </td>
                      )}

                      {/* Role */}
                      {visibleColumns.role && (
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${getRoleBadge(
                              user.role
                            )}`}
                          >
                            <Shield className="h-3 w-3" />
                            {user.role}
                          </span>
                        </td>
                      )}

                      {/* SKPD */}
                      {visibleColumns.skpd && (
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs">
                          <p className="truncate font-medium text-[11px]" title={skpdName}>
                            {skpdName}
                          </p>
                          {skpdCode && (
                            <p className="font-mono text-[10px] text-slate-400 truncate">
                              {skpdCode}
                            </p>
                          )}
                        </td>
                      )}

                      {/* Optional: NIP */}
                      {visibleColumns.nip && (
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {user.info?.nip || "—"}
                        </td>
                      )}

                      {/* Optional: Jabatan */}
                      {visibleColumns.jabatan && (
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate text-[11px]" title={user.info?.jabatan || ""}>
                          {user.info?.jabatan || "—"}
                        </td>
                      )}

                      {/* Optional: Pangkat & Golongan */}
                      {visibleColumns.pangkat_golongan && (
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-[11px] whitespace-nowrap">
                          {user.info?.pangkat ? (
                            <span>
                              {user.info.pangkat}{" "}
                              <span className="font-mono text-[10px] text-slate-400">
                                ({user.info?.golongan || "-"})
                              </span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}

                      {/* Sub Kegiatan (Array sub_kegiatan objects) */}
                      {visibleColumns.sub_kegiatan && (
                        <td className="px-4 py-3 max-w-xs">
                          {user.role === "PPK" ? (
                            subKegiatanList.length > 0 ? (
                              <div className="space-y-1">
                                {subKegiatanList.slice(0, 2).map((sub) => (
                                  <div key={sub.kode_sub_kegiatan} className="truncate">
                                    <span className="font-semibold text-[10px] text-amber-700 dark:text-amber-400 font-mono mr-1">
                                      {sub.kode_sub_kegiatan}
                                    </span>
                                    <span className="text-[11px] text-slate-700 dark:text-slate-300" title={sub.nama_sub_kegiatan}>
                                      {sub.nama_sub_kegiatan}
                                    </span>
                                  </div>
                                ))}
                                {subKegiatanList.length > 2 && (
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                    +{subKegiatanList.length - 2} sub kegiatan lainnya
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium italic">
                                Belum dimapping
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                      )}

                      {/* Optional: No HP */}
                      {visibleColumns.no_hp && (
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {user.info?.no_hp || "—"}
                        </td>
                      )}

                      {/* Optional: Created At */}
                      {visibleColumns.created_at && (
                        <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      )}

                      {/* Action */}
                      {visibleColumns.aksi && (
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Detail Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedUserForDetail(user)}
                              className="h-7 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:text-slate-300 dark:hover:text-blue-300 text-[11px] font-medium transition-colors"
                              title="Lihat Detail & Data JSONB"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Detail</span>
                            </button>

                            {/* Edit Button */}
                            {canCreate(user.role) && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="h-7 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-900/30 dark:text-slate-300 dark:hover:text-amber-300 text-[11px] font-medium transition-colors"
                                title="Edit Data Pengguna"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            )}

                            {/* Delete Button */}
                            {can("user:delete") && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline ml-2">
              Menampilkan {totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, totalRecords)} dari {totalRecords} pengguna
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="h-7 px-2.5 inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      <UserDetailModal
        user={selectedUserForDetail}
        onClose={() => setSelectedUserForDetail(null)}
      />

      {/* Form Modal (Create & Edit) */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  )
}

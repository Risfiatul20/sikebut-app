"use client"

import { useEffect, useState } from "react"
import {
  useTable,
  tableFeatures,
  rowPaginationFeature,
  rowSortingFeature,
  createSortedRowModel,
  sortFns,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronUp, ChevronDown, ChevronsUpDown, Shield } from "lucide-react"
import { User, UserRole } from "@/types/user"

type UsersResponse = {
  data: User[]
  total: number
}

const features = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
})

const getRoleBadgeClass = (role: UserRole) => {
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
      return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
  }
}

const columns: ColumnDef<typeof features, User, unknown>[] = [
  {
    accessorKey: "nama",
    header: "Nama Lengkap",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-slate-100">{row.original.nama}</p>
        <p className="text-[10px] font-mono text-slate-400">@{row.original.username}</p>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ getValue }) => {
      const role = getValue() as UserRole
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeClass(role)}`}>
          <Shield className="h-3 w-3" />
          {role}
        </span>
      )
    },
  },
  {
    accessorKey: "nama_skpd",
    header: "SKPD",
    cell: ({ row }) => (
      <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[200px] block">
        {row.original.nama_skpd || "Sekretariat Daerah (Admin)"}
      </span>
    ),
  },
]

export function UserTable() {
  const [data, setData] = useState<User[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const sortParam = sorting
          .map((s) => `${s.id}:${s.desc ? "desc" : "asc"}`)
          .join(",")
        const params = new URLSearchParams({
          page: String(pagination.pageIndex + 1),
          limit: String(pagination.pageSize),
        })
        if (sortParam) params.set("sort", sortParam)

        const res = await fetch(`/api/users?${params.toString()}`)
        if (!res.ok) throw new Error(`Request gagal: ${res.status}`)

        const json = (await res.json()) as UsersResponse
        if (!cancelled) {
          setData(json.data ?? [])
          setRowCount(json.total ?? 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pagination, sorting])

  const table = useTable({
    features,
    columns,
    data,
    manualPagination: true,
    rowCount,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: (updater) => {
      setSorting(updater)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50 dark:bg-slate-800/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none text-[10px] uppercase text-slate-400" : "text-[10px] uppercase text-slate-400"}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="size-3.5" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        ))}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-slate-400">
                  Memuat data pengguna...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs text-destructive"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs text-slate-400">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Baris per halaman
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-fit h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {[10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Halaman {pagination.pageIndex + 1} dari{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}

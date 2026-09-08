"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Search, Loader2, Package, Wrench, ClipboardList, CheckCircle2 } from "lucide-react"
import { RkbmdItemTerpilih } from "@/types/identifikasi"

/**
 * Popup "Ambil dari RKBMD" — identifikasi barang yang telah tersedia/dimiliki/dikuasai
 * (penjelasan.docx Tabel 3 & 9, khusus belanja modal).
 *
 * Mengikuti pola Modal Pagu (RKA SIPD): multi-pilih → input jumlah per item →
 * footer total → tombol "Konfirmasi Pemilihan". Pilihan lama (currentSelections)
 * tetap tercentang saat modal dibuka ulang.
 *
 * Sumber data:
 *  1. rkbmd_pengadaan    → rencana kebutuhan → mengisi "Jumlah Dibutuhkan"
 *  2. rkbmd_pemeliharaan → aset yang sudah dimiliki → mengisi "Jumlah Sejenis" + kondisi
 *
 * Hasil konfirmasi disimpan sebagai daftar (array) di form_data → kolom rkbmd_items.
 * Nilai ringkasan (Jumlah Dibutuhkan/Sejenis/Kondisi) dihitung ulang oleh form.
 */

interface Props {
  isOpen: boolean
  onClose: () => void
  kodeSubKegiatan: string
  kodeSkpd?: string
  /** Daftar item yang sudah dipilih sebelumnya (untuk pre-check saat dibuka ulang). */
  currentSelections: RkbmdItemTerpilih[]
  /** Terpanggil saat user menekan "Konfirmasi Pemilihan". */
  onSelect: (items: RkbmdItemTerpilih[]) => void
}

interface RawPengadaan {
  id_pengadaan: number
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  jumlah_maksimum?: number
}

interface RawPemeliharaan {
  id_pemeliharaan: number
  kode_fikasi: string
  nama_barang: string
  jumlah_barang: number
  satuan: string
  kondisi_b?: number
  kondisi_rr?: number
  kondisi_rb?: number
}

export function RkbmdPickerModal({
  isOpen,
  onClose,
  kodeSubKegiatan,
  kodeSkpd,
  currentSelections,
  onSelect,
}: Props) {
  const [tab, setTab] = useState<"pengadaan" | "pemeliharaan">("pengadaan")
  const [pengadaan, setPengadaan] = useState<RawPengadaan[]>([])
  const [pemeliharaan, setPemeliharaan] = useState<RawPemeliharaan[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Map<string, RkbmdItemTerpilih>>(new Map())

  // Inisialisasi pilihan dari currentSelections setiap modal dibuka
  useEffect(() => {
    if (isOpen) {
      const map = new Map<string, RkbmdItemTerpilih>()
      currentSelections.forEach((s) => map.set(s.id, { ...s }))
      setSelected(map)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadAll = useCallback(async () => {
    if (!isOpen) return
    setIsLoading(true)
    setError(null)

    const params = new URLSearchParams({ per_page: "0" })
    if (kodeSubKegiatan) params.set("kode_sub_kegiatan", kodeSubKegiatan)
    if (kodeSkpd) params.set("kode_skpd", kodeSkpd)

    try {
      const [resPengadaan, resPemeliharaan] = await Promise.all([
        fetch(`/api/rkbmd/pengadaan?${params.toString()}`),
        fetch(`/api/rkbmd/pemeliharaan?${params.toString()}`),
      ])
      if (!resPengadaan.ok || !resPemeliharaan.ok) {
        throw new Error(`Gagal memuat data RKBMD (HTTP ${resPengadaan.status}/${resPemeliharaan.status})`)
      }
      const [jPengadaan, jPemeliharaan] = await Promise.all([resPengadaan.json(), resPemeliharaan.json()])
      setPengadaan((jPengadaan.data ?? []) as RawPengadaan[])
      setPemeliharaan((jPemeliharaan.data ?? []) as RawPemeliharaan[])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat RKBMD")
    } finally {
      setIsLoading(false)
    }
  }, [isOpen, kodeSubKegiatan, kodeSkpd])

  useEffect(() => {
    if (isOpen) {
      loadAll()
    }
    // Reset saat buka
    setSearch("")
    setTab("pengadaan")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, kodeSubKegiatan])

  if (!isOpen) return null

  const q = search.toLowerCase().trim()
  const filterBySearch = <T extends { nama_barang: string; kode_fikasi: string }>(rows: T[]) => {
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.nama_barang.toLowerCase().includes(q) ||
        r.kode_fikasi.toLowerCase().includes(q)
    )
  }

  const pengadaanFiltered = filterBySearch(pengadaan)
  const pemeliharaanFiltered = filterBySearch(pemeliharaan)

  const fmt = (n?: number | null) => (n ?? 0).toLocaleString("id-ID")

  const isChecked = (id: string) => selected.has(id)

  /** Batas atas jumlah untuk tab Rencana (Pengadaan) = kolom "Maks" (jumlah_maksimum),
   *  fallback ke jumlah_barang bila Maks tidak terisi. */
  const pengadaanCap = (r: RawPengadaan): number | undefined => {
    const m = r.jumlah_maksimum
    if (m && m > 0) return m
    const b = r.jumlah_barang
    return b && b > 0 ? b : undefined
  }

  /** Batas atas jumlah untuk tab Aset (Pemeliharaan) = total aset yang dimiliki (jumlah_barang). */
  const pemeliharaanCap = (r: RawPemeliharaan): number | undefined =>
    r.jumlah_barang > 0 ? r.jumlah_barang : undefined

  /** Jepit nilai agar 0 ≤ v ≤ cap (pola Modal Pagu — nilai tidak pernah melebihi Maks). */
  const clampTo = (cap: number | undefined, v: number) =>
    cap == null ? Math.max(0, v) : Math.max(0, Math.min(v, cap))

  const togglePengadaan = (r: RawPengadaan) => {
    setSelected((prev) => {
      const next = new Map(prev)
      const id = `pengadaan-${r.id_pengadaan}`
      if (next.has(id)) {
        next.delete(id)
      } else {
        const cap = pengadaanCap(r)
        next.set(id, {
          id,
          sumber: "pengadaan",
          nama_barang: r.nama_barang,
          kode_fikasi: r.kode_fikasi || "",
          jumlah: clampTo(cap, Math.max(r.jumlah_barang ?? 0, r.jumlah_maksimum ?? 0)),
          satuan: r.satuan || "",
          jumlah_maksimum: r.jumlah_maksimum,
        })
      }
      return next
    })
  }

  const togglePemeliharaan = (r: RawPemeliharaan) => {
    setSelected((prev) => {
      const next = new Map(prev)
      const id = `pemeliharaan-${r.id_pemeliharaan}`
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.set(id, {
          id,
          sumber: "pemeliharaan",
          nama_barang: r.nama_barang,
          kode_fikasi: r.kode_fikasi || "",
          jumlah: r.jumlah_barang ?? 0,
          satuan: r.satuan || "",
          kondisi_b: r.kondisi_b ?? 0,
          kondisi_rr: r.kondisi_rr ?? 0,
          kondisi_rb: r.kondisi_rb ?? 0,
        })
      }
      return next
    })
  }

  const updateSelectedItem = (id: string, patch: Partial<RkbmdItemTerpilih>, cap?: number) => {
    setSelected((prev) => {
      const next = new Map(prev)
      const cur = next.get(id)
      if (!cur) return prev
      const nextPatch =
        cap != null && patch.jumlah != null
          ? { ...patch, jumlah: Math.max(0, Math.min(patch.jumlah, cap)) }
          : patch
      next.set(id, { ...cur, ...nextPatch })
      return next
    })
  }

  const totalUnit = Array.from(selected.values()).reduce((s, it) => s + (it.jumlah || 0), 0)

  const handleConfirm = () => {
    onSelect(Array.from(selected.values()))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <span className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              Ambil Data dari RKBMD
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              Centang ≥ 1 barang, atur jumlahnya, lalu Konfirmasi — sub kegiatan:{" "}
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{kodeSubKegiatan || "-"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Kontrol */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setTab("pengadaan")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
                tab === "pengadaan" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Package className="h-3 w-3" /> Rencana (Pengadaan)
              <span className="font-mono text-[9px] text-slate-400">{pengadaan.length}</span>
            </button>
            <button
              onClick={() => setTab("pemeliharaan")}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors ${
                tab === "pemeliharaan" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Wrench className="h-3 w-3" /> Aset Dimiliki (Pemeliharaan)
              <span className="font-mono text-[9px] text-slate-400">{pemeliharaan.length}</span>
            </button>
          </div>
          <div className="relative ml-auto">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang / kodefikasi..."
              className="w-60 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {tab === "pengadaan" && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Klik baris untuk mencentang — <b>Jumlah Dibutuhkan</b> (rencana dari RKBMD) bisa diubah di kolom jumlah
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Memuat data RKBMD...
                </div>
              ) : pengadaanFiltered.length === 0 ? (
                <EmptyState label="Tidak ada data RKBMD Pengadaan untuk sub kegiatan ini. Isi manual pada form." />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-[10px] uppercase text-slate-400">
                        <th className="font-semibold px-3 py-2 text-center w-10">✓</th>
                        <th className="font-semibold px-3 py-2 text-left min-w-[180px]">Nama Barang</th>
                        <th className="font-semibold px-3 py-2 text-right">Tersedia</th>
                        <th className="font-semibold px-3 py-2 text-right">Maks</th>
                        <th className="font-semibold px-3 py-2 text-right">Satuan</th>
                        <th className="font-semibold px-3 py-2 text-right">Jumlah Dipakai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pengadaanFiltered.map((r) => {
                        const id = `pengadaan-${r.id_pengadaan}`
                        const checked = isChecked(id)
                        return (
                          <tr
                            key={id}
                            onClick={() => togglePengadaan(r)}
                            className={`cursor-pointer transition-colors ${checked ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                          >
                            <td className="px-3 py-2 text-center">
                              <div className={`h-5 w-5 rounded flex items-center justify-center border-2 mx-auto transition-colors ${checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                                {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{r.nama_barang}</p>
                              {r.kode_fikasi && <p className="font-mono text-[9px] text-slate-400 mt-0.5">{r.kode_fikasi}</p>}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.jumlah_barang)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-400">{fmt(r.jumlah_maksimum)}</td>
                            <td className="px-3 py-2 text-right text-slate-500 dark:text-slate-400">{r.satuan || "-"}</td>
                            <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              {checked ? (
                                <input
                                  type="number"
                                  min={0}
                                  max={pengadaanCap(r)}
                                  value={selected.get(id)?.jumlah ?? 0}
                                  onChange={(e) => updateSelectedItem(id, { jumlah: Number(e.target.value) || 0 }, pengadaanCap(r))}
                                  className="w-24 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                                />
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "pemeliharaan" && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Klik baris untuk mencentang — <b>Jumlah Sejenis + Kondisi</b> (barang yang sudah dimiliki)
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Memuat data RKBMD...
                </div>
              ) : pemeliharaanFiltered.length === 0 ? (
                <EmptyState label="Tidak ada data RKBMD Pemeliharaan untuk sub kegiatan ini. Isi manual pada form." />
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <tr className="text-[10px] uppercase text-slate-400">
                        <th className="font-semibold px-3 py-2 text-center w-10">✓</th>
                        <th className="font-semibold px-3 py-2 text-left min-w-[180px]">Nama Barang</th>
                        <th className="font-semibold px-3 py-2 text-right">Baik</th>
                        <th className="font-semibold px-3 py-2 text-right">RR</th>
                        <th className="font-semibold px-3 py-2 text-right">RB</th>
                        <th className="font-semibold px-3 py-2 text-right">Jml Sejenis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pemeliharaanFiltered.map((r) => {
                        const id = `pemeliharaan-${r.id_pemeliharaan}`
                        const checked = isChecked(id)
                        const sel = selected.get(id)
                        return (
                          <tr
                            key={id}
                            onClick={() => togglePemeliharaan(r)}
                            className={`cursor-pointer transition-colors ${checked ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                          >
                            <td className="px-3 py-2 text-center">
                              <div className={`h-5 w-5 rounded flex items-center justify-center border-2 mx-auto transition-colors ${checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                                {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <p className="font-medium text-slate-800 dark:text-slate-200 text-[11px]">{r.nama_barang}</p>
                              {r.kode_fikasi && <p className="font-mono text-[9px] text-slate-400 mt-0.5">{r.kode_fikasi}</p>}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_b)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_rr)}</td>
                            <td className="px-3 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{fmt(r.kondisi_rb)}</td>
                            <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              {checked ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={pemeliharaanCap(r)}
                                    value={sel?.jumlah ?? 0}
                                    onChange={(e) => updateSelectedItem(id, { jumlah: Number(e.target.value) || 0 }, pemeliharaanCap(r))}
                                    className="w-20 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                                  />
                                  <span className="text-[10px] text-slate-400">{r.satuan || ""}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-700">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {Array.from(selected.values()).filter((s) => s.sumber === "pemeliharaan").length > 0 && (
                    <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-3 gap-3">
                      {(["kondisi_b", "kondisi_rr", "kondisi_rb"] as const).map((k) => (
                        <label key={k} className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {k === "kondisi_b" ? "Kondisi Baik" : k === "kondisi_rr" ? "Rusak Ringan" : "Rusak Berat"}
                          <input
                            type="number"
                            min={0}
                            value={Array.from(selected.values()).reduce((s, it) => s + (it.sumber === "pemeliharaan" ? (it[k] ?? 0) : 0), 0) || ""}
                            onChange={(e) => {
                              const v = Math.max(0, Number(e.target.value) || 0)
                              setSelected((prev) => {
                                const next = new Map(prev)
                                next.forEach((it, key) => {
                                  if (it.sumber === "pemeliharaan") next.set(key, { ...it, [k]: v })
                                })
                                return next
                              })
                            }}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-[11px] font-mono text-right focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[10px] text-slate-400">
            {selected.size} item dipilih • Total: <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">{fmt(totalUnit)} unit</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Konfirmasi Pemilihan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-xs text-slate-400 max-w-sm">{label}</p>
    </div>
  )
}
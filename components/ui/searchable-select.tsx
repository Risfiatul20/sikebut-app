"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Search, ChevronDown, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchableSelectOption {
  value: string
  label: string
  group?: string
  disabled?: boolean
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  id?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan",
  disabled = false,
  loading = false,
  className,
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label || "",
    [options, value]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase().trim()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        o.group?.toLowerCase().includes(q)
    )
  }, [options, search])

  const grouped = useMemo(() => {
    const map = new Map<string, SearchableSelectOption[]>()
    filtered.forEach((opt) => {
      const g = opt.group || ""
      const arr = map.get(g)
      if (arr) arr.push(opt)
      else map.set(g, [opt])
    })
    return map
  }, [filtered])

  const open = useCallback(() => {
    if (disabled || loading) return
    setIsOpen(true)
    setSearch("")
    setHighlightedIndex(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [disabled, loading])

  const close = useCallback(() => {
    setIsOpen(false)
    setSearch("")
    setHighlightedIndex(0)
  }, [])

  const selectOption = useCallback(
    (val: string) => {
      onChange(val === value ? "" : val)
      close()
    },
    [onChange, value, close]
  )

  // Click outside
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen, close])

  // Keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault()
          open()
        }
        return
      }
      switch (e.key) {
        case "Escape":
          e.preventDefault()
          close()
          break
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((i) => Math.max(i - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (filtered[highlightedIndex]) {
            selectOption(filtered[highlightedIndex].value)
          }
          break
        case "Backspace":
          if (search === "" && value) {
            onChange("")
          }
          break
      }
    },
    [isOpen, filtered, highlightedIndex, open, close, selectOption, search, value, onChange]
  )

  // Scroll highlighted into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return
    const item = listRef.current.children[highlightedIndex] as HTMLElement
    if (item) item.scrollIntoView({ block: "nearest" })
  }, [isOpen, highlightedIndex])

  const showGroupHeaders = grouped.size > 1 || (grouped.size === 1 && grouped.keys().next().value !== "")

  return (
    <div ref={wrapperRef} className={cn("relative", className)} id={id}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        className={cn(
          "w-full h-8 px-2.5 pr-8 rounded-lg border text-left text-xs transition-colors flex items-center gap-2",
          "bg-white dark:bg-slate-950",
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed",
          !selectedLabel && "text-slate-400"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 shrink-0" />
        ) : (
          <span className="truncate flex-1">{selectedLabel || placeholder}</span>
        )}
        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.stopPropagation()
                onChange("")
              }
            }}
            className="h-4 w-4 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setHighlightedIndex(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full h-7 pl-7 pr-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Options list */}
          <div ref={listRef} className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            {loading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">{emptyText}</div>
            ) : (
              Array.from(grouped.entries()).map(([group, items]) => (
                <div key={group || "_default"}>
                  {showGroupHeaders && group && (
                    <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                      {group}
                    </div>
                  )}
                  {items.map((opt) => {
                    const idx = filtered.indexOf(opt)
                    const isHighlighted = idx === highlightedIndex
                    const isSelected = opt.value === value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => selectOption(opt.value)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors",
                          opt.disabled && "opacity-40 cursor-not-allowed",
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold"
                            : isHighlighted
                              ? "bg-slate-100 dark:bg-slate-800"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

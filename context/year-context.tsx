"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface YearContextType {
  year: number
  setYear: (year: number) => void
  availableYears: number[]
}

const START_YEAR = 2026

function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear()
  const endYear = Math.max(START_YEAR, currentYear + 1)
  const years: number[] = []
  for (let y = START_YEAR; y <= endYear; y++) {
    years.push(y)
  }
  return years
}

function getInitialYear(available: number[]): number {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)sikebut_year=([^;]+)/)
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10)
      if (available.includes(parsed)) return parsed
    }
  }

  const currentYear = new Date().getFullYear()
  if (available.includes(currentYear)) return currentYear
  return available[0] ?? START_YEAR
}

const YearContext = createContext<YearContextType | undefined>(undefined)

export function YearProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const availableYears = getAvailableYears()
  const [year, setYearState] = useState<number>(() => getInitialYear(availableYears))

  useEffect(() => {
    document.cookie = `sikebut_year=${year}; path=/; max-age=31536000; SameSite=Lax`
  }, [year])

  const setYear = (newYear: number) => {
    setYearState(newYear)
    document.cookie = `sikebut_year=${newYear}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <YearContext.Provider value={{ year, setYear, availableYears }}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  const context = useContext(YearContext)
  if (!context) {
    throw new Error("useYear must be used within a YearProvider")
  }
  return context
}

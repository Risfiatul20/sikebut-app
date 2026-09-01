"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
      title="Mode gelap/terang"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="h-4 w-4 hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}

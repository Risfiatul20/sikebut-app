"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
      title="Keluar"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Keluar</span>
    </button>
  )
}

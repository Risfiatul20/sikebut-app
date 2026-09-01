"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)
    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      })
      if (result?.error) {
        setServerError("Username atau password salah.")
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      setServerError("Username atau password salah.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cegah submit native (GET) — selalu tangani manual via fetch/Auth.js
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void handleSubmit(onSubmit)(e)
  }

  return (
    <form onSubmit={handleFormSubmit} method="post" action="" className="space-y-4" noValidate>
      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
          Username
        </label>
        <div className="relative">
          <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="admin.opd"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            {...register("username")}
            aria-invalid={!!errors.username}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Kata Sandi
          </label>
          <a href="#" className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
            Lupa sandi?
          </a>
        </div>
        <div className="relative">
          <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-10 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Tampilkan sandi"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember + role */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/40 bg-white dark:bg-slate-900"
          />
          Ingat saya
        </label>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Sesi aman
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2.5 shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        <LogIn className="h-4 w-4" /> {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  )
}

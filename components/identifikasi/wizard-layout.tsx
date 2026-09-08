"use client"

import { ReactNode } from "react"
import { Check, Circle, ChevronLeft, ChevronRight, Save, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WizardStep {
  id: number
  label: string
  description: string
}

interface WizardLayoutProps {
  steps: WizardStep[]
  currentStep: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  /** Klik "Ajukan Langsung" — simpan sekaligus kirim ke Verifikator (status Diajukan). */
  onSubmitDirect?: () => void
  children: ReactNode
  isLastStep: boolean
  totalPagu: number
  isDisabled?: boolean
}

export function WizardLayout({ steps, currentStep, onPrev, onNext, onSubmit, onSubmitDirect, children, isLastStep, totalPagu, isDisabled = false }: WizardLayoutProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const formatRupiah = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v)

  return (
    <div className="flex flex-col lg:flex-row gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs overflow-hidden min-h-[600px]">
      {/* Step Indicator Sidebar */}
      <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Langkah Identifikasi</p>
        <div className="relative">
          <div className="absolute left-3.5 top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-1">
            {steps.map((step, i) => {
              const isActive = i === currentStep
              const isCompleted = i < currentStep
              return (
                <div key={step.id} className={cn("relative flex items-start gap-3 px-2 py-2 rounded-lg transition-colors", isActive && "bg-blue-50 dark:bg-blue-500/10")}>
                  <div className={cn("relative z-10 mt-0.5 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border-2 transition-colors", isCompleted ? "bg-emerald-600 border-emerald-600 text-white" : isActive ? "bg-blue-600 border-blue-600 text-white animate-pulse" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400")}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : isActive ? <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20" /> : <Circle className="h-3 w-3" />}
                    {isCompleted || isActive ? null : <span>{i + 1}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[11px] font-semibold leading-tight", isActive ? "text-blue-700 dark:text-blue-300" : isCompleted ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400")}>{step.label}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Progres</span>
            <span className="font-mono font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {totalPagu > 0 && (
            <div className="mt-3 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Estimasi Total Pagu</p>
              <p className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 mt-0.5">{formatRupiah(totalPagu)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-5 lg:p-6 custom-scrollbar">
          {children}
        </div>
        {/* Navigation Footer */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button type="button" onClick={onPrev} disabled={currentStep === 0 || isDisabled} className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
          </button>
          <div className="text-[10px] font-mono text-slate-400">Langkah {currentStep + 1} / {steps.length}</div>
          {isLastStep ? (
            <div className="flex items-center gap-2">
              <button type="button" onClick={onSubmit} disabled={isDisabled} className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors">
                <Save className="h-3.5 w-3.5" /> Simpan sebagai Draft
              </button>
              {onSubmitDirect && (
                <button type="button" onClick={onSubmitDirect} disabled={isDisabled} className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors">
                  <Send className="h-3.5 w-3.5" /> Ajukan Langsung
                </button>
              )}
            </div>
          ) : (
            <button type="button" onClick={onNext} disabled={isDisabled} className="h-8 px-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors">
              Langkah Berikutnya <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

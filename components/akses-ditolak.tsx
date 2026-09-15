import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Tampilan baku saat peran pengguna tidak berwenang membuka sebuah halaman.
 *
 * Dipakai oleh `layout.tsx` sisi server pada folder halaman terbatas
 * (`/dashboard/users`, `/dashboard/wa-gateway`, `/dashboard/sipd/import`)
 * sehingga pembatasan tidak hanya mengandalkan menu sidebar — URL yang
 * diketik langsung pun tetap tertutup.
 */
export function AksesDitolak({ fitur, role }: { fitur: string; role?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Card className="max-w-lg w-full border-slate-200 dark:border-slate-800 shadow-2xs">
        <CardHeader className="items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2">
            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-base">Akses Ditolak</CardTitle>
          <CardDescription className="text-xs">
            Halaman <span className="font-semibold text-slate-700 dark:text-slate-300">{fitur}</span> tidak
            tersedia untuk peran Anda
            {role ? (
              <>
                {" "}
                (<span className="font-mono">{role}</span>)
              </>
            ) : null}
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            Hubungi Administrator bila Anda memang memerlukan akses ke fitur ini.
          </p>
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

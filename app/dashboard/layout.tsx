import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none -z-10"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

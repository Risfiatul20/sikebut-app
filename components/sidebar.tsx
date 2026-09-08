"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FileText, 
  ChevronDown,
  Landmark,
  Database,
  PieChart,
  Map
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/usePermission"

type MenuItem = {
  title: string
  href?: string
  icon: React.ElementType
  subItems?: { title: string; href: string }[]
}

type MenuCategory = {
  label: string
  items: MenuItem[]
}

const menuCategories: MenuCategory[] = [
  {
    label: "Menu Utama",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Identifikasi Kebutuhan",
        icon: FileText,
        subItems: [
          { title: "Daftar Usulan", href: "/dashboard/identifikasi/data" },
          { title: "Buat Usulan Baru", href: "/dashboard/identifikasi" },
          ],
      },
    ],
  },
  {
    label: "Data Referensi",
    items: [
      {
        title: "Referensi SIPD",
        icon: Database,
        subItems: [
          { title: "Import Data", href: "/dashboard/sipd/import" },
          { title: "Kode Akun", href: "/dashboard/sipd/kode-akun" },
        ],
      },
      {
        title: "Referensi RKBMD",
        icon: Database,
        subItems: [
          { title: "RKBMD Pengadaan", href: "/dashboard/rkbmd/pengadaan" },
          { title: "RKBMD Pemeliharaan", href: "/dashboard/rkbmd/pemeliharaan" },
        ],
      },
      {
        title: "Wilayah",
        href: "/dashboard/referensi/wilayah",
        icon: Map
      },
    ],
  },
  {
    label: "Laporan",
    items: [
      { title: "Rekap", href: "/dashboard/laporan/rekap", icon: PieChart },
      { title: "Penyedia", href: "/dashboard/laporan/penyedia", icon: FileText },
      { title: "Swakelola", href: "/dashboard/laporan/swakelola", icon: FileText },
      { title: "BA Pembahasan Penyedia", href: "/dashboard/laporan/ba-pembahasan-penyedia", icon: FileText },
      { title: "BA Pembahasan Swakelola", href: "/dashboard/laporan/ba-pembahasan-swakelola", icon: FileText },
      { title: "BA Catatan RKBMD Pengadaan", href: "/dashboard/laporan/ba-rkbmd-pengadaan", icon: FileText },
      { title: "BA Catatan RKBMD Pemeliharaan", href: "/dashboard/laporan/ba-rkbmd-pemeliharaan", icon: FileText },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      {
        title: "Manajemen Pengguna",
        icon: Users,
        subItems: [
          { title: "Daftar Pengguna", href: "/dashboard/users" },
          { title: "Mapping PPK ↔ Sub Kegiatan", href: "/dashboard/users/mapping" },
        ],
      },
      {
        title: "Pengaturan Sistem",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { can } = usePermission()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Identifikasi Kebutuhan"])

  const toggleMenu = (title: string) => {
    if (isCollapsed) {
      setIsCollapsed(false)
      setExpandedMenus([title])
      return
    }
    setExpandedMenus(prev => 
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      className="relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-10 shrink-0"
    >
      {/* Brand Header */}
      <div className="flex items-center h-14 px-4 border-b border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
        <div className="flex items-center gap-2.5 min-w-max">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Landmark className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="leading-tight whitespace-nowrap"
            >
              <p className="font-display font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Sikebut PBJ</p>
              <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400">Pemerintah Daerah</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="space-y-6">
          {menuCategories.map((category, catIndex) => (
            <div key={category.label} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {category.label}
                </div>
              ) : (
                catIndex > 0 && <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2 my-2" />
              )}
              
              <div className="space-y-1">
                {category.items.map((item) => {
                  if (item.title === "Manajemen Pengguna" && !can("user:manage")) {
                    return null
                  }
                  const visibleSubItems = item.subItems?.filter(
                    (sub) => sub.title !== "Buat Usulan Baru" || can("paket:create")
                  )
                  const isActive = item.href === pathname || visibleSubItems?.some(sub => sub.href === pathname)
                  const isExpanded = expandedMenus.includes(item.title)
                  
                  return (
                    <div key={item.title}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-xs font-medium group",
                            isActive 
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                          )}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400")} />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
                        </Link>
                      ) : (
                        <div>
                          <button
                            onClick={() => toggleMenu(item.title)}
                            className={cn(
                              "w-full flex items-center justify-between px-2 py-2 rounded-md transition-colors text-xs font-medium group",
                              isActive && !isExpanded
                                ? "bg-slate-50 text-slate-900 dark:bg-slate-800/50 dark:text-slate-200" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            )}
                            title={isCollapsed ? item.title : undefined}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400")} />
                              {!isCollapsed && <span className="whitespace-nowrap">{item.title}</span>}
                            </div>
                            {!isCollapsed && (
                              <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200", isExpanded && "rotate-180")} />
                            )}
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isExpanded && !isCollapsed && visibleSubItems && visibleSubItems.length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="pt-1 pb-1 pl-9 pr-2 space-y-1">
                                  {visibleSubItems.map(sub => {
                                    const isSubActive = pathname === sub.href
                                    return (
                                      <Link
                                        key={sub.title}
                                        href={sub.href}
                                        className={cn(
                                          "block px-2 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-colors relative before:absolute before:left-[-11px] before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:rounded-full",
                                          isSubActive 
                                            ? "text-blue-700 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-500/10 before:bg-blue-600 dark:before:bg-blue-400" 
                                            : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 before:bg-transparent"
                                        )}
                                      >
                                        {sub.title}
                                      </Link>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center h-8 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  )
}

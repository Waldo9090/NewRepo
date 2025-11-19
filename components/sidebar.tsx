"use client"
import { BarChart3, ChevronRight, Activity, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: Activity, label: "Overview", href: "/dashboard" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Target, label: "Roger Campaigns", href: "/roger-campaigns" },
    { icon: Target, label: "PRUSA Campaigns", href: "/prusa-campaigns" },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div>
          <div className="font-semibold text-xl text-slate-800 tracking-tight">Candytrail</div>
          <div className="text-xs text-slate-500 mt-1 font-medium tracking-wide">ANALYTICS</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-slate-100 text-slate-800 border border-slate-200 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm",
                )}
              >
                <div className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-slate-700" : "text-slate-500"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {(item.label === "Analytics" || item.label === "Roger Campaigns" || item.label === "PRUSA Campaigns") && (
                  <ChevronRight className={cn(
                    "w-4 h-4 ml-auto transition-colors",
                    isActive ? "text-indigo-500" : "text-slate-400"
                  )} />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
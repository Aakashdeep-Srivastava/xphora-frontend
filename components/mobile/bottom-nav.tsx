"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, MapPin, Camera, Bell, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function BottomNav({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { requireAuth } = useAuth()

  // All tabs are now accessible - requireAuth just shows prompt but allows access
  const handleTabClick = (path: string, action?: string) => {
    if (action) {
      requireAuth(action) // This will show prompt but still allow access
    }
    router.push(path)
  }

  const tabs = [
    { id: "dashboard", label: "Home", icon: Home, path: "/dashboard" },
    { id: "map", label: "Map", icon: MapPin, path: "/map" },
    { id: "report", label: "Report", icon: Camera, path: "/report", accent: true, action: "submit_report" },
    { id: "alerts", label: "Alerts", icon: Bell, path: "/alerts", action: "view_alerts" },
    { id: "insights", label: "Insights", icon: TrendingUp, path: "/insights", action: "view_insights" },
  ]

  return (
    <header
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur-sm",
        "pb-safe-bottom z-50",
        className,
      )}
    >
      <nav className="flex items-center h-full px-4">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isActive =
            (pathname === "/" && tab.path === "/dashboard") || (pathname !== "/" && pathname.startsWith(tab.path))
          const isAccent = tab.accent

          const onClick = () => handleTabClick(tab.path, tab.action)

          if (isAccent) {
            return (
              <div key={tab.id} className="flex-1 flex justify-center">
                <button
                  onClick={onClick}
                  className={cn(
                    "px-6 h-12 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105",
                    "bg-primary text-primary-foreground",
                  )}
                  aria-label={tab.label}
                >
                  <Icon size={20} />
                  <span className="font-bold text-sm">{tab.label}</span>
                </button>
              </div>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={onClick}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              aria-label={tab.label}
            >
              <Icon size={24} className="mb-1" />
              <span className={cn("text-xs font-medium", isActive ? "font-bold" : "font-normal")}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </header>
  )
}

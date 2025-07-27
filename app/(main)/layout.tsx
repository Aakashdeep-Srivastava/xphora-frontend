import type React from "react"
import { BottomNav } from "@/components/mobile/bottom-nav"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { AuthStatusBanner } from "@/components/auth/auth-status-banner"

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col">
      <MobileHeader />
      <main className="flex-1">
        <div className="p-4 pt-0">
          <AuthStatusBanner />
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

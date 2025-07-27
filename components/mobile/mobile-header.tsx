"use client"

import { useState } from "react"
import { Menu, IndianRupee, User, ChevronDown } from "lucide-react"
import { useLocation } from "@/contexts/location-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "./app-sidebar"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LocationEditModal } from "./location-edit-modal"

export function MobileHeader() {
  const { district, city, isLoading, error } = useLocation()
  const { authState, requireAuth } = useAuth()
  const router = useRouter()
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const handleFinancialPulseClick = () => {
    if (requireAuth("view_financial_pulse", "/financial-pulse")) {
      router.push("/financial-pulse")
    }
  }

  const getLocationDisplay = () => {
    if (isLoading) return { main: "Locating...", sub: "Fetching position..." }
    if (error) return { main: "Location Error", sub: "Could not get location" }
    return { main: district || "Unknown Area", sub: city || "Bengaluru" }
  }

  const locationDisplay = getLocationDisplay()

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background pt-safe-top">
        <div className="container flex h-16 items-center">
          <div className="flex-1 justify-self-start">
            <AppSidebar>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </AppSidebar>
          </div>

          <div className="flex-1 text-center">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-lg leading-tight">{locationDisplay.main}</h1>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{locationDisplay.sub}</p>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFinancialPulseClick}>
              <IndianRupee className="h-6 w-6" />
            </Button>
            <AppSidebar>
              <Button variant="ghost" size="icon" className="rounded-full">
                {authState.mode === "authenticated" ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={authState.user?.photoURL || ""} alt={authState.user?.displayName || ""} />
                    <AvatarFallback>{authState.user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-6 w-6" />
                )}
              </Button>
            </AppSidebar>
          </div>
        </div>
      </header>
      <LocationEditModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </>
  )
}

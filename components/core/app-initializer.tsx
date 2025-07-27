"use client"

import { useState, useEffect } from "react"
import { useLocation } from "@/contexts/location-context"
import WelcomeScreen from "@/components/onboarding/welcome-screen"
import LoadingAnimation from "@/components/core/loading-animation"
import { useRouter } from "next/navigation"

export default function AppInitializer() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null)
  const { requestLocation } = useLocation()
  const router = useRouter()

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding")
    if (hasCompletedOnboarding) {
      setIsFirstTime(false)
      // On subsequent visits, show animation for 2s then navigate.
      // Location is fetched in the background by the provider.
      const timer = setTimeout(() => {
        router.replace("/dashboard")
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setIsFirstTime(true)
    }
  }, [router])

  const handleGetStarted = () => {
    localStorage.setItem("hasCompletedOnboarding", "true")
    requestLocation() // Manually trigger location request on first-time use
    setIsFirstTime(false) // This will trigger the loading animation screen
    const timer = setTimeout(() => {
      router.replace("/dashboard")
    }, 2000) // Give time for animation and location fetch
    return () => clearTimeout(timer)
  }

  if (isFirstTime === true) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />
  }

  // This screen is shown for both first-time (after clicking get started) and subsequent visits
  return <LoadingAnimation />
}

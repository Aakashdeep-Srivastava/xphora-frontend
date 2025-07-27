"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Info, RefreshCw, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useState, useEffect } from "react"

export function AuthStatusBanner() {
  const { isConfigValid, authState, retryAuth, isLoading } = useAuth()
  const [showBanner, setShowBanner] = useState(false)
  const [bannerType, setBannerType] = useState<"demo" | "retry" | "success">("demo")

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isConfigValid) {
        setShowBanner(true)
        setBannerType("demo")
      } else if (authState.mode === "authenticated") {
        setShowBanner(true)
        setBannerType("success")
        // Hide success banner after 5 seconds
        setTimeout(() => setShowBanner(false), 5000)
      } else {
        setShowBanner(false)
      }
    }
  }, [isConfigValid, authState.mode])

  if (!showBanner) return null

  // Success banner for authenticated users
  if (bannerType === "success") {
    return (
      <Card className="border-green-200 bg-green-50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Google OAuth Active</p>
                <p className="text-sm text-green-700">All premium features unlocked! Your data syncs across devices.</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-green-700 hover:bg-green-100"
            >
              ✕
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Demo mode banner
  return (
    <Card className="border-blue-200 bg-blue-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Demo Mode - All Features Available</p>
              <p className="text-sm text-blue-700">
                Sign in with Google anytime to sync your data and preferences across devices.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isConfigValid && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryAuth}
                disabled={isLoading}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Retry Auth
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent flex-shrink-0"
            >
              <Link href="/setup">
                <ExternalLink className="h-4 w-4 mr-1" />
                Setup Guide
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

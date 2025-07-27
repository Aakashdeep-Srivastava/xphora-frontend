import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { LocationProvider } from "@/contexts/location-context"
import { config, validateConfig } from "@/lib/config"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

// Validate configuration on app start (server-side only)
if (typeof window === "undefined") {
  try {
    validateConfig()
  } catch (error) {
    console.error("Configuration validation failed:", error)
  }
}

export const metadata: Metadata = {
  title: {
    default: config.app.name,
    template: `%s | ${config.app.name}`,
  },
  description: config.app.description,
  keywords: ["city intelligence", "bengaluru", "real-time", "traffic", "weather", "incidents"],
  authors: [{ name: "XphoraPulse Team" }],
  creator: "XphoraPulse",
  publisher: "XphoraPulse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: config.app.name,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: config.app.url,
    title: config.app.name,
    description: config.app.description,
    siteName: config.app.name,
  },
  twitter: {
    card: "summary_large_image",
    title: config.app.name,
    description: config.app.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#87ECE8" },
    { media: "(prefers-color-scheme: dark)", color: "#87ECE8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={cn("bg-background font-sans antialiased", inter.className)}>
        <ErrorBoundary>
          <LocationProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </LocationProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

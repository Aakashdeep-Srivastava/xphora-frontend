"use client"

import type React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { User, Settings, Star, LayoutGrid, HelpCircle, LogOut, UserPlus } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { authState, user, signIn, signOut, requireAuth, isLoading } = useAuth()

  const menuItems = [
    {
      label: "Manage Account",
      icon: User,
      action: () => requireAuth("manage_account", "/profile"),
      authRequired: true,
    },
    { label: "Settings", icon: Settings, action: () => requireAuth("app_settings", "/settings"), authRequired: true },
    { label: "Favorites", icon: Star, action: () => requireAuth("view_favorites", "/favorites"), authRequired: true },
    {
      label: "Widget Setup",
      icon: LayoutGrid,
      action: () => requireAuth("setup_widgets", "/widgets"),
      authRequired: true,
    },
    { label: "Help & Support", icon: HelpCircle, action: () => {}, authRequired: false },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {authState.mode === "authenticated" ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold">{user?.displayName}</p>
                  <p className="text-xs text-muted-foreground">Citizen Reporter</p>
                </div>
              </div>
            ) : (
              "Menu"
            )}
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="flex-1">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => {
              if (item.authRequired && authState.mode === "anonymous") return null
              return (
                <Button key={item.label} variant="ghost" className="justify-start gap-3" onClick={item.action}>
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>
        <SheetFooter>
          {authState.mode === "authenticated" ? (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 bg-transparent"
              onClick={signOut}
              disabled={isLoading}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <div className="w-full space-y-2">
              <Button className="w-full justify-center gap-3" onClick={signIn} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="h-5 w-5" />
                    <span>Sign In with Google</span>
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full justify-center gap-3" onClick={signIn} disabled={isLoading}>
                <UserPlus className="h-5 w-5" />
                <span>Create Account</span>
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

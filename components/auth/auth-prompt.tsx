"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import type { AuthPromptConfig } from "@/types/auth"

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

interface AuthPromptProps {
  isOpen: boolean
  onClose: () => void
  config: AuthPromptConfig
  onSignIn: () => Promise<void>
  isLoading?: boolean
}

export function AuthPrompt({ isOpen, onClose, config, onSignIn, isLoading = false }: AuthPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">{config.title}</DialogTitle>
          <DialogDescription className="text-center pt-2">{config.message}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-medium text-sm mb-2">By signing in, you can:</h4>
          <ul className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <Button onClick={onSignIn} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full" disabled={isLoading}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

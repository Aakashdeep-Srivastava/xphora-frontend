"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

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

export function FirebaseSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const { toast } = useToast()

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const setupSteps = [
    {
      title: "Create Firebase Project",
      description: "Go to Firebase Console and create a new project",
      action: "https://console.firebase.google.com/",
      buttonText: "Open Firebase Console",
    },
    {
      title: "Enable Authentication",
      description: "In your Firebase project, go to Authentication > Sign-in method",
      details: "Enable Google as a sign-in provider and configure OAuth consent screen",
    },
    {
      title: "Configure Google OAuth Client",
      description: "Use your OAuth client credentials in Firebase Google provider",
      details: "Client ID: 14008380219-anv3mffil9pg5i7tiiu0iqsmnci1rsar.apps.googleusercontent.com",
      code: "14008380219-anv3mffil9pg5i7tiiu0iqsmnci1rsar.apps.googleusercontent.com",
    },
    {
      title: "Add Client Secret to Firebase",
      description: "In Firebase Authentication > Sign-in method > Google",
      details: "Add your OAuth client secret from the configuration file",
      code: "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",
    },
    {
      title: "Add Web App",
      description: "In Project Settings, add a new web app",
      details: "Register your app and copy the configuration",
    },
    {
      title: "Set Environment Variables",
      description: "Add these to your .env.local file:",
      code: `NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GOOGLE_OAUTH_CLIENT_SECRET=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`,
    },
    {
      title: "Configure Authorized Domains",
      description: "Add authorized domains in both Firebase and Google Cloud Console",
      details:
        "Add your domain (localhost:3000 for development, your production domain for live) in both Firebase Authentication settings and Google Cloud Console OAuth consent screen",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            OAuth Client Configuration Loaded Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Your OAuth client configuration has been loaded from the JSON file. Now complete the Firebase setup:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-green-200">
              <GoogleIcon className="h-5 w-5" />
              <div>
                <span className="font-medium text-green-800 text-sm">Client ID</span>
                <p className="text-xs text-green-600">
                  14008380219-anv3mffil9pg5i7tiiu0iqsmnci1rsar.apps.googleusercontent.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white/60 rounded-lg border border-green-200">
              <span className="font-medium text-green-800 text-sm">Project ID</span>
              <p className="text-xs text-green-600">studious-pulsar-467012-d7</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {setupSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">{step.description}</p>

              {step.details && <p className="text-sm bg-muted p-3 rounded-lg">{step.details}</p>}

              {step.code && (
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{step.code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => copyToClipboard(step.code!, index)}
                  >
                    {copiedStep === index ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {step.action && (
                <Button asChild className="w-full sm:w-auto">
                  <a href={step.action} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {step.buttonText}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Ready to Test</span>
          </div>
          <div className="space-y-2">
            <p className="text-blue-700 text-sm">
              Once you've completed these steps, restart your development server and test the Google OAuth login.
            </p>
            <div className="flex items-center gap-2 p-2 bg-white/60 rounded border border-blue-200">
              <GoogleIcon className="h-4 w-4" />
              <span className="text-sm font-medium text-blue-700">
                Direct Google OAuth login with your client credentials
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

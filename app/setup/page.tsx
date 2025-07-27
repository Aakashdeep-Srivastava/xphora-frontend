import { FirebaseSetupGuide } from "@/components/auth/firebase-setup-guide"
import { OAuthDebugPanel } from "@/components/auth/oauth-debug"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">XphoraPulse Setup</h1>
          <p className="text-muted-foreground">Configure Firebase and OAuth to enable all features</p>
        </div>

        <div className="space-y-8">
          <OAuthDebugPanel />
          <FirebaseSetupGuide />
        </div>
      </div>
    </div>
  )
}

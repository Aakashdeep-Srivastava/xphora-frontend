"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { OAUTH_CONFIG, validateOAuthConfig, getOAuthDebugInfo, generateOAuthUrl } from "@/lib/oauth-config"

export function OAuthDebugPanel() {
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()
  const debugInfo = getOAuthDebugInfo()
  const isValid = validateOAuthConfig()

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const testOAuthUrl = generateOAuthUrl("test-state")

  return (
    <Card className={`border-2 ${isValid ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          )}
          OAuth Configuration Status
          <Badge variant={isValid ? "default" : "destructive"}>{isValid ? "Valid" : "Invalid"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Client ID</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-xs break-all">{OAUTH_CONFIG.clientId}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(OAUTH_CONFIG.clientId, "Client ID")}>
                {copied === "Client ID" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Project ID</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-gray-100 rounded text-xs">{OAUTH_CONFIG.projectId}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(OAUTH_CONFIG.projectId, "Project ID")}>
                {copied === "Project ID" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Redirect URI</label>
          <code className="block p-2 bg-gray-100 rounded text-xs mt-1">
            {debugInfo.redirectUri || "Not available (server-side)"}
          </code>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">OAuth Endpoints</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-xs text-gray-600">Auth URI:</span>
              <code className="block p-2 bg-gray-100 rounded text-xs">{OAUTH_CONFIG.authUri}</code>
            </div>
            <div>
              <span className="text-xs text-gray-600">Token URI:</span>
              <code className="block p-2 bg-gray-100 rounded text-xs">{OAUTH_CONFIG.tokenUri}</code>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Scopes</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {OAUTH_CONFIG.scopes.map((scope) => (
              <Badge key={scope} variant="outline" className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">OAuth Test URL:</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-white rounded text-xs break-all">{testOAuthUrl}</code>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(testOAuthUrl, "OAuth URL")}>
              {copied === "OAuth URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={testOAuthUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Next Steps:</h4>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. ✅ OAuth client configuration loaded successfully</li>
            <li>2. Add client secret (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) to Firebase Console</li>
            <li>3. Configure authorized domains in Google Cloud Console</li>
            <li>4. Test the OAuth flow using Firebase Authentication</li>
          </ol>
        </div>

        {isValid && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Configuration Valid!</span>
            </div>
            <p className="text-sm text-green-700">
              Your OAuth client configuration is properly loaded. The authentication system is ready to use.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

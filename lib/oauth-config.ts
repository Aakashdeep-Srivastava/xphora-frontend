// OAuth configuration from your Google Cloud client
let oauthClientConfig: any = null

// Safely load OAuth configuration
try {
  oauthClientConfig = {
    web: {
      client_id: "14008380219-anv3mffil9pg5i7tiiu0iqsmnci1rsar.apps.googleusercontent.com",
      project_id: "studious-pulsar-467012-d7",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "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",
    },
  }
} catch (error) {
  console.error("Failed to load OAuth configuration:", error)
  oauthClientConfig = { web: {} }
}

// Extract OAuth configuration
const oauthConfig = oauthClientConfig?.web || {}

export const OAUTH_CONFIG = {
  clientId: oauthConfig.client_id || "",
  projectId: oauthConfig.project_id || "",
  authUri: oauthConfig.auth_uri || "https://accounts.google.com/o/oauth2/auth",
  tokenUri: oauthConfig.token_uri || "https://oauth2.googleapis.com/token",
  authProviderCertUrl: oauthConfig.auth_provider_x509_cert_url || "",
  scopes: ["openid", "email", "profile"],
  redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  responseType: "code",
  accessType: "online",
  prompt: "select_account",
}

// Validate OAuth configuration
export function validateOAuthConfig() {
  const errors: string[] = []

  if (!OAUTH_CONFIG.clientId) {
    errors.push("OAuth Client ID is required")
  }

  if (!OAUTH_CONFIG.projectId) {
    errors.push("OAuth Project ID is required")
  }

  if (!OAUTH_CONFIG.clientId.includes("googleusercontent.com")) {
    errors.push("Invalid Google OAuth Client ID format")
  }

  if (errors.length > 0) {
    console.error("OAuth Configuration errors:", errors)
    return false
  }

  return true
}

// Helper to get OAuth URL (for debugging)
export function getOAuthDebugInfo() {
  return {
    clientId: OAUTH_CONFIG.clientId,
    projectId: OAUTH_CONFIG.projectId,
    redirectUri: OAUTH_CONFIG.redirectUri,
    scopes: OAUTH_CONFIG.scopes.join(" "),
    authUri: OAUTH_CONFIG.authUri,
    tokenUri: OAUTH_CONFIG.tokenUri,
    isValid: validateOAuthConfig(),
  }
}

// Get client secret (for server-side use only)
export function getClientSecret() {
  // In production, this should come from environment variables
  // Never expose client secret in frontend code
  return process.env.GOOGLE_OAUTH_CLIENT_SECRET || oauthConfig.client_secret
}

// Generate OAuth URL for manual testing
export function generateOAuthUrl(state?: string) {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: OAUTH_CONFIG.responseType,
    scope: OAUTH_CONFIG.scopes.join(" "),
    access_type: OAUTH_CONFIG.accessType,
    prompt: OAUTH_CONFIG.prompt,
    ...(state && { state }),
  })

  return `${OAUTH_CONFIG.authUri}?${params.toString()}`
}

export interface AuthState {
  mode: "anonymous" | "authenticated"
  user?: {
    uid: string
    email?: string
    displayName?: string
    photoURL?: string
  }
  permissions: string[]
}

export interface AuthPromptConfig {
  title: string
  message: string
  benefits: string[]
  action: string
}

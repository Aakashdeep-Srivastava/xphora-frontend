"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  onAuthStateChanged,
  type User,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { 
  isFirebaseConfigValid, 
  waitForAuth, 
  isFirebaseReady, 
  forceInitializeFirebase,
  signInWithGooglePopup,
  checkRedirectResult
} from "@/lib/firebase"
import { OAUTH_CONFIG } from "@/lib/oauth-config"
import type { AuthState, AuthPromptConfig } from "@/types/auth"
import { AuthPrompt } from "@/components/auth/auth-prompt"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface AuthContextType {
  authState: AuthState
  user: User | null
  requireAuth: (action: string, redirectUrl?: string) => boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isConfigValid: boolean
  isLoading: boolean
  retryAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [authState, setAuthState] = useState<AuthState>({
    mode: "anonymous",
    permissions: [
      "read_public",
      "view_map",
      "view_incidents",
      "submit_reports",
      "manage_subscriptions",
      "view_insights",
      "view_financial_pulse",
      "view_alerts",
    ],
  })
  const [user, setUser] = useState<User | null>(null)
  const [promptConfig, setPromptConfig] = useState<AuthPromptConfig | null>(null)
  const [isPromptOpen, setIsPromptOpen] = useState(false)
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const isConfigValid = isFirebaseConfigValid()

  // Enhanced auth initialization with graceful fallback
  useEffect(() => {
    if (!isConfigValid) {
      console.log("🌐 Running in universal access mode - all features available")
      setAuthState({
        mode: "anonymous",
        permissions: [
          "read_public",
          "view_map",
          "view_incidents",
          "submit_reports",
          "manage_subscriptions",
          "view_insights",
          "view_financial_pulse",
          "view_alerts",
        ],
      })
      setAuthInitialized(true)
      return
    }

    const initializeAuth = async (attempt = 1) => {
      try {
        console.log(`🔐 Auth initialization attempt ${attempt}`)

        // Try to get auth with shorter timeout
        const authInstance = await Promise.race([
          waitForAuth(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 1500)),
        ])

        console.log("✅ Firebase Auth ready, setting up listener")

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
          console.log("🔄 Auth state change:", user ? `User: ${user.displayName}` : "Guest user")

          if (user) {
            setUser(user)
            setAuthState({
              mode: "authenticated",
              user: {
                uid: user.uid,
                email: user.email || undefined,
                displayName: user.displayName || undefined,
                photoURL: user.photoURL || undefined,
              },
              permissions: [
                "read_public",
                "view_map",
                "view_incidents",
                "submit_reports",
                "manage_subscriptions",
                "view_insights",
                "view_financial_pulse",
                "view_alerts",
              ],
            })

            if (authInitialized && !user.isAnonymous) {
              toast({
                title: "🎉 Welcome back!",
                description: `Signed in as ${user.displayName || user.email}`,
                duration: 4000,
              })
            }

            if (postLoginRedirect) {
              router.push(postLoginRedirect)
              setPostLoginRedirect(null)
            }
          } else {
            setUser(null)
            // All users get full access to all features
            setAuthState({
              mode: "anonymous",
              permissions: [
                "read_public",
                "view_map",
                "view_incidents",
                "submit_reports",
                "manage_subscriptions",
                "view_insights",
                "view_financial_pulse",
                "view_alerts",
              ],
            })
          }

          setAuthInitialized(true)
        })

        return unsubscribe
      } catch (error) {
        console.error(`❌ Auth initialization attempt ${attempt} failed:`, error)

        // Retry up to 3 times with exponential backoff
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
          console.log(`⏳ Retrying auth initialization in ${delay}ms...`)

          setTimeout(() => {
            setRetryCount(attempt)
            initializeAuth(attempt + 1)
          }, delay)
          return () => {}
        }

        // After 3 attempts, enable full access mode
        console.log("✅ Enabling full access mode - all features available")

        setAuthState({
          mode: "anonymous",
          permissions: [
            "read_public",
            "view_map",
            "view_incidents",
            "submit_reports",
            "manage_subscriptions",
            "view_insights",
            "view_financial_pulse",
            "view_alerts",
          ],
        })
        setAuthInitialized(true)

        return () => {}
      }
    }

    const unsubscribePromise = initializeAuth()

    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe())
    }
  }, [router, postLoginRedirect, isConfigValid, toast, authInitialized, retryCount])

  // Check for redirect result when component mounts
  useEffect(() => {
    const checkForRedirectResult = async () => {
      if (!isConfigValid) return;
      
      try {
        const result = await checkRedirectResult();
        if (result) {
          console.log("✅ Redirect sign-in completed successfully");
          
          toast({
            title: "🎉 Welcome Back!",
            description: `Successfully signed in as ${result.user.displayName || result.user.email}`,
            duration: 5000,
          });

          // Handle post-login redirect
          if (postLoginRedirect) {
            router.push(postLoginRedirect);
            setPostLoginRedirect(null);
          }
        }
      } catch (error) {
        console.error("❌ Redirect result error:", error);
      }
    };

    checkForRedirectResult();
  }, [isConfigValid, postLoginRedirect, router, toast]);

  // Enhanced sign in with OAuth priority and better error handling
  const signIn = async () => {
    setIsLoading(true);
    
    try {
      console.log("🚀 Starting Google authentication...");
      
      // Prioritize OAuth - use the enhanced popup/redirect function
      const result = await signInWithGooglePopup();
      
      console.log("✅ Google authentication successful:", {
        user: result.user.displayName,
        email: result.user.email,
        uid: result.user.uid,
      });

      // Close any open prompts
      setIsPromptOpen(false);

      // Show success message
      toast({
        title: "🎉 Sign In Successful!",
        description: `Welcome, ${result.user.displayName || result.user.email}!`,
        duration: 4000,
      });

      // If there was a post-login redirect, handle it
      if (postLoginRedirect) {
        router.push(postLoginRedirect);
        setPostLoginRedirect(null);
      }
      
    } catch (error: any) {
      console.error("❌ Sign in error:", error);

      let errorMessage = "Authentication failed. Please try again.";
      let shouldRetry = false;
      let isRedirectInitiated = false;
      let actionButton = null;

      // Handle specific error cases with priority on user experience
      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Sign in was cancelled. You can try again anytime.";
          shouldRetry = true;
          break;
          
        case "auth/popup-blocked":
          errorMessage = "Popup was blocked by your browser. Please allow popups and try again.";
          shouldRetry = true;
          actionButton = (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                toast({
                  title: "Enable Popups",
                  description: "Look for the popup blocked icon in your address bar and click 'Always allow'",
                  duration: 8000,
                });
              }}
            >
              Help
            </Button>
          );
          break;
          
        case "auth/cancelled-popup-request":
          errorMessage = "Multiple sign-in attempts detected. Please wait a moment.";
          shouldRetry = true;
          break;
          
        case "auth/network-request-failed":
          errorMessage = "Network error. Check your internet connection.";
          shouldRetry = true;
          break;
          
        case "auth/unauthorized-domain":
          errorMessage = "This domain is not authorized for Google sign-in.";
          break;
          
        case "auth/operation-not-allowed":
          errorMessage = "Google sign-in is temporarily disabled. Please try again later.";
          break;
          
        case "auth/too-many-requests":
          errorMessage = "Too many sign-in attempts. Please wait a few minutes.";
          break;
          
        default:
          if (error.message?.includes("timeout")) {
            errorMessage = "Sign in timed out. Please check your internet connection.";
            shouldRetry = true;
          } else if (error.message?.includes("redirect-initiated")) {
            errorMessage = "Redirecting to Google for authentication...";
            isRedirectInitiated = true;
          } else if (error.message?.includes("Firebase Auth")) {
            errorMessage = "Authentication service is loading. Please try again.";
            shouldRetry = true;
          }
      }

      // Don't show error toast for redirect
      if (!isRedirectInitiated) {
        toast({
          title: "Authentication Failed",
          description: errorMessage,
          variant: "destructive",
          duration: shouldRetry ? 8000 : 5000,
          action: actionButton || (shouldRetry ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsLoading(false);
                setTimeout(signIn, 1500);
              }}
            >
              Retry
            </Button>
          ) : undefined)
        });
      } else {
        toast({
          title: "🔄 Redirecting...",
          description: "Please complete authentication in the popup window.",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!isFirebaseReady()) {
      // Reset to guest state
      setUser(null)
      setAuthState({
        mode: "anonymous",
        permissions: [
          "read_public",
          "view_map",
          "view_incidents",
          "submit_reports",
          "view_insights",
          "view_financial_pulse",
          "view_alerts",
        ],
      })
      toast({
        title: "👋 Signed Out",
        description: "You can continue using all features as a guest.",
      })
      return
    }

    setIsLoading(true)

    try {
      const auth = await waitForAuth()
      await firebaseSignOut(auth)
      toast({
        title: "👋 Signed Out",
        description: "You can continue using all features as a guest.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      setUser(null)
      setAuthState({
        mode: "anonymous",
        permissions: [
          "read_public",
          "view_map",
          "view_incidents",
          "submit_reports",
          "view_insights",
          "view_financial_pulse",
          "view_alerts",
        ],
      })
      toast({
        title: "👋 Signed Out",
        description: "You can continue using all features as a guest.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Allow all users access to all features, but encourage sign-in for enhanced experience
  const requireAuth = (action: string, redirectUrl?: string) => {
    // Always allow access - no restrictions
    if (authState.mode === "authenticated") {
      return true;
    }

    // For premium features, optionally show sign-in prompt for enhanced experience
    if (["view_financial_pulse", "view_insights", "view_alerts", "submit_report"].includes(action)) {
      // Don't force sign-in, just suggest it occasionally (e.g., 20% of the time)
      if (Math.random() < 0.2) {
        const config = getAuthPromptConfig(action);
        setPromptConfig({
          ...config,
          title: "🚀 Enhanced Experience Available",
          message: "Sign in with Google to sync your preferences and get personalized insights.",
          benefits: [
            "☁️ Sync data across devices", 
            "⚡ Personalized recommendations",
            "📊 Advanced analytics",
            "🔔 Custom notifications"
          ],
        });
        setIsPromptOpen(true);
        
        if (redirectUrl) {
          setPostLoginRedirect(redirectUrl);
        }
      }
      
      // Always return true - full access for everyone
      return true;
    }

    return true; // Allow all actions for all users
  };

  // Retry auth initialization
  const retryAuth = async () => {
    if (!isConfigValid) return

    setIsLoading(true)
    try {
      await forceInitializeFirebase()
      toast({
        title: "🔄 Authentication Ready",
        description: "You can now sign in with Google for enhanced features.",
      })
    } catch (error) {
      toast({
        title: "Connection Issue",
        description: "All features remain available. Sign-in will be available when connection improves.",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        requireAuth,
        signIn,
        signOut,
        isConfigValid,
        isLoading,
        retryAuth,
      }}
    >
      {children}
      {promptConfig && (
        <AuthPrompt
          isOpen={isPromptOpen}
          onClose={() => setIsPromptOpen(false)}
          config={promptConfig}
          onSignIn={signIn}
          isLoading={isLoading}
        />
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Professional auth prompt configs for enhanced experience
const getAuthPromptConfig = (action: string): AuthPromptConfig => {
  switch (action) {
    case "view_financial_pulse":
      return {
        title: "🏦 Enhanced Financial Analytics",
        message: "Sign in for personalized financial insights and market analysis tailored to your interests.",
        benefits: [
          "📊 Personalized market insights", 
          "💰 Custom investment tracking", 
          "🔔 Smart financial alerts"
        ],
        action,
      }
    case "submit_report":
      return {
        title: "📝 Track Your Contributions",
        message: "Sign in to track your community reports and see your impact over time.",
        benefits: [
          "📈 Track report status", 
          "🏆 Community impact score", 
          "🌟 Build your civic profile"
        ],
        action,
      }
    case "view_alerts":
      return {
        title: "🔔 Smart Notifications",
        message: "Sign in for intelligent alerts customized to your location and interests.",
        benefits: [
          "🎯 Location-based alerts", 
          "📍 Custom notification zones", 
          "⚡ Priority updates"
        ],
        action,
      }
    case "view_insights":
      return {
        title: "🧠 AI-Powered Intelligence",
        message: "Sign in to unlock personalized city insights powered by advanced analytics.",
        benefits: [
          "🤖 AI-driven recommendations", 
          "📈 Historical trend analysis", 
          "📊 Personalized dashboards"
        ],
        action,
      }
    default:
      return {
        title: "✨ Enhanced Experience",
        message: "Sign in with Google to unlock personalized features and sync across devices.",
        benefits: [
          "🔄 Cross-device sync", 
          "🎨 Personalized interface", 
          "📝 Track your activity"
        ],
        action,
      }
  }
}
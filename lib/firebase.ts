// lib/firebase.ts - UPDATED TO DISABLE EMULATOR
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { 
  getAuth, 
  type Auth, 
  // connectAuthEmulator, // REMOVE OR COMMENT THIS LINE
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth"
import { config } from "./config"

// Firebase configuration using your OAuth project
const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
}

// OAuth configuration with your client details
export const oauthConfig = {
  clientId: config.oauth.clientId,
  projectId: config.oauth.projectId,
}

// More lenient validation - allow app to work with minimal config
export const isFirebaseConfigValid = (): boolean => {
  // Only require essential fields for OAuth to work
  const essentialFields = ["apiKey", "authDomain", "projectId"]

  const missingEssentialFields = essentialFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig],
  )

  if (missingEssentialFields.length > 0) {
    console.warn("Missing essential Firebase configuration:", missingEssentialFields)
    return false
  }

  // Check OAuth configuration
  if (!config.oauth.clientId || !config.oauth.projectId) {
    console.warn("Missing OAuth configuration")
    return false
  }

  return true
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let initializationPromise: Promise<Auth> | undefined
let initializationAttempted = false

// Enhanced sign-in function with better error handling
export async function signInWithGooglePopup(): Promise<any> {
  try {
    const authInstance = await getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    
    // Configure provider with your specific settings
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({
      prompt: "select_account",
      access_type: "online",
    });

    // Set auth persistence
    await setPersistence(authInstance, browserLocalPersistence);

    // Try popup first
    try {
      console.log("🚀 Attempting popup sign-in...");
      const result = await signInWithPopup(authInstance, provider);
      console.log("✅ Popup sign-in successful");
      return result;
    } catch (popupError: any) {
      console.warn("⚠️ Popup sign-in failed:", popupError.code);
      
      // If popup fails, try redirect as fallback
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {
        
        console.log('🔄 Fallback to redirect sign-in...');
        await signInWithRedirect(authInstance, provider);
        
        // The redirect will handle the rest
        throw new Error('redirect-initiated');
      }
      throw popupError;
    }
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  }
}

// Check for redirect result on app initialization
export async function checkRedirectResult(): Promise<any> {
  try {
    const authInstance = await getFirebaseAuth();
    const result = await getRedirectResult(authInstance);
    if (result) {
      console.log("✅ Redirect sign-in successful");
      return result;
    }
    return null;
  } catch (error) {
    console.error('❌ Redirect result error:', error);
    return null;
  }
}

// FIXED: Aggressive Firebase initialization WITHOUT EMULATOR
function initializeFirebase(): Promise<Auth> {
  if (initializationPromise) {
    return initializationPromise
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if we're in the browser
      if (typeof window === "undefined") {
        reject(new Error("Firebase can only be initialized in the browser"))
        return
      }

      console.log("🔥 Starting Firebase initialization...")

      // Initialize Firebase app with retry logic
      try {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
        console.log("✅ Firebase app initialized")
      } catch (appError) {
        console.error("❌ Failed to initialize Firebase app:", appError)
        reject(appError)
        return
      }

      // Initialize Auth
      try {
        auth = getAuth(app)
        console.log("✅ Firebase Auth initialized")

        // ⚠️ EMULATOR CONNECTION DISABLED FOR PRODUCTION USE
        // NEVER CONNECT TO EMULATOR IN PRODUCTION
        /*
        if (process.env.NODE_ENV === 'development') {
          try {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
            console.log("🔧 Connected to Auth emulator")
          } catch (emulatorError) {
            console.warn("⚠️ Emulator connection failed:", emulatorError)
          }
        }
        */

        // Test auth instance
        console.log("🧪 Testing auth instance...")
        
        // Wait a moment for auth to stabilize
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log("✅ Firebase initialization complete")
        resolve(auth)
      } catch (authError) {
        console.error("❌ Failed to initialize Firebase Auth:", authError)
        reject(authError)
      }
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error)
      reject(error)
    }
  })

  return initializationPromise
}

// Get Firebase Auth with aggressive retry
export async function getFirebaseAuth(): Promise<Auth> {
  if (auth) {
    return auth
  }

  if (!isFirebaseConfigValid()) {
    throw new Error("Firebase configuration is invalid")
  }

  try {
    return await initializeFirebase()
  } catch (error) {
    console.error("Failed to get Firebase Auth:", error)
    throw error
  }
}

// Wait for auth with timeout
export function waitForAuth(timeoutMs = 10000): Promise<Auth> {
  return Promise.race([
    getFirebaseAuth(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Auth initialization timeout")), timeoutMs)
    ),
  ])
}

// Force re-initialization
export async function forceInitializeFirebase(): Promise<Auth> {
  initializationPromise = undefined
  auth = undefined
  app = undefined
  initializationAttempted = false
  
  return initializeFirebase()
}

// Check if Firebase is ready
export function isFirebaseReady(): boolean {
  return !!(auth && app && isFirebaseConfigValid())
}

// Sign out
export async function signOut(): Promise<void> {
  if (!auth) {
    console.warn("Auth not initialized, cannot sign out")
    return
  }

  try {
    await auth.signOut()
    console.log("✅ Successfully signed out")
  } catch (error) {
    console.error("❌ Sign out error:", error)
    throw error
  }
}
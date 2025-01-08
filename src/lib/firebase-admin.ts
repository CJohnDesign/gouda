import { getApps, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import * as admin from 'firebase-admin'

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK can only be used on the server side')
}

function getFirebaseAdminApp(): App {
  // Check if an app has already been initialized
  const apps = getApps()
  if (apps.length > 0) {
    console.log('[Firebase Admin] Reusing existing app')
    return apps[0]
  }

  // Validate environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin] Missing credentials:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey
    })
    throw new Error(
      'Missing Firebase Admin SDK credentials. Check your environment variables.'
    )
  }

  // Initialize the app with credentials
  try {
    // Properly handle the private key
    const formattedPrivateKey = privateKey.includes('\\n') 
      ? privateKey.replace(/\\n/g, '\n')
      : privateKey

    console.log('[Firebase Admin] Initializing with project:', projectId)
    
    // Initialize admin only once
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    })

    console.log('[Firebase Admin] Successfully initialized app')
    return app
  } catch (error) {
    console.error('[Firebase Admin] Error initializing:', error)
    throw error
  }
}

// Initialize Firebase Admin
let app: App
try {
  app = getFirebaseAdminApp()
} catch (error) {
  console.error('[Firebase Admin] Failed to initialize app:', error)
  throw error
}

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)

// Export a type-safe initialization check
export function assertFirebaseAdmin() {
  if (!app || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin has not been properly initialized')
  }
} 
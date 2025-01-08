import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK can only be used on the server side')
}

function getFirebaseAdminApp() {
  try {
    console.log('[Firebase Admin] Starting initialization check')
    
    // Check if an app has already been initialized
    const apps = getApps()
    console.log('[Firebase Admin] Existing apps:', apps.length)
    
    // If app exists, return it
    if (apps.length > 0) {
      console.log('[Firebase Admin] Reusing existing app')
      return apps[0]  // Use first app instead of getApp()
    }

    // Validate environment variables
    console.log('[Firebase Admin] Checking environment variables')
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim()

    console.log('[Firebase Admin] Environment variables present:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey?.length
    })

    if (!projectId || !clientEmail || !privateKey) {
      const missingVars = []
      if (!projectId) missingVars.push('FIREBASE_PROJECT_ID')
      if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL')
      if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY')
      
      console.error('[Firebase Admin] Missing credentials:', missingVars.join(', '))
      throw new Error(
        `Missing Firebase Admin SDK credentials: ${missingVars.join(', ')}`
      )
    }

    // Initialize the app with credentials
    try {
      // Handle both escaped and unescaped private keys
      console.log('[Firebase Admin] Processing private key')
      const formattedPrivateKey = privateKey
        .replace(/\\n/g, '\n')
        .replace(/["']/g, '')
        .trim()

      console.log('[Firebase Admin] Private key format:', {
        originalLength: privateKey.length,
        formattedLength: formattedPrivateKey.length,
        startsWithHeader: formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
        endsWithFooter: formattedPrivateKey.endsWith('-----END PRIVATE KEY-----')
      })

      if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format: Missing header')
      }

      console.log('[Firebase Admin] Initializing with project:', projectId)
      
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey
        })
      })

      console.log('[Firebase Admin] App initialized successfully:', app.name)
      return app
    } catch (error) {
      console.error('[Firebase Admin] Error initializing app:', error)
      console.error('[Firebase Admin] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      })
      throw error
    }
  } catch (error) {
    console.error('[Firebase Admin] Error in getFirebaseAdminApp:', error)
    throw error
  }
}

// Initialize Firebase Admin
let adminApp: ReturnType<typeof getApp> | null = null
let adminAuth: ReturnType<typeof getAuth> | null = null
let adminDb: ReturnType<typeof getFirestore> | null = null

try {
  console.log('[Firebase Admin] Starting global initialization')
  adminApp = getFirebaseAdminApp()
  
  if (!adminApp) {
    throw new Error('Failed to initialize Firebase Admin app')
  }

  console.log('[Firebase Admin] App initialized, getting Auth instance')
  adminAuth = getAuth(adminApp)
  
  if (!adminAuth) {
    throw new Error('Failed to initialize Firebase Admin auth')
  }

  console.log('[Firebase Admin] Auth initialized, getting Firestore instance')
  adminDb = getFirestore(adminApp)
  
  if (!adminDb) {
    throw new Error('Failed to initialize Firebase Admin Firestore')
  }

  console.log('[Firebase Admin] All services initialized successfully')
} catch (error) {
  console.error('[Firebase Admin] Failed to initialize services:', error)
  // Don't throw here - let the assertFirebaseAdmin function handle it
}

export { adminAuth, adminDb }

// Export a type-safe initialization check
export function assertFirebaseAdmin() {
  console.log('[Firebase Admin] Checking initialization status')
  
  if (!adminApp || !adminAuth || !adminDb) {
    // Try to reinitialize if any service is missing
    try {
      console.log('[Firebase Admin] Attempting to reinitialize services')
      adminApp = getFirebaseAdminApp()
      adminAuth = getAuth(adminApp)
      adminDb = getFirestore(adminApp)
    } catch (error) {
      console.error('[Firebase Admin] Reinitialization failed:', error)
      throw new Error('Firebase Admin services are not available')
    }
  }

  // Double check after potential reinitialization
  if (!adminApp || !adminAuth || !adminDb) {
    console.error('[Firebase Admin] Services still unavailable after reinitialization')
    throw new Error('Firebase Admin has not been properly initialized')
  }

  console.log('[Firebase Admin] All services verified')
} 

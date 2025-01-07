import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure this only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK can only be used on the server side')
}

function getFirebaseAdminApp() {
  // Check if an app has already been initialized
  if (getApps().length > 0) {
    return getApp()
  }

  // Validate environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin SDK credentials. Check your environment variables.'
    )
  }

  // Initialize the app with credentials
  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // Handle escaped newlines in the private key
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw error
  }
}

// Initialize Firebase Admin
let adminApp: ReturnType<typeof getApp>
let adminAuth: ReturnType<typeof getAuth>
let adminDb: ReturnType<typeof getFirestore>

try {
  adminApp = getFirebaseAdminApp()
  adminAuth = getAuth(adminApp)
  adminDb = getFirestore(adminApp)
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error)
  throw error
}

export { adminAuth, adminDb }

// Export a type-safe initialization check
export function assertFirebaseAdmin() {
  if (!adminApp || !adminAuth || !adminDb) {
    throw new Error('Firebase Admin has not been properly initialized')
  }
} 

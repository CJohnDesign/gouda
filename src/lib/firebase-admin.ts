import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin...')
    console.log('Environment variables check:')
    console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID)
    console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL)
    console.log('- Private Key (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50))
    console.log('- NODE_ENV:', process.env.NODE_ENV)
    console.log('- NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT)

    const certConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    if (!certConfig.projectId || !certConfig.clientEmail || !certConfig.privateKey) {
      throw new Error('Missing required Firebase Admin credentials in environment variables')
    }

    initializeApp({
      credential: cert(certConfig),
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw error
  }
}

export const adminDb = getFirestore()
export const adminAuth = getAuth() 
import * as admin from 'firebase-admin'

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin...');
    console.log('Environment variables check:');
    console.log('- Project ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('- Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('- Private Key (first 50 chars):', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
    console.log('Firebase Admin initialized with project:', process.env.FIREBASE_PROJECT_ID)
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    throw error; // Re-throw to prevent silent failures
  }
}

export const auth = admin.auth()
export const firestore = admin.firestore() 
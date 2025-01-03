import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

console.log('Initializing Firebase Admin...');

// Check if we have all required environment variables
const projectId = process.env.GOUDA_PROJECT_ID;
const clientEmail = process.env.GOUDA_CLIENT_EMAIL;
const privateKey = process.env.GOUDA_PRIVATE_KEY;

console.log('Environment variables check:');
console.log('- Project ID:', projectId);
console.log('- Client Email:', clientEmail);
console.log('- Private Key (first 50 chars):', privateKey?.substring(0, 50));
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- NEXT_PUBLIC_ENVIRONMENT:', process.env.NEXT_PUBLIC_ENVIRONMENT);

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing required environment variables:');
  console.error('- GOUDA_PROJECT_ID:', !projectId);
  console.error('- GOUDA_CLIENT_EMAIL:', !clientEmail);
  console.error('- GOUDA_PRIVATE_KEY:', !privateKey);
  throw new Error('Missing Firebase Admin credentials in environment variables');
}

// Initialize Firebase Admin if it hasn't been initialized
const apps = getApps();
const adminApp = apps.length === 0 
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  : apps[0];

console.log('Firebase Admin initialized with project:', projectId);

// Initialize Firestore and Auth
const db = getFirestore(adminApp);
const auth = getAuth(adminApp);

export { adminApp, db, auth }; 

import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    return initializeApp({
      credential: cert({
        projectId: process.env.GOUDA_PROJECT_ID,
        clientEmail: process.env.GOUDA_CLIENT_EMAIL,
        privateKey: process.env.GOUDA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getApp();
}

// Initialize Firebase Admin
const app = getFirebaseAdminApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export function initAdmin() {
  // This is now just a no-op since initialization is handled above
  return;
} 

import { getApps, initializeApp, cert } from 'firebase-admin/app';

export function initAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.GOUDA_PROJECT_ID,
        clientEmail: process.env.GOUDA_CLIENT_EMAIL,
        privateKey: process.env.GOUDA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
} 

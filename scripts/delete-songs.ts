import { config } from 'dotenv';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local file
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Firebase Admin
const certConfig = {
  projectId: process.env.GOUDA_PROJECT_ID,
  clientEmail: process.env.GOUDA_CLIENT_EMAIL,
  privateKey: process.env.GOUDA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!certConfig.projectId || !certConfig.clientEmail || !certConfig.privateKey) {
  console.error('Missing required Firebase credentials in .env file');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(certConfig as admin.ServiceAccount),
});

const db = getFirestore();

async function deleteCollection(collectionPath: string) {
  try {
    console.log(`Starting deletion of collection: ${collectionPath}...`);
    
    // Get all documents in the collection
    const snapshot = await db.collection(collectionPath).get();
    
    if (snapshot.empty) {
      console.log('Collection is already empty');
      return;
    }

    // Delete each document in batches
    const batchSize = 500;
    const batches = [];
    let batch = db.batch();
    let operationCount = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;

      if (operationCount === batchSize) {
        batches.push(batch.commit());
        batch = db.batch();
        operationCount = 0;
      }
    });

    // Commit any remaining operations
    if (operationCount > 0) {
      batches.push(batch.commit());
    }

    // Wait for all batches to complete
    await Promise.all(batches);
    
    console.log(`Successfully deleted ${snapshot.size} documents from ${collectionPath}`);
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
}

// Run the deletion
deleteCollection('songs').then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 
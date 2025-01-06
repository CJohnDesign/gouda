import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables before importing other modules
config({ path: path.resolve(process.cwd(), '.env.local') });

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

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

async function syncSubscriptions() {
  try {
    console.log('Starting subscription sync...');
    
    // Get all users with stripeCustomerId
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '!=', null)
      .get();

    console.log(`Found ${usersSnapshot.size} users with Stripe customer IDs`);
    
    let updatedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const stripeCustomerId = userData.stripeCustomerId;

      // Skip if stripeCustomerId is empty or not a string
      if (!stripeCustomerId || typeof stripeCustomerId !== 'string' || !stripeCustomerId.trim()) {
        console.log(`Skipping user ${userDoc.id} - Invalid customer ID:`, stripeCustomerId);
        // Update the user to remove invalid customer ID
        await userDoc.ref.update({
          stripeCustomerId: admin.firestore.FieldValue.delete(),
          subscriptionStatus: 'Canceled',
          updatedAt: new Date(),
        });
        skippedCount++;
        continue;
      }

      try {
        console.log(`Processing user ${userDoc.id} with Stripe customer ID: ${stripeCustomerId}`);
        
        // Get active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
        });

        const currentStatus = userData.subscriptionStatus;
        const shouldBeActive = subscriptions.data.length > 0;
        const newStatus = shouldBeActive ? 'Active' : 'Canceled';

        // Only update if status needs to change
        if (currentStatus !== newStatus) {
          console.log(`Updating user ${userDoc.id}:`, {
            stripeCustomerId,
            oldStatus: currentStatus,
            newStatus,
          });

          await userDoc.ref.update({
            subscriptionStatus: newStatus,
            updatedAt: new Date(),
          });

          updatedCount++;
        } else {
          console.log(`No update needed for user ${userDoc.id} - Status already ${currentStatus}`);
        }
      } catch (error) {
        console.error(`Error processing user ${userDoc.id}:`, error);
        
        // If Stripe can't find the customer, update the user document
        if (error instanceof Stripe.errors.StripeError && error.type === 'StripeInvalidRequestError') {
          console.log(`Removing invalid Stripe customer ID for user ${userDoc.id}`);
          await userDoc.ref.update({
            stripeCustomerId: admin.firestore.FieldValue.delete(),
            subscriptionStatus: 'Canceled',
            updatedAt: new Date(),
          });
        }
        
        errorCount++;
      }
    }

    console.log('Sync completed:', {
      totalProcessed: usersSnapshot.size,
      updated: updatedCount,
      errors: errorCount,
      skipped: skippedCount,
    });

  } catch (error) {
    console.error('Error in sync process:', error);
    process.exit(1);
  }
}

// Run the sync
syncSubscriptions().then(() => {
  console.log('Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 
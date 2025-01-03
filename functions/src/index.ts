/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (!sig || !webhookSecret) {
      throw new Error('Missing Stripe webhook signature or secret');
    }

    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer's email from Stripe
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (!customer.email) break;
        
        // Find Firebase user by email
        const userRecord = await admin.auth().getUserByEmail(customer.email);
        
        // Set custom claims based on subscription status
        if (subscription.status === 'active') {
          await admin.auth().setCustomUserClaims(userRecord.uid, {
            stripeRole: 'subscriber',
            stripeCustomerId: customerId,
          });

          // Update user profile in Firestore
          await db.collection('users').doc(userRecord.uid).update({
            subscriptionStatus: 'active',
            stripeCustomerId: customerId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;
        
        // Get customer's email
        const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId) as Stripe.Customer;
        if (!deletedCustomer.email) break;
        
        // Find Firebase user
        const deletedUserRecord = await admin.auth().getUserByEmail(deletedCustomer.email);
        
        // Remove subscription claims
        await admin.auth().setCustomUserClaims(deletedUserRecord.uid, {
          stripeRole: null,
          stripeCustomerId: deletedCustomerId,
        });

        // Update user profile in Firestore
        await db.collection('users').doc(deletedUserRecord.uid).update({
          subscriptionStatus: 'canceled',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
});

// Function to create a Stripe customer and user profile when a new user signs up
export const createUserProfile = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    if (!user.email) {
      console.log('No email found for user:', user.uid);
      return;
    }

    // Create a new customer in Stripe
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        firebaseUID: user.uid,
      },
    });

    // Set the customerId in the user's custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      stripeCustomerId: customer.id,
    });

    // Create user profile in Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      phoneNumber: user.phoneNumber || null,
      location: null,
      bio: null,
      stripeCustomerId: customer.id,
      subscriptionStatus: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
});

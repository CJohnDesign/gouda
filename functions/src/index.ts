/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import { UserRecord } from 'firebase-admin/auth'
import Stripe from 'stripe'

// Initialize Firebase Admin only once
admin.initializeApp()

const config = functions.config()
const stripe = new Stripe(config.stripe.secret_key || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true
})

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature']
  
  if (!sig) {
    res.status(400).send('No signature found')
    return
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.stripe.webhook_secret
    )

    const db = admin.firestore()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Find user with this Stripe customer ID
        const usersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get()

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0]
          
          // Update subscription status
          await userDoc.ref.update({
            subscriptionStatus: subscription.status === 'active' ? 'Active' : 'PastDue',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        const deletedCustomerId = deletedSubscription.customer as string
        
        // Find user with this Stripe customer ID
        const deletedUsersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', deletedCustomerId)
          .get()

        if (!deletedUsersSnapshot.empty) {
          const userDoc = deletedUsersSnapshot.docs[0]
          
          // Update subscription status to null
          await userDoc.ref.update({
            subscriptionStatus: null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
        }
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    res.status(400).send('Webhook Error')
  }
})

// Create user profile when a new user signs up
export const createUserProfile = functions.auth.user().onCreate(async (user: UserRecord) => {
  const db = admin.firestore()
  
  try {
    console.log('Creating user profile for:', user.uid)
    
    // Check if profile already exists
    const existingProfile = await db.collection('users').doc(user.uid).get()
    if (existingProfile.exists) {
      console.log('User profile already exists for:', user.uid)
      return null
    }
    
    // Create the user profile with default values
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email || '',
      telegramUsername: '',
      firstName: '',
      lastName: '',
      phoneNumber: user.phoneNumber || '',
      profilePicUrl: user.photoURL || '',
      location: '',
      bio: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      stripeCustomerId: '',
      subscriptionStatus: 'Unpaid'
    })

    console.log('Successfully created user profile for:', user.uid)
    
    // Verify the profile was created
    const verifyProfile = await db.collection('users').doc(user.uid).get()
    if (!verifyProfile.exists) {
      throw new Error('Profile creation verification failed')
    }
    
    return null
  } catch (error) {
    console.error('Error creating user profile:', error)
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: user.uid
      })
    }
    throw error
  }
})

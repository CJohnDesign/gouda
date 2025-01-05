import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'
import { stripe } from '@/lib/stripe'
import { getProfileByUid, updateProfile } from '@/lib/firestore/profile'
import Stripe from 'stripe'
import { getFirestore } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing authorization header' } },
        { status: 401 }
      )
    }

    // Verify the Firebase token
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    console.log('Getting profile for uid:', uid)
    // Get the user's profile to find their customer ID
    const db = getFirestore()
    
    // Check both users and profiles collections
    const userDoc = await db.collection('users').doc(uid).get()
    const profileDoc = await db.collection('profiles').doc(uid).get()
    
    let stripeCustomerId: string | undefined
    
    if (userDoc.exists) {
      console.log('Found user document')
      stripeCustomerId = userDoc.data()?.stripeCustomerId
    }
    
    if (!stripeCustomerId && profileDoc.exists) {
      console.log('Found profile document')
      stripeCustomerId = profileDoc.data()?.stripeCustomerId
    }

    if (!stripeCustomerId) {
      // Try to find customer by email
      console.log('Looking up customer by email:', decodedToken.email)
      const customerData = await stripe.customers.list({
        email: decodedToken.email,
        limit: 1,
      })

      if (customerData.data.length) {
        stripeCustomerId = customerData.data[0].id
        console.log('Found customer by email:', stripeCustomerId)
      } else {
        return NextResponse.json(
          { error: { message: 'No Stripe customer found' } },
          { status: 404 }
        )
      }
    }

    try {
      // First, retrieve the customer to verify they exist
      console.log('Retrieving Stripe customer:', stripeCustomerId)
      const customer = await stripe.customers.retrieve(stripeCustomerId)
      console.log('Found Stripe customer:', customer.id)

      // Find active subscriptions for this customer
      console.log('Looking up subscriptions for customer:', stripeCustomerId)
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
        limit: 1,
        expand: ['data.latest_invoice']
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: { message: 'No active subscription found' } },
          { status: 404 }
        )
      }

      const subscription = subscriptions.data[0]
      console.log('Found active subscription:', subscription.id)

      // Cancel the subscription
      console.log('Canceling subscription:', subscription.id)
      const canceledSubscription = await stripe.subscriptions.update(
        subscription.id,
        { 
          cancel_at_period_end: true,
          cancellation_details: {
            comment: 'Canceled via customer request'
          }
        }
      )
      console.log('Subscription canceled:', canceledSubscription.id)

      // Update both user and profile documents if they exist
      const batch = db.batch()
      
      if (userDoc.exists) {
        batch.update(userDoc.ref, {
          subscriptionStatus: 'Canceled',
          stripeSubscriptionId: subscription.id,
          updatedAt: new Date()
        })
      }
      
      if (profileDoc.exists) {
        batch.update(profileDoc.ref, {
          subscriptionStatus: 'Canceled',
          stripeSubscriptionId: subscription.id
        })
      }
      
      await batch.commit()
      console.log('Updated documents with canceled status')

      return NextResponse.json({ 
        subscription: canceledSubscription,
        message: 'Subscription successfully canceled'
      })
    } catch (stripeError) {
      if (stripeError instanceof Stripe.errors.StripeError) {
        console.error('Stripe error:', {
          type: stripeError.type,
          message: stripeError.message,
          code: stripeError.code
        })
        
        switch (stripeError.type) {
          case 'StripeInvalidRequestError':
            return NextResponse.json(
              { error: { message: 'Invalid subscription or customer ID' } },
              { status: 400 }
            )
          case 'StripeAuthenticationError':
            return NextResponse.json(
              { error: { message: 'Authentication with Stripe failed' } },
              { status: 401 }
            )
          default:
            return NextResponse.json(
              { error: { message: stripeError.message } },
              { status: 500 }
            )
        }
      }
      throw stripeError // Re-throw if it's not a Stripe error
    }
  } catch (error) {
    console.error('Error in cancel-subscription:', error)
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to cancel subscription' } },
      { status: 500 }
    )
  }
} 
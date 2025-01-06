import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from '@/firebase/firebase'
import Stripe from 'stripe'

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe signature or endpoint secret')
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    const error = err as Error
    console.error('Webhook signature verification failed:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const db = getFirestore(app)

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        // Get the user document by Stripe customer ID
        const usersSnapshot = await getDoc(doc(db, 'users', subscription.metadata.userId))
        
        if (usersSnapshot.exists()) {
          // Update the user's subscription status
          await updateDoc(doc(db, 'users', subscription.metadata.userId), {
            isSubscribed: status === 'active',
            subscriptionId: subscription.id,
            subscriptionStatus: status,
            updatedAt: new Date(),
          })
        }
        break
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer
        
        // Get the user document by Stripe customer ID
        const usersSnapshot = await getDoc(doc(db, 'users', customer.metadata.firebaseUID))
        
        if (usersSnapshot.exists()) {
          // Update the user's subscription status
          await updateDoc(doc(db, 'users', customer.metadata.firebaseUID), {
            isSubscribed: false,
            stripeCustomerId: null,
            subscriptionId: null,
            subscriptionStatus: null,
            updatedAt: new Date(),
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Webhook handler failed', { status: 500 })
  }
} 
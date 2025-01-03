import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirestore } from 'firebase-admin/firestore'
import { adminApp } from '@/firebase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const rawSignature = headersList.get('stripe-signature')

    if (!rawSignature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        rawSignature,
        webhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const db = getFirestore(adminApp)

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
            updatedAt: new Date()
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
            updatedAt: new Date()
          })
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 
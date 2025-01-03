import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirestore } from 'firebase-admin/firestore'
import { adminApp } from '@/firebase/admin'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// This disables the automatic body parsing, which is necessary for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
}

// This ensures the webhook only accepts POST requests
export async function POST(req: Request) {
  console.log('🚨 WEBHOOK ENDPOINT HIT - START')
  console.log('Webhook secret exists:', !!webhookSecret)
  
  try {
    // Get the raw body
    const body = await req.text()
    console.log('📦 Raw webhook body received:', body.substring(0, 100) + '...')
    
    const headersList = await headers()
    const rawSignature = headersList.get('stripe-signature')
    console.log('🔑 Stripe signature present:', !!rawSignature)
    console.log('📋 All headers:', Object.fromEntries([...headersList.entries()]))

    if (!rawSignature) {
      console.error('❌ No signature found in webhook')
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
      console.log('✅ Webhook signature verified, event type:', event.type)
      console.log('📊 Event data:', JSON.stringify(event.data.object, null, 2))
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('🎯 Processing webhook event:', event.type, 'Event ID:', event.id)
    const db = getFirestore(adminApp)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        console.log('📝 Processing subscription event:', {
          eventType: event.type,
          customerId,
          subscriptionId: subscription.id,
          status: subscription.status
        })

        // Find user with this Stripe customer ID
        const usersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', customerId)
          .get()

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0]
          console.log('👤 Found user document:', userDoc.id)
          await userDoc.ref.update({
            subscriptionStatus: subscription.status === 'active' ? 'Active' : 'PastDue',
            updatedAt: new Date()
          })
          console.log('✅ Updated user subscription status:', {
            userId: userDoc.id,
            subscriptionStatus: subscription.status === 'active' ? 'Active' : 'PastDue'
          })
        } else {
          console.error('❌ No user found for Stripe customer:', customerId)
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        const deletedCustomerId = deletedSubscription.customer as string
        console.log('🗑️ Processing subscription deletion:', {
          customerId: deletedCustomerId,
          subscriptionId: deletedSubscription.id
        })
        
        // Find user with this Stripe customer ID
        const deletedUsersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', deletedCustomerId)
          .get()

        if (!deletedUsersSnapshot.empty) {
          const userDoc = deletedUsersSnapshot.docs[0]
          console.log('👤 Found user for deletion:', userDoc.id)
          
          await userDoc.ref.update({
            subscriptionStatus: 'Canceled',
            updatedAt: new Date()
          })
          console.log('✅ Updated user subscription to canceled state:', userDoc.id)
        } else {
          console.error('❌ No user found for deleted subscription customer:', deletedCustomerId)
        }
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('💳 Processing completed checkout session:', {
          sessionId: session.id,
          mode: session.mode,
          customerId: session.customer,
          subscriptionId: session.subscription
        })
        
        if (session.mode === 'subscription' && session.customer) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          console.log('📦 Subscription details:', subscription);
          
          // Find user with this Stripe customer ID
          const checkoutUsersSnapshot = await db
            .collection('users')
            .where('stripeCustomerId', '==', session.customer)
            .get()

          if (!checkoutUsersSnapshot.empty) {
            const userDoc = checkoutUsersSnapshot.docs[0]
            console.log('👤 Found user for checkout:', userDoc.id)
            
            await userDoc.ref.update({
              subscriptionStatus: 'Active',
              subscriptionId: subscription.id,
              updatedAt: new Date()
            })
            console.log('✅ Successfully updated user subscription status to Active:', userDoc.id)
          } else {
            console.error('❌ No user found for checkout customer:', session.customer)
          }
        }
        break
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error handling webhook:', error)
    console.error('Error details:', error instanceof Error ? error.stack : error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 
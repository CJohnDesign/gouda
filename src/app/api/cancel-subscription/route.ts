import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from '@/firebase/firebase'
import { getAuth } from 'firebase-admin/auth'

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      )
    }

    // Verify the Firebase ID token
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const userId = decodedToken.uid

    // Get the user's Stripe customer ID from Firestore
    const db = getFirestore(app)
    const userDoc = await getDoc(doc(db, 'users', userId))
    const stripeCustomerId = userDoc.data()?.stripeCustomerId
    const subscriptionId = userDoc.data()?.subscriptionId

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: { message: 'No Stripe customer ID found' } },
        { status: 400 }
      )
    }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: { message: 'No active subscription found' } },
        { status: 400 }
      )
    }

    // Verify the customer ID is valid
    try {
      await stripe.customers.retrieve(stripeCustomerId)
    } catch (error) {
      return NextResponse.json(
        { error: { message: 'Invalid Stripe customer ID' } },
        { status: 400 }
      )
    }

    // Cancel the subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update the user's document
    await updateDoc(doc(db, 'users', userId), {
      subscriptionStatus: subscription.status,
      updatedAt: new Date(),
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
} 
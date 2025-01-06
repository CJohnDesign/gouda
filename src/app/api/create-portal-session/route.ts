import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase/firebase';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get the user's Stripe customer ID from Firestore
    const db = getFirestore(app);
    const userDoc = await getDoc(doc(db, 'users', userId));
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: { message: 'No Stripe customer ID found' } },
        { status: 400 }
      );
    }

    // Verify the customer ID is valid
    try {
      await stripe.customers.retrieve(stripeCustomerId);
    } catch (error) {
      return NextResponse.json(
        { error: { message: 'Invalid Stripe customer ID' } },
        { status: 400 }
      );
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 
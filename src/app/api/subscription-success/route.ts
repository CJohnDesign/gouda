import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/firebase';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';

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

    // Get the request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: { message: 'Missing session ID' } },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const subscription = session.subscription as Stripe.Subscription;
    if (!subscription) {
      return NextResponse.json(
        { error: { message: 'No subscription found in session' } },
        { status: 400 }
      );
    }

    // Get the user's document from Firestore
    const db = getFirestore(app);
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: { message: 'User not found' } },
        { status: 404 }
      );
    }

    // Update the user's subscription status
    await updateDoc(doc(db, 'users', userId), {
      isSubscribed: true,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error handling subscription success:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 
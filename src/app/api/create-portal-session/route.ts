import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { adminApp } from '@/firebase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

type ErrorResponse = {
  error: {
    message: string;
    statusCode: number;
  };
};

export async function POST() {
  try {
    // Get and await headers
    const headersList = await headers();
    const authHeader = headersList.get('Authorization') || headersList.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: { message: 'No token provided', statusCode: 401 } },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const decodedToken = await getAuth(adminApp).verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user's Stripe customer ID from Firestore
    const db = getFirestore(adminApp);
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.stripeCustomerId) {
      return NextResponse.json(
        { error: { message: 'No Stripe customer found. Please subscribe first.', statusCode: 404 } },
        { status: 404 }
      );
    }

    try {
      // Create Stripe billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`,
      });

      return NextResponse.json({ url: session.url });
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      const err = stripeError as Stripe.errors.StripeError;
      
      if (err.code === 'resource_missing') {
        // Update user record to remove invalid Stripe customer ID
        await db.collection('users').doc(userId).update({
          stripeCustomerId: null,
          subscriptionStatus: 'inactive'
        });
        
        return NextResponse.json(
          { error: { message: 'Invalid subscription. Please subscribe again.', statusCode: 400 } },
          { status: 400 }
        );
      }
      
      throw stripeError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    const err = error as Error | Stripe.errors.StripeError;
    console.error('Error creating portal session:', err);
    
    const statusCode = 'statusCode' in err ? err.statusCode || 500 : 500;
    const message = err.message || 'Internal server error';
    
    return NextResponse.json(
      { error: { message, statusCode } } as ErrorResponse,
      { status: statusCode }
    );
  }
} 
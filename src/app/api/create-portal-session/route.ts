import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: { message: 'Missing authorization header' } },
        { status: 401 }
      );
    }

    // Verify the Firebase token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check both users and profiles collections
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const profileDoc = await adminDb.collection('profiles').doc(uid).get();
    
    let stripeCustomerId: string | undefined;
    
    if (userDoc.exists) {
      stripeCustomerId = userDoc.data()?.stripeCustomerId;
    }
    
    if (!stripeCustomerId && profileDoc.exists) {
      stripeCustomerId = profileDoc.data()?.stripeCustomerId;
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: { message: 'No Stripe customer found' } },
        { status: 404 }
      );
    }

    // Create Stripe Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in create-portal-session:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to create portal session' } },
      { status: 500 }
    );
  }
} 
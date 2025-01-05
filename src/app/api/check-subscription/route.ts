import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    return NextResponse.json({
      active: subscriptions.data.length > 0,
      subscription: subscriptions.data[0] || null,
    });
  } catch (error) {
    console.error('Error in check-subscription:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to check subscription' } },
      { status: 500 }
    );
  }
} 
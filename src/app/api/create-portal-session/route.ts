import { NextResponse } from 'next/server';
import { getStripe, isTestMode, getAppUrl } from '@/lib/stripe';
import { adminAuth, adminDb } from '@/firebase/admin';

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const appUrl = getAppUrl();
    console.log(`[Stripe Portal] Received portal session request in ${isTestMode() ? 'test' : 'live'} mode`);
    console.log('[Stripe Portal] Using app URL:', appUrl);
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[Stripe Portal] Processing request with auth:', authHeader ? 'Present' : 'Missing');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[Stripe Portal] Authorization header missing or invalid');
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const token = authHeader.split('Bearer ')[1];
    console.log('[Stripe Portal] Verifying Firebase token');
    
    if (!adminAuth) {
      console.error('[Stripe Portal] Firebase Admin Auth is not initialized');
      return NextResponse.json(
        { error: { message: 'Server configuration error' } },
        { status: 500 }
      );
    }
    
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log('[Stripe Portal] User authenticated:', userId);

    // Get the user's Stripe customer ID from Firestore using Admin SDK
    console.log('[Stripe Portal] Fetching user document');
    
    if (!adminDb) {
      console.error('[Stripe Portal] Firebase Admin Firestore is not initialized');
      return NextResponse.json(
        { error: { message: 'Server configuration error' } },
        { status: 500 }
      );
    }
    
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      console.error('[Stripe Portal] No Stripe customer ID found for user:', userId);
      return NextResponse.json(
        { error: { message: 'No Stripe customer ID found' } },
        { status: 400 }
      );
    }

    // Verify the customer ID is valid
    try {
      console.log('[Stripe Portal] Verifying Stripe customer:', stripeCustomerId);
      await stripe.customers.retrieve(stripeCustomerId);
      console.log('[Stripe Portal] Customer verification successful');
    } catch (error) {
      console.error('[Stripe Portal] Invalid Stripe customer ID:', error);
      return NextResponse.json(
        { error: { message: 'Invalid Stripe customer ID', details: error instanceof Error ? error.message : 'Unknown error' } },
        { status: 400 }
      );
    }

    // Create a billing portal session
    console.log('[Stripe Portal] Creating billing portal session');
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/account/subscription`,
    });
    console.log('[Stripe Portal] Successfully created portal session:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Portal] Error:', err);
    return NextResponse.json(
      { error: { message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
} 
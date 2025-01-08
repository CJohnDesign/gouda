import { NextResponse } from 'next/server';
import { getStripe, isTestMode, getPriceId, getAppUrl } from '@/lib/stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const mode = isTestMode() ? 'test' : 'live';
    console.log('[Stripe Checkout] Using mode:', mode);
    
    const priceId = getPriceId();
    const appUrl = getAppUrl();
    console.log('[Stripe Checkout] Using price ID:', priceId);
    console.log('[Stripe Checkout] Using app URL:', appUrl);
    console.log('[Stripe Checkout] Environment:', process.env.NEXT_PUBLIC_ENVIRONMENT);
    console.log('[Stripe Checkout] Node ENV:', process.env.NODE_ENV);
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('[Stripe Checkout] Processing request with auth:', authHeader ? 'Present' : 'Missing');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[Stripe Checkout] Authorization header missing or invalid');
      return NextResponse.json(
        { error: { message: 'Missing or invalid authorization header' } },
        { status: 401 }
      );
    }

    // Verify the Firebase ID token
    const token = authHeader.split('Bearer ')[1];
    console.log('[Stripe Checkout] Verifying Firebase token');
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (verifyError) {
      console.error('[Stripe Checkout] Token verification failed:', verifyError);
      return NextResponse.json(
        { error: { message: 'Invalid authentication token' } },
        { status: 401 }
      );
    }
    
    const userId = decodedToken.uid;
    console.log('[Stripe Checkout] User authenticated:', userId);

    // Validate price ID format
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      console.error('[Stripe Checkout] Invalid price ID format:', priceId);
      return NextResponse.json(
        { error: { message: 'Invalid subscription price format' } },
        { status: 400 }
      );
    }

    // Get or create customer
    console.log('[Stripe Checkout] Fetching user document for:', userId);
    let userDoc;
    try {
      userDoc = await adminDb.collection('users').doc(userId).get();
    } catch (dbError) {
      console.error('[Stripe Checkout] Failed to fetch user document:', dbError);
      return NextResponse.json(
        { error: { message: 'Failed to fetch user data' } },
        { status: 500 }
      );
    }
    
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;
    console.log('[Stripe Checkout] Existing Stripe customer ID:', stripeCustomerId || 'None');

    if (!stripeCustomerId) {
      console.log('[Stripe Checkout] Creating new Stripe customer');
      try {
        const customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: { firebaseUID: userId }
        }, {
          idempotencyKey: `customer_${userId}`
        });
        stripeCustomerId = customer.id;
        console.log('[Stripe Checkout] Created new Stripe customer:', stripeCustomerId);
        await adminDb.collection('users').doc(userId).update({ stripeCustomerId: customer.id });
        console.log('[Stripe Checkout] Updated user document with Stripe customer ID');
      } catch (stripeError) {
        console.error('[Stripe Checkout] Failed to create/update customer:', stripeError);
        return NextResponse.json(
          { error: { message: 'Failed to create customer' } },
          { status: 500 }
        );
      }
    }

    // Create Checkout Session
    console.log('[Stripe Checkout] Creating checkout session');
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${appUrl}/account/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/account/subscription?canceled=true`,
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        metadata: { userId },
        payment_method_types: ['card'],
        allow_promotion_codes: true,
      }, {
        idempotencyKey: `checkout_${userId}_${Date.now()}`
      });
    } catch (sessionError) {
      console.error('[Stripe Checkout] Failed to create session:', sessionError);
      return NextResponse.json(
        { error: { message: 'Failed to create checkout session' } },
        { status: 500 }
      );
    }

    if (!session.url) {
      console.error('[Stripe Checkout] Failed to create session URL');
      return NextResponse.json(
        { error: { message: 'Failed to create checkout session' } },
        { status: 500 }
      );
    }

    console.log('[Stripe Checkout] Successfully created session:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Checkout] Error:', err);
    const error = err as { type?: string; message?: string };
    
    // Handle specific Stripe error types
    switch (error.type) {
      case 'StripeCardError':
        console.error('[Stripe Checkout] Card Error:', error.message);
        return NextResponse.json({ error: { message: 'Your card was declined.' } }, { status: 402 });
      case 'StripeRateLimitError':
        console.error('[Stripe Checkout] Rate Limit Error:', error.message);
        return NextResponse.json({ error: { message: 'Too many requests. Please try again later.' } }, { status: 429 });
      case 'StripeInvalidRequestError':
        console.error('[Stripe Checkout] Invalid Request Error:', error.message);
        return NextResponse.json({ error: { message: 'Invalid request parameters.' } }, { status: 400 });
      case 'StripeAuthenticationError':
        console.error('[Stripe Checkout] Authentication Error:', error.message);
        return NextResponse.json({ error: { message: 'Authentication failed.' } }, { status: 401 });
      case 'StripeConnectionError':
        console.error('[Stripe Checkout] Connection Error:', error.message);
        return NextResponse.json({ error: { message: 'Network error.' } }, { status: 503 });
      case 'StripeAPIError':
        console.error('[Stripe Checkout] API Error:', error.message);
        return NextResponse.json({ error: { message: 'Internal Stripe error.' } }, { status: 500 });
      default:
        console.error('[Stripe Checkout] Unexpected Error:', error.message);
        return NextResponse.json(
          { error: { message: error.message || 'Something went wrong.' } },
          { status: 500 }
        );
    }
  }
} 
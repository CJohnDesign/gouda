import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminAuth as auth, adminDb as db } from '@/firebase/admin';

// This should match your Stripe price ID
const PRICE_ID = process.env.STRIPE_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

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
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get the request body
    const body = await request.json();
    const { priceId = PRICE_ID } = body;

    // Validate price ID format
    if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: { message: 'Invalid subscription price format' } },
        { status: 400 }
      );
    }

    // Get or create customer
    const userDoc = await db.collection('users').doc(userId).get();
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: { firebaseUID: userId }
      }, {
        idempotencyKey: `customer_${userId}`
      });
      stripeCustomerId = customer.id;
      await db.collection('users').doc(userId).update({ stripeCustomerId: customer.id });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?canceled=true`,
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

    if (!session.url) {
      return NextResponse.json(
        { error: { message: 'Failed to create checkout session' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    const error = err as { type?: string; message?: string };
    
    // Handle specific Stripe error types
    switch (error.type) {
      case 'StripeCardError':
        return NextResponse.json({ error: { message: 'Your card was declined.' } }, { status: 402 });
      case 'StripeRateLimitError':
        return NextResponse.json({ error: { message: 'Too many requests. Please try again later.' } }, { status: 429 });
      case 'StripeInvalidRequestError':
        return NextResponse.json({ error: { message: 'Invalid request parameters.' } }, { status: 400 });
      case 'StripeAuthenticationError':
        return NextResponse.json({ error: { message: 'Authentication failed.' } }, { status: 401 });
      case 'StripeConnectionError':
        return NextResponse.json({ error: { message: 'Network error.' } }, { status: 503 });
      case 'StripeAPIError':
        return NextResponse.json({ error: { message: 'Internal Stripe error.' } }, { status: 500 });
      default:
        return NextResponse.json(
          { error: { message: error.message || 'Something went wrong.' } },
          { status: 500 }
        );
    }
  }
} 
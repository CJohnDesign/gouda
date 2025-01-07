import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth, db, initAdmin } from '@/firebase/admin';

// Initialize Firebase Admin
initAdmin();

// This should match your Stripe price ID
const PRICE_ID = process.env.STRIPE_PRICE_ID;

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

    if (!priceId) {
      console.error('Missing price ID. Environment variable STRIPE_PRICE_ID not set.');
      return NextResponse.json(
        { error: { message: 'Subscription price not configured' } },
        { status: 400 }
      );
    }

    // Verify the price ID exists in Stripe
    try {
      await stripe.prices.retrieve(priceId);
    } catch (error) {
      console.error('Invalid price ID:', error);
      return NextResponse.json(
        { error: { message: 'Invalid subscription price', details: error instanceof Error ? error.message : 'Unknown error' } },
        { status: 400 }
      );
    }

    // Get the user's Stripe customer ID from Firestore using Admin SDK
    const userDoc = await db.collection('users').doc(userId).get();
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    // If the customer ID is invalid or doesn't exist, create a new customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: {
          firebaseUID: userId
        }
      });
      stripeCustomerId = customer.id;

      // Update the user's document with the new customer ID using Admin SDK
      await db.collection('users').doc(userId).update({
        stripeCustomerId: customer.id
      });
    } else {
      // Verify the customer ID is valid
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        console.error('Invalid or non-existent Stripe customer:', error);
        // If the customer doesn't exist in Stripe, create a new one
        const customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: {
            firebaseUID: userId
          }
        });
        stripeCustomerId = customer.id;

        // Update the user's document with the new customer ID using Admin SDK
        await db.collection('users').doc(userId).update({
          stripeCustomerId: customer.id
        });
      }
    }

    console.log('Creating checkout session for:', {
      userId,
      stripeCustomerId,
      priceId
    });

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?canceled=true`,
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      metadata: {
        userId,
      },
    });

    if (!session.url) {
      console.error('No session URL returned from Stripe');
      return NextResponse.json(
        { error: { message: 'Failed to create checkout session' } },
        { status: 500 }
      );
    }

    console.log('Checkout session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    );
  }
} 
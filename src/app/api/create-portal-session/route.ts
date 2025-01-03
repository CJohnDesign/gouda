import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { Stripe } from 'stripe';
import { adminApp } from '@/firebase/admin';
import { stripe } from '@/lib/stripe';

type ErrorResponse = {
  error: {
    message: string;
    statusCode: number;
  };
};

export async function POST() {
  try {
    console.log('Starting portal session creation...');
    
    // Get and await headers
    const headersList = await headers();
    const authHeader = headersList.get('Authorization') || headersList.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      console.error('No token provided');
      return new NextResponse(
        JSON.stringify({ error: { message: 'No token provided', statusCode: 401 } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Token received, verifying...');
    // Verify Firebase token
    const decodedToken = await getAuth(adminApp).verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log('Token verified for user:', userId);

    // Get user's Stripe customer ID from Firestore
    const db = getFirestore(adminApp);
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    console.log('User data retrieved:', { 
      userId, 
      hasStripeCustomerId: !!userData?.stripeCustomerId,
      stripeCustomerId: userData?.stripeCustomerId
    });

    let stripeCustomerId = userData?.stripeCustomerId;

    // If we have a customer ID, verify it exists in Stripe
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        console.log('Failed to retrieve Stripe customer, creating new one');
        stripeCustomerId = null;
      }
    }

    // Create new customer if needed
    if (!stripeCustomerId) {
      console.log('Creating new customer...');
      
      // Check if customer already exists with this email
      const customerData = await stripe.customers.list({
        email: decodedToken.email,
        limit: 1,
      });

      if (customerData.data.length) {
        stripeCustomerId = customerData.data[0].id;
        console.log('Found existing Stripe customer:', stripeCustomerId);
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: {
            firebaseUID: userId,
          },
        });
        stripeCustomerId = customer.id;
        console.log('Created new Stripe customer:', stripeCustomerId);
      }

      // Update user document with Stripe customer ID
      await userDoc.ref.update({
        stripeCustomerId,
        updatedAt: new Date()
      });
    }

    // Check if customer has any active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1,
    });

    // If no active subscription, create a checkout session
    if (!subscriptions.data.length) {
      console.log('No active subscription found, creating checkout session...');
      
      // Get the price ID for the product
      const prices = await stripe.prices.list({
        product: 'prod_RW6cDkUSlGu6jj',
        active: true,
        limit: 1,
      });

      if (!prices.data.length) {
        console.error('No active price found for product');
        return new NextResponse(
          JSON.stringify({ error: { message: 'Product configuration error', statusCode: 500 } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: prices.data[0].id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?canceled=true`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      return new NextResponse(
        JSON.stringify({ url: session.url }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      console.log('Creating Stripe billing portal session for customer:', stripeCustomerId);
      // Create Stripe billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`,
      });
      console.log('Portal session created successfully:', session.url);

      return new NextResponse(
        JSON.stringify({ url: session.url }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.log('Failed to create portal session, creating new customer flow');
      stripeCustomerId = null;
      await userDoc.ref.update({
        stripeCustomerId: null,
        subscriptionStatus: 'Unpaid',
        updatedAt: new Date()
      });
      
      // Recursively call the same function which will now create a new customer
      return POST();
    }
  } catch (error) {
    const err = error as Error | Stripe.errors.StripeError;
    console.error('Error creating portal session:', err);
    
    const statusCode = 'statusCode' in err ? err.statusCode || 500 : 500;
    const message = err.message || 'Internal server error';
    
    return new NextResponse(
      JSON.stringify({ error: { message, statusCode } } as ErrorResponse),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 
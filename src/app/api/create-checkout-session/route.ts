import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { NextRequest } from 'next/server';
import { adminApp } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    let decodedToken;
    try {
      const auth = getAuth();
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create or retrieve Stripe customer
    let customerId: string;
    const customerData = await stripe.customers.list({
      email: decodedToken.email,
      limit: 1,
    });

    if (customerData.data.length) {
      customerId = customerData.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: {
          firebaseUID: decodedToken.uid,
        },
      });
      customerId = customer.id;
      console.log('Created new customer:', customerId);
    }

    // Create or update user document in Firestore
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(decodedToken.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        email: decodedToken.email,
        stripeCustomerId: customerId,
        subscriptionStatus: 'Unpaid',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (!userDoc.data()?.stripeCustomerId) {
      await userRef.update({
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      });
    }

    // Get the price ID for the product
    console.log('Fetching prices for product: prod_RW6cDkUSlGu6jj');
    const prices = await stripe.prices.list({
      product: 'prod_RW6cDkUSlGu6jj',
      active: true,
      limit: 1,
    });

    if (!prices.data.length) {
      console.error('No active price found for product');
      return new NextResponse(
        JSON.stringify({ error: 'Product configuration error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const priceId = prices.data[0].id;
    console.log('Using price:', priceId);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      subscription_data: {},
    });

    console.log('Created checkout session:', session.id);
    return new NextResponse(
      JSON.stringify({ url: session.url }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error creating checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
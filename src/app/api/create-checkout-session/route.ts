import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/firebase';
import { getAuth } from 'firebase-admin/auth';
import { headers } from 'next/headers';

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
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: { message: 'Missing price ID' } },
        { status: 400 }
      );
    }

    // Get the user's Stripe customer ID from Firestore
    const db = getFirestore(app);
    const userDoc = await getDoc(doc(db, 'users', userId));
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

      // Update the user's document with the new customer ID
      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customer.id
      });
    } else {
      // Verify the customer ID is valid
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (error) {
        // If the customer doesn't exist in Stripe, create a new one
        const customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: {
            firebaseUID: userId
          }
        });
        stripeCustomerId = customer.id;

        // Update the user's document with the new customer ID
        await updateDoc(doc(db, 'users', userId), {
          stripeCustomerId: customer.id
        });
      }
    }

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
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      metadata: {
        userId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: { message: 'Failed to create checkout session' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
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

    // Get the price ID from the request body
    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json(
        { error: { message: 'Missing price ID' } },
        { status: 400 }
      );
    }

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

    // If no customer ID exists, create a new customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: {
          firebaseUID: uid
        }
      });
      stripeCustomerId = customer.id;

      // Update both user and profile documents if they exist
      const batch = adminDb.batch();
      
      if (userDoc.exists) {
        batch.update(userDoc.ref, {
          stripeCustomerId: customer.id,
          updatedAt: new Date()
        });
      }
      
      if (profileDoc.exists) {
        batch.update(profileDoc.ref, {
          stripeCustomerId: customer.id
        });
      }
      
      await batch.commit();
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        metadata: {
          firebaseUID: uid
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : 'Failed to create checkout session' } },
      { status: 500 }
    );
  }
} 
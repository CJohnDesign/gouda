import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAuth } from 'firebase-admin/auth';
import type { NextRequest } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin...');
    const certConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    initializeApp({
      credential: cert(certConfig),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export async function GET(request: NextRequest) {
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

    // Find Stripe customer
    const customerData = await stripe.customers.list({
      email: decodedToken.email,
      limit: 1,
    });

    if (!customerData.data.length) {
      return new NextResponse(
        JSON.stringify({ isSubscribed: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerData.data[0].id,
      status: 'active',
      limit: 1,
    });

    return new NextResponse(
      JSON.stringify({ isSubscribed: subscriptions.data.length > 0 }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error checking subscription status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
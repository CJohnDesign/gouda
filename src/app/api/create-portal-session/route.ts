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
    
    console.log('Firebase Admin config:', {
      projectId: certConfig.projectId,
      clientEmail: certConfig.clientEmail?.substring(0, 10) + '...',
      hasPrivateKey: !!certConfig.privateKey,
    });
    
    initializeApp({
      credential: cert(certConfig),
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

export async function POST(request: NextRequest) {
  console.log('Starting create-portal-session request...');
  
  // Check environment variables
  console.log('Environment check:', {
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyLength: process.env.STRIPE_SECRET_KEY?.length,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
    nodeEnv: process.env.NODE_ENV,
  });
  
  try {
    // Verify Stripe configuration
    console.log('Checking Stripe configuration...');
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }
    
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token received, length:', token.length);

    // Verify Firebase token
    let decodedToken;
    try {
      console.log('Getting Firebase Auth instance...');
      const auth = getAuth();
      
      console.log('Verifying token...');
      decodedToken = await auth.verifyIdToken(token);
      console.log('Token verified successfully for user:', decodedToken.email);
    } catch (error) {
      console.error('Firebase token verification error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!decodedToken.email) {
      console.log('No email in token');
      return new NextResponse(
        JSON.stringify({ error: 'No email associated with account' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get or create Stripe customer
    try {
      console.log('Looking up Stripe customer for email:', decodedToken.email);
      const customerData = await stripe.customers.list({
        email: decodedToken.email,
        limit: 1,
      });

      let customerId: string;

      if (customerData.data.length) {
        customerId = customerData.data[0].id;
        console.log('Found existing Stripe customer:', customerId);
      } else {
        console.log('Creating new Stripe customer...');
        const customer = await stripe.customers.create({
          email: decodedToken.email,
          metadata: {
            firebaseUID: decodedToken.uid,
          },
        });
        customerId = customer.id;
        console.log('Created new Stripe customer:', customerId);
      }

      // Create portal session
      console.log('Creating Stripe portal session...');
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
      });

      console.log('Portal session created successfully:', session.url);
      return new NextResponse(
        JSON.stringify({ url: session.url }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Stripe error:', error);
      if (error instanceof Error) {
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        // Log additional Stripe error properties if available
        const stripeError = error as any;
        if (stripeError.type) {
          console.error('Stripe error type:', stripeError.type);
          console.error('Stripe error raw:', stripeError.raw);
        }
      }
      return new NextResponse(
        JSON.stringify({ 
          error: 'Error processing payment information',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 
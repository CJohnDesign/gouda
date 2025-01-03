import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?error=missing_session`);
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Retrieved checkout session:', session.id);

    if (!session.customer) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?error=missing_customer`);
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log('Retrieved subscription:', subscription.id);

    // Update Firestore
    const db = getFirestore(adminApp);
    const usersSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', session.customer)
      .get();

    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      await userDoc.ref.update({
        subscriptionStatus: 'Active',
        subscriptionId: subscription.id,
        updatedAt: new Date()
      });
      console.log('Updated user subscription status:', userDoc.id);
    }

    // Redirect back to subscription page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account/profile?subscription=active`);
  } catch (error) {
    console.error('Error handling subscription success:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/account/subscription?error=unknown`);
  }
} 
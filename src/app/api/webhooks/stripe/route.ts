import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { assertFirebaseAdmin } from '@/firebase/admin';
import Stripe from 'stripe';

// Ensure Firebase Admin is initialized
assertFirebaseAdmin();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature found', { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const db = getFirestore();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        console.log('Checkout session completed:', session);

        if (userId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await db.collection('users').doc(userId).update({
            isSubscribed: subscription.status === 'active',
            subscriptionStatus: subscription.status,
            subscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString()
          });
          console.log('Updated user subscription status:', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // Find user by stripeCustomerId
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userId = usersSnapshot.docs[0].id;
          console.log('Subscription updated for user:', userId);

          await db.collection('users').doc(userId).update({
            isSubscribed: subscription.status === 'active',
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString()
          });
          console.log('Updated subscription status:', subscription.status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Find user by stripeCustomerId
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userId = usersSnapshot.docs[0].id;
          console.log('Subscription deleted for user:', userId);

          await db.collection('users').doc(userId).update({
            isSubscribed: false,
            subscriptionStatus: 'canceled',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            updatedAt: new Date().toISOString()
          });
          console.log('Marked subscription as canceled');
        }
        break;
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook error', { status: 500 });
  }
} 
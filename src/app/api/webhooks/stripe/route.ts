import { NextResponse } from 'next/server';
import { getStripe, isTestMode } from '@/lib/stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { assertFirebaseAdmin } from '@/firebase/admin';
import Stripe from 'stripe';

// Ensure Firebase Admin is initialized
assertFirebaseAdmin();

// Get the appropriate webhook secret
const getWebhookSecret = () => {
  if (isTestMode()) {
    return process.env.STRIPE_TEST_WEBHOOK_SECRET!;
  }
  return process.env.STRIPE_WEBHOOK_SECRET!;
};

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    
    console.log(`[Stripe Webhook] Received webhook event in ${isTestMode() ? 'test' : 'live'} mode`);
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] No signature found in request');
      return new NextResponse('No signature found', { status: 400 });
    }

    let event;
    try {
      console.log('[Stripe Webhook] Verifying webhook signature');
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('[Stripe Webhook] Event verified:', event.type);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const db = getFirestore();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        console.log('[Stripe Webhook] Processing checkout.session.completed:', {
          sessionId: session.id,
          userId,
          customerId: session.customer,
          subscriptionId: session.subscription
        });

        if (userId) {
          try {
            console.log('[Stripe Webhook] Retrieving subscription details');
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            console.log('[Stripe Webhook] Subscription status:', subscription.status);
            
            console.log('[Stripe Webhook] Updating user document:', userId);
            await db.collection('users').doc(userId).update({
              isSubscribed: subscription.status === 'active',
              subscriptionStatus: subscription.status === 'active' ? 'Active' : 'Unpaid',
              subscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              stripeBillingDetails: {
                address: session.customer_details?.address || {},
                email: session.customer_details?.email,
                name: session.customer_details?.name,
                phone: session.customer_details?.phone
              },
              updatedAt: new Date().toISOString()
            });
            console.log('[Stripe Webhook] Successfully updated user subscription status');
          } catch (error) {
            console.error('[Stripe Webhook] Error updating user subscription:', error);
            throw error; // Re-throw to be caught by the outer try-catch
          }
        } else {
          console.error('[Stripe Webhook] No userId found in session metadata');
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

          // Get customer details
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          await db.collection('users').doc(userId).update({
            isSubscribed: subscription.status === 'active',
            subscriptionStatus: subscription.status === 'active' ? 'Active' : 'Unpaid',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeBillingDetails: {
              address: (customer as Stripe.Customer).address || {},
              email: (customer as Stripe.Customer).email,
              name: (customer as Stripe.Customer).name,
              phone: (customer as Stripe.Customer).phone
            },
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
            subscriptionStatus: 'Cancelled',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: false,
            updatedAt: new Date().toISOString()
          });
          console.log('Marked subscription as canceled');
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (err) {
    console.error('[Stripe Webhook] Processing error:', err);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
} 
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Client-side Stripe instance
let stripePromise: Promise<any> | null = null;
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Stripe publishable key is not set in environment variables');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe instance
const secretKey = process.env.STRIPE_SECRET_KEY;
console.log('Stripe configuration:', {
  hasSecretKey: !!secretKey,
  keyLength: secretKey?.length,
  keyPrefix: secretKey?.substring(0, 7),
});

if (!secretKey) {
  throw new Error('Stripe secret key is not set in environment variables');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-12-18.acacia',
}); 
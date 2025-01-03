import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

type StripeKeys = {
  publishableKey: string;
  secretKey: string;
}

export function getStripeKeys(): StripeKeys {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    publishableKey: isProduction
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE!
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST!,
    secretKey: isProduction
      ? process.env.STRIPE_SECRET_KEY_LIVE!
      : process.env.STRIPE_SECRET_KEY_TEST!,
  }
}

export { stripe } 
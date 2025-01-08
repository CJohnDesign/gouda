import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const isTestMode = () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'

export const getPriceId = () => {
  return isTestMode() 
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID 
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
}

export const getStripe = () => {
  return stripe
} 
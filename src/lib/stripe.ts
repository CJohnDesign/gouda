import Stripe from 'stripe'

// Get the appropriate Stripe secret key based on environment
const getStripeSecretKey = () => {
  const env = process.env.NODE_ENV;
  console.log('[Stripe Config] Environment:', env);
  
  // In production, always use the live key
  // In development or test, use the test key
  const key = env === 'production'
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_TEST_SECRET_KEY;

  if (!key) {
    throw new Error(`Missing ${env === 'production' ? 'STRIPE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY'} environment variable`);
  }

  const keyType = key.startsWith('sk_test') ? 'test' : 'live';
  console.log('[Stripe Config] Using key type:', keyType);
  
  // Validate that we're using the correct key type for the environment
  if (env === 'production' && keyType === 'test') {
    console.error('[Stripe Config] Warning: Using test key in production environment');
  }

  return key;
}

// Initialize Stripe with the appropriate key
export const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Determine if we're in development/test mode
export const isTestMode = () => {
  const env = process.env.NODE_ENV;
  const isTest = env !== 'production';
  console.log('[Stripe Config] Test mode:', isTest, 'Environment:', env);
  return isTest;
}

// Get the appropriate price ID based on environment
export const getPriceId = () => {
  const isTest = isTestMode()
  const priceId = isTest
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID 
    : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
  
  if (!priceId) {
    throw new Error(`Missing ${isTest ? 'NEXT_PUBLIC_STRIPE_TEST_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_PRICE_ID'} environment variable`)
  }
  
  console.log('[Stripe Config] Using price ID:', priceId, 'Test mode:', isTest)
  return priceId
}

// Get the appropriate app URL based on environment
export const getAppUrl = () => {
  const isTest = isTestMode()
  const defaultUrl = isTest ? 'http://localhost:3000' : 'https://gouda.rocks'
  const url = process.env.NEXT_PUBLIC_APP_URL || defaultUrl
  
  console.log('[Stripe Config] Using app URL:', url, 'Test mode:', isTest)
  return url
}

export const getStripe = () => {
  return stripe
} 
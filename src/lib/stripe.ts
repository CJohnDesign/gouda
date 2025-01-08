import Stripe from 'stripe'

const STRIPE_CONFIG: Stripe.StripeConfig = {
  apiVersion: '2024-12-18.acacia' as const,
  typescript: true as const,
}

// Helper to determine if we're in test mode
export const isTestMode = () => {
  // Always use test mode with emulators
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'test') {
    return true;
  }
  
  // Always use test mode in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production, use test mode if explicitly configured
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_ENVIRONMENT === 'test';
  }

  // Fallback to checking the key prefix
  return process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ?? true;
}

// Get the appropriate Stripe instance
export const getStripe = () => {
  const mode = isTestMode() ? 'test' : 'live';
  const key = mode === 'test' 
    ? process.env.STRIPE_SECRET_KEY 
    : (process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY);

  console.log(`[Stripe] Using ${mode} mode with key prefix:`, 
    key?.startsWith('sk_test_') ? 'sk_test_' : 'sk_live_'
  );
  
  // Ensure required environment variables are present
  if (!key) {
    throw new Error(`Missing ${mode === 'test' ? 'STRIPE_SECRET_KEY' : 'STRIPE_SECRET_KEY_LIVE'} environment variable`)
  }

  return new Stripe(key, STRIPE_CONFIG);
}

// Get the appropriate price ID
export const getPriceId = () => {
  const mode = isTestMode() ? 'test' : 'live';
  const priceId = mode === 'test'
    ? process.env.STRIPE_PRICE_ID
    : (process.env.STRIPE_PRICE_ID_LIVE || process.env.STRIPE_PRICE_ID);

  if (!priceId) {
    throw new Error(`Missing ${mode === 'test' ? 'STRIPE_PRICE_ID' : 'STRIPE_PRICE_ID_LIVE'} environment variable`);
  }

  return priceId;
} 
'use client'

import { useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { app } from '@/firebase/firebase'
import { Montserrat } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { Corners } from '@/components/ui/borders'
import { Button } from '@/components/ui/button'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function SubscribePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'success' | 'canceled'>('none')
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        // Force token refresh to get latest custom claims
        const idTokenResult = await user.getIdTokenResult(true)
        if (idTokenResult.claims.stripeRole) {
          // User is subscribed, redirect to studio
          router.push('/studio')
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  useEffect(() => {
    // Check URL parameters for subscription status
    if (searchParams.get('success') === 'true') {
      setSubscriptionStatus('success')
    } else if (searchParams.get('canceled') === 'true') {
      setSubscriptionStatus('canceled')
    }
  }, [searchParams])

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      setError(null);
      setIsRedirecting(true);
      const token = await user.getIdToken(true);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsRedirecting(false);
    }
  };

  if (loading) {
    return (
      <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center ${montserrat.className}`}>
        <div>Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Navbar />
      <Corners />
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-[#262223] mb-8">Subscribe to Gouda</h1>
        
        {subscriptionStatus === 'success' ? (
          <>
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-8">
              <p className="text-lg font-semibold">Thank you for subscribing!</p>
              <p>Your subscription has been activated. Come jam with us!</p>
            </div>
            <Button
              onClick={() => router.push('/studio')}
              className="w-full max-w-md mx-auto h-[48px] text-[18px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
            >
              Go to Studio
            </Button>
          </>
        ) : subscriptionStatus === 'canceled' ? (
          <>
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-8">
              <p className="text-lg font-semibold">Subscription not completed</p>
              <p>You can try subscribing again whenever you&apos;re ready.</p>
            </div>
            <p className="text-[#262223] text-lg mb-8">Get full access to Gouda Studio</p>
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <Button
              onClick={handleSubscribe}
              disabled={isRedirecting}
              className="w-full max-w-md mx-auto h-[48px] text-[18px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
            >
              {isRedirecting ? 'Redirecting...' : 'Subscribe Now'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-[#262223] text-lg mb-8">Get full access to Gouda Studio</p>
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}
            <Button
              onClick={handleSubscribe}
              disabled={isRedirecting}
              className="w-full max-w-md mx-auto h-[48px] text-[18px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
            >
              {isRedirecting ? 'Redirecting...' : 'Subscribe Now'}
            </Button>
          </>
        )}
      </div>
    </main>
  )
} 
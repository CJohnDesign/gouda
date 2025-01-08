'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import analytics from '@/lib/analytics'
import { Suspense } from 'react'

// Use environment variable for price ID
const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

// Validate price ID format
const isValidPriceId = (priceId: string | undefined): boolean => {
  return Boolean(priceId && typeof priceId === 'string' && priceId.startsWith('price_'));
};

function SubscriptionPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, refreshProfile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    // Only handle the params if they exist
    if (success || canceled) {
      if (success && sessionId) {
        analytics.trackSubscription('success', {
          transaction_id: sessionId,
          user_id: user?.uid,
          value: 1,
          currency: 'USD',
          items: [{
            item_name: 'Gouda Subscription',
            item_category: 'Subscription',
            price: 1,
            quantity: 1
          }]
        })

        toast({
          title: "Thanks for subscribing!",
          description: "Your subscription is now active.",
        })
        refreshProfile()
      }

      if (canceled) {
        analytics.trackSubscription('cancel', {
          user_id: user?.uid
        })

        toast({
          title: "Subscription canceled",
          description: "The subscription process was canceled.",
          variant: "destructive",
        })
      }

      // Remove the query parameters
      router.replace('/account/subscription')
    }
  }, [searchParams, refreshProfile, router, user?.uid, isMounted])

  const handleSubscriptionAction = async (retryCount = 0) => {
    if (!user) {
      setError('You must be logged in to manage your subscription')
      return
    }

    analytics.trackButtonClick(profile?.subscriptionStatus === 'Active' ? 'manage_subscription' : 'start_subscription', {
      user_id: user.uid,
      subscription_status: profile?.subscriptionStatus === 'Active' ? 'active' : 'inactive'
    })

    setIsLoading(true)
    setError(null)

    try {
      console.log('[Subscription] Starting subscription action:', {
        isActive: profile?.subscriptionStatus === 'Active',
        userId: user.uid,
        retryCount
      })

      const token = await user.getIdToken()
      console.log('[Subscription] Got auth token, length:', token.length)

      const endpoint = profile?.subscriptionStatus === 'Active'
        ? '/api/create-portal-session'
        : '/api/create-checkout-session'
      console.log('[Subscription] Using endpoint:', endpoint)

      if (profile?.subscriptionStatus !== 'Active') {
        analytics.trackSubscription('start', {
          user_id: user.uid
        })
      }

      console.log('[Subscription] Making API request')
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          endpoint === '/api/create-checkout-session'
            ? { priceId: isValidPriceId(PRICE_ID) ? PRICE_ID : undefined }
            : {}
        ),
      })

      console.log('[Subscription] API response status:', response.status)
      
      let data
      try {
        const textResponse = await response.text()
        console.log('[Subscription] Raw response:', textResponse)
        try {
          data = JSON.parse(textResponse)
          console.log('[Subscription] Parsed response:', data)
        } catch (parseError) {
          console.error('[Subscription] Failed to parse response as JSON:', parseError)
          console.error('[Subscription] Response was:', textResponse)
          throw new Error('Server returned invalid JSON response')
        }
      } catch (textError) {
        console.error('[Subscription] Failed to get response text:', textError)
        throw new Error('Failed to read server response')
      }

      if (!response.ok) {
        console.error('[Subscription] Request failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        })

        // Handle specific error status codes
        switch (response.status) {
          case 429: // Rate limit
            if (retryCount < 3) {
              console.log('[Subscription] Rate limited, retrying in 1s...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              return handleSubscriptionAction(retryCount + 1)
            }
            throw new Error('Too many requests. Please try again later.')
          case 503: // Network error
            if (retryCount < 3) {
              console.log('[Subscription] Network error, retrying in 2s...')
              await new Promise(resolve => setTimeout(resolve, 2000))
              return handleSubscriptionAction(retryCount + 1)
            }
            throw new Error('Network error. Please check your connection and try again.')
          default:
            throw new Error(data.error?.message || 'Failed to process subscription request')
        }
      }

      if (data.url) {
        console.log('[Subscription] Redirecting to:', data.url)
        window.location.href = data.url
      } else {
        console.error('[Subscription] No redirect URL in response:', data)
        throw new Error('No redirect URL received')
      }
    } catch (err) {
      console.error('[Subscription] Error:', err)
      console.error('[Subscription] Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        cause: err instanceof Error ? err.cause : undefined
      })

      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      analytics.trackError(
        err instanceof Error ? err : new Error(errorMessage),
        'SubscriptionPage',
        {
          user_id: user.uid,
          subscription_status: profile?.subscriptionStatus === 'Active' ? 'active' : 'inactive'
        }
      )

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Please log in to manage your subscription</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <Badge variant={profile?.subscriptionStatus === 'Active' ? "default" : "secondary"}>
            {profile?.subscriptionStatus === 'Active' ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        <Button
          onClick={() => handleSubscriptionAction(0)}
          disabled={isLoading || !isMounted}
          className="w-full"
        >
          {isLoading ? "Loading..." : profile?.subscriptionStatus === 'Active' ? "Manage Subscription" : "Subscribe Now"}
        </Button>
        {profile?.subscriptionStatus !== 'Active' && (!PRICE_ID || !isValidPriceId(PRICE_ID)) && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Subscription is currently unavailable. Please try again later.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription details...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">Loading...</Button>
        </CardContent>
      </Card>
    }>
      <SubscriptionPageContent />
    </Suspense>
  )
} 
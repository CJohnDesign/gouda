'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Use environment variable for price ID
const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile, refreshProfile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    // Only handle the params if they exist
    if (success || canceled) {
      if (success) {
        toast({
          title: "Thanks for subscribing!",
          description: "Your subscription is now active.",
        })
        refreshProfile()
      }

      if (canceled) {
        toast({
          title: "Subscription canceled",
          description: "The subscription process was canceled.",
          variant: "destructive",
        })
      }

      // Remove the query parameters
      router.replace('/account/subscription')
    }
  }, [searchParams, refreshProfile, router])

  const handleSubscriptionAction = async () => {
    if (!user) {
      setError('You must be logged in to manage your subscription')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = await user.getIdToken()
      const endpoint = profile?.isSubscribed
        ? '/api/create-portal-session'
        : '/api/create-checkout-session'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          endpoint === '/api/create-checkout-session'
            ? { priceId: PRICE_ID }
            : {}
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to process subscription request')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
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
          <Badge variant={profile?.isSubscribed ? "default" : "secondary"}>
            {profile?.isSubscribed ? "Active" : "Inactive"}
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
          onClick={handleSubscriptionAction}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Loading..." : profile?.isSubscribed ? "Manage Subscription" : "Subscribe Now"}
        </Button>
        {!profile?.isSubscribed && !PRICE_ID && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Subscription is currently unavailable. Please try again later.
          </p>
        )}
      </CardContent>
    </Card>
  )
} 
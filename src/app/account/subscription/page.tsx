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
import { WaitlistDialog } from '@/components/subscription/waitlist-dialog'

// Use environment variable for price ID
const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

// Validate price ID format
const isValidPriceId = (priceId: string | undefined): boolean => {
  return Boolean(priceId && typeof priceId === 'string' && priceId.startsWith('price_'));
};

function SubscriptionPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, profile } = useUserProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [showWaitlist, setShowWaitlist] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubscriptionAction = () => {
    if (!user) {
      setError('You must be logged in to manage your subscription')
      return
    }

    // Show waitlist dialog for all users
    setShowWaitlist(true)
    analytics.trackButtonClick('show_waitlist_dialog', {
      user_id: user.uid,
      subscription_status: profile?.subscriptionStatus || 'inactive'
    })
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
    <>
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
            onClick={handleSubscriptionAction}
            disabled={isLoading || !isMounted}
            className="w-full"
          >
            {isLoading ? "Loading..." : profile?.subscriptionStatus === 'Active' ? "Manage Subscription" : "Subscribe Now"}
          </Button>
        </CardContent>
      </Card>

      <WaitlistDialog 
        open={showWaitlist} 
        onOpenChange={setShowWaitlist}
      />
    </>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  )
} 
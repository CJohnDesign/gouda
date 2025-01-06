'use client'

import { Button } from '@/components/ui/button'
import { SubscriptionStatusPill } from '@/components/ui/SubscriptionStatusPill'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Default price ID for the subscription
const DEFAULT_PRICE_ID = 'price_1Qd4P2RwSvLAD8QUNaekxrED'

export default function SubscriptionPage() {
  const { user, profile } = useUserProfile()
  const [error, setError] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleSubscriptionAction = async () => {
    if (!user) {
      setError('You must be logged in to manage your subscription')
      return
    }

    try {
      const token = await user.getIdToken()
      const endpoint = profile?.isSubscribed
        ? '/api/create-portal-session'
        : '/api/create-checkout-session'

      const requestBody = endpoint === '/api/create-checkout-session'
        ? { priceId: DEFAULT_PRICE_ID }
        : {}

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
    } catch (error) {
      console.error('Subscription error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleCancelSubscription = async () => {
    if (!user) {
      setError('You must be logged in to cancel your subscription')
      return
    }

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to cancel subscription')
      }

      window.location.reload()
    } catch (error) {
      console.error('Cancel subscription error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground">Please log in to manage your subscription</div>
      </div>
    )
  }

  const buttonText = profile?.isSubscribed ? 'Manage Billing' : 'Subscribe Now'

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      <div className="bg-background rounded-lg border border-border p-6">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Subscription Status</span>
          <SubscriptionStatusPill status={profile?.isSubscribed ? 'Active' : 'Unpaid'} />
        </div>

        <div className="mb-6">
          <hr className="w-full border-t border-border" />
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleSubscriptionAction}
            className="w-full"
          >
            {buttonText}
          </Button>

          {profile?.isSubscribed && (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              className="w-full"
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 
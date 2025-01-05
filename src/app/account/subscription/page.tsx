'use client'

import { Button } from '@/components/ui/button'
import { SubscriptionStatusPill } from '@/components/ui/SubscriptionStatusPill'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useState, useEffect } from 'react'
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

export default function SubscriptionPage() {
  const { user, profile, loading, error: profileError } = useUserProfile();
  const [error, setError] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Log user and profile data when they change
  useEffect(() => {
    if (user) {
      console.log('Current user:', {
        uid: user.uid,
        email: user.email,
      });
    }
    if (profile) {
      console.log('Current profile:', profile);
    }
  }, [user, profile]);

  const handleSubscriptionAction = async () => {
    if (!user) return;
    setError(null);

    try {
      const token = await user.getIdToken();
      const endpoint = profile?.subscriptionStatus === 'Active' 
        ? '/api/create-portal-session'  // For active subscribers - go to portal
        : '/api/create-checkout-session'; // For unpaid - go to checkout

      console.log('Making request to:', endpoint);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let errorMessage = 'Failed to create session';
      
      try {
        const data = await response.json();
        if (!response.ok) {
          errorMessage = data.error?.message || errorMessage;
          throw new Error(errorMessage);
        }
        
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No URL received');
        }
      } catch (parseError) {
        // If we can't parse the JSON, use the response status text
        console.log('Parse error:', parseError);
        if (!response.ok) {
          errorMessage = `Request failed: ${response.statusText || errorMessage}`;
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error handling subscription action:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    setError(null);

    try {
      const token = await user.getIdToken();
      console.log('Making cancel request for user:', user.uid);
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Cancel response status:', response.status);
      let errorMessage = 'Failed to cancel subscription';
      
      try {
        const data = await response.json();
        console.log('Cancel response data:', data);
        if (!response.ok) {
          errorMessage = data.error?.message || errorMessage;
          throw new Error(errorMessage);
        }
        
        // Refresh the page to show updated status
        window.location.reload();
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If we can't parse the JSON, use the response status text
        if (!response.ok) {
          errorMessage = `Request failed: ${response.statusText || errorMessage}`;
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isActive = profile?.subscriptionStatus === 'Active';
  const buttonText = isActive ? 'Manage Billing' : 'Subscribe Now';

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      <div className="bg-background rounded-lg border border-border p-6">
        {(error || profileError) && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            {error || profileError}
          </div>
        )}
        
        <div className="mb-6 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Subscription Status</span>
          <SubscriptionStatusPill status={profile?.subscriptionStatus || 'Unpaid'} />
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
          {isActive && (
            <>
              <Button 
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
              >
                Cancel Subscription
              </Button>

              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You&apos;ll lose access to all premium features, including the Telegram community and future updates. 
                      Your subscription will remain active until the end of your current billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Cancel Subscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client'

import { Button } from '@/components/ui/button'
import { SubscriptionStatusPill } from '@/components/ui/SubscriptionStatusPill'
import { useUserProfile } from '@/contexts/UserProfileContext'

export default function SubscriptionPage() {
  const { user, profile, loading, error } = useUserProfile();

  const handleManageBilling = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create portal session');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#262223]">Subscription</h1>
        <p className="text-sm text-[#262223]/60">Manage your subscription and billing details</p>
      </div>

      <div className="bg-white rounded-lg border border-[#262223]/10 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-6 flex items-center justify-between">
          <span className="text-[#262223]/80 font-medium">Subscription Status</span>
          <SubscriptionStatusPill status={profile?.subscriptionStatus || 'Unpaid'} />
        </div>
        <div className="mb-6">
          <hr className="w-full border-t border-[#262223]/10" />
        </div>
        <Button 
          onClick={handleManageBilling}
          className="w-full bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-[#262223]"
        >
          Manage Subscription
        </Button>
      </div>
    </div>
  );
} 
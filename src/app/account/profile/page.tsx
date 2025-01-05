'use client'

import { useState, useEffect } from 'react'
import type { UserProfile } from '@/types/user'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Rocket } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useUserProfile();
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' });
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('subscription') === 'active';

  // Initialize localProfile when profile is loaded
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user || !localProfile) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localProfile),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const errorMessage = data?.error?.message || response.statusText || 'Failed to update profile';
        throw new Error(errorMessage);
      }
      
      await refreshProfile();
      setToastMessage({
        title: 'Success',
        description: 'Your profile has been updated.',
        type: 'success'
      });
    } catch (error) {
      setToastMessage({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error'
      });
    }
    setShowToast(true);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (localProfile) {
      setLocalProfile({ ...localProfile, [field]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !localProfile) {
    return null; // Router will redirect
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        {showWelcome && (
          <Alert className="bg-primary/10 text-primary border-primary">
            <Rocket className="h-4 w-4" />
            <AlertTitle>Welcome to the community!</AlertTitle>
            <AlertDescription>
              Take a moment to complete your profile. This helps us better understand our community and provide you with a more personalized experience.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your username and manage your account
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Telegram Username
            </label>
            <div className="flex relative z-10">
              <div className="flex items-center px-3 py-2 bg-muted border border-r-0 rounded-l-md border-border text-muted-foreground">
                @
              </div>
              <input
                type="text"
                value={localProfile?.telegramUsername || ''}
                onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                className="flex-1 px-3 py-2 bg-background border rounded-r-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="username"
              />
            </div>
            {localProfile?.subscriptionStatus === 'Active' && !localProfile.telegramUsername && (
              <div className="mt-2 p-3 bg-muted text-muted-foreground rounded-md text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                You&apos;re in! Add your Telegram handle to be automatically added to the group.
              </div>
            )}
            {localProfile?.subscriptionStatus === 'Unpaid' && (
              <div className="mt-4 mb-4 p-4 bg-muted text-muted-foreground rounded-md border border-border">
                <p className="text-sm mt-1">You&apos;re almost there! <a href="/account/subscription" className="text-primary hover:text-primary/90">Subscribe</a>
                {' '}to get access to the telegram community.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                First Name
              </label>
              <input
                type="text"
                value={localProfile?.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-background border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Name
              </label>
              <input
                type="text"
                value={localProfile?.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-background border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              className="mt-1 w-full px-3 py-2 bg-muted border rounded-md border-border cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Phone Number
            </label>
            <input
              type="tel"
              value={localProfile?.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Location
            </label>
            <input
              type="text"
              value={localProfile?.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1 w-full px-3 py-2 bg-background border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Bio
            </label>
            <textarea
              value={localProfile?.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="mt-1 w-full px-3 py-2 bg-background border rounded-md border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          className={toastMessage.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}
          onOpenChange={(open) => !open && setShowToast(false)}
        >
          <div>
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </div>
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}

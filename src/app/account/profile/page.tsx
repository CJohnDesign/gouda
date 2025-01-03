'use client'

import { useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { app } from '@/firebase/firebase'
import type { UserProfile } from '@/types/user'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'
import { SubscriptionStatusPill } from '@/components/ui/SubscriptionStatusPill'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' })
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        try {
            const token = await user.getIdToken(); 
            const response = await fetch('/api/user-profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch profile')
          }

          setProfile(data)
        } catch (error) {
          console.error('Error fetching profile:', error)
          setToastMessage({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to fetch profile',
            type: 'error'
          })
          setShowToast(true)
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  const handleSave = async () => {
    if (!user || !profile) return

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      console.log('Profile update response:', {
        status: response.status,
        statusText: response.statusText
      });

      const data = await response.json().catch((e) => {
        console.error('JSON parse error:', e);
        return null;
      });

      console.log('Response data:', data);

      if (!response.ok) {
        const errorMessage = data?.error?.message || response.statusText || 'Failed to update profile';
        console.error('Update failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      setToastMessage({
        title: 'Success',
        description: 'Your profile has been updated.',
        type: 'success'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      setToastMessage({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error'
      })
    }
    setShowToast(true)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#262223]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect
  }

  return (
    <ToastProvider>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
            <p className="text-sm text-gray-500">
              Update your username and manage your account
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#de9c0e] text-[#262223] rounded-md hover:bg-[#de9c0e]/90 transition-colors"
          >
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Telegram Username
            </label>
            <div className="flex relative z-10">
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-r-0 rounded-l-md border-gray-200 text-gray-500">
                @
              </div>
              <input
                type="text"
                value={profile?.telegramUsername || ''}
                onChange={(e) => handleInputChange('telegramUsername', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-r-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
                placeholder="username"
              />
            </div>
            {profile?.subscriptionStatus === 'Active' && !profile.telegramUsername && (
              <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                You're in! Add your Telegram handle to be automatically added to the group.
              </div>
            )}
             {profile?.subscriptionStatus === 'Unpaid' && (
          <div className="mt-4 mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-100">
            <p className="text-sm mt-1">You're almost there!  <a href="/account/subscription" className="text-yellow-900 underline hover:text-yellow-700">Subscribe</a>
            {' '}to get access to the telegram community.</p>
          </div>
        )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={profile?.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={profile?.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={user.email || ''}
              className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 bg-gray-50 cursor-not-allowed"
              readOnly
              disabled
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile?.phoneNumber || ''}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={profile?.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              value={profile?.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
              className="mt-1 w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#de9c0e] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          className={toastMessage.type === 'error' ? 'bg-red-50' : 'bg-green-50'}
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
  )
}

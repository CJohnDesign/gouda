'use client'

import { useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { app } from '@/firebase/firebase'
import type { UserProfile } from '@/types/user'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

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
          const token = await user.getIdToken()
          const response = await fetch('/api/user-profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          if (!response.ok) {
            throw new Error('Failed to fetch profile')
          }
          const profileData = await response.json()
          setProfile(profileData)
        } catch (error) {
          console.error('Error fetching profile:', error)
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

      if (!response.ok) {
        throw new Error('Failed to update profile')
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
        description: 'Failed to update your profile. Please try again.',
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
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Router will redirect
  }

  return (
    <ToastProvider>
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[#262223]">Profile</h3>
              <p className="text-sm text-[#262223]/60">
                Manage your account settings and profile information.
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#de9c0e] text-[#262223] rounded-md hover:bg-[#de9c0e]/90 transition-colors"
            >
              Save Changes
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#262223]">
                Telegram Username
              </label>
              <input
                type="text"
                value={profile?.displayName || ''}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
                placeholder="@username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#262223]">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile?.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#262223]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile?.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#262223]">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
                readOnly
                disabled
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#262223]">
                Phone Number
              </label>
              <input
                type="tel"
                value={profile?.phoneNumber || ''}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#262223]">
                Location
              </label>
              <input
                type="text"
                value={profile?.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#262223]">
                Bio
              </label>
              <textarea
                value={profile?.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-md border-[#262223]/10 focus:outline-none focus:ring-2 focus:ring-[#de9c0e]"
              />
            </div>
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

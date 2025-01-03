'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getAuth, User } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import type { UserProfile } from '@/types/user'
import { SubscriptionStatusPill } from '@/components/ui/SubscriptionStatusPill'

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        try {
          console.log('Fetching user profile...')
          const token = await user.getIdToken()
          const response = await fetch('/api/user-profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          if (!response.ok) {
            const errorData = await response.json()
            console.error('Profile fetch failed:', { status: response.status, error: errorData })
            throw new Error(errorData.error?.details || errorData.error?.message || 'Failed to fetch profile')
          }
          const profileData = await response.json()
          console.log('Profile data received:', profileData)
          setProfile(profileData)
        } catch (error) {
          console.error('Error fetching profile:', error)
          setError(error instanceof Error ? error.message : 'Failed to fetch profile')
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  const handleManageBilling = async () => {
    if (!user) {
      console.error('No user found')
      return
    }

    try {
      console.log('Creating portal session...')
      const token = await user.getIdToken()
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Portal session creation failed:', { status: response.status, error: errorData })
        throw new Error(errorData.error?.message || 'Failed to create portal session')
      }

      const data = await response.json()
      console.log('Portal session created:', data)
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      setError(error instanceof Error ? error.message : 'Failed to create portal session')
    }
  }

  if (loading) {
    return <div>Loading...</div>
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
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getAuth, User } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import type { UserProfile } from '@/types/user'

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  const handleManageBilling = async () => {
    if (!user) return

    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
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
        <p className="text-[#262223]/60 mb-6">Manage your subscription and payment details through our secure Stripe portal.</p>
        
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
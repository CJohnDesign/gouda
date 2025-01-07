'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/client'
import analytics from '@/lib/analytics'

interface UserProfile {
  isSubscribed: boolean
  email: string
  displayName: string | null
  photoURL: string | null
  uid: string
  createdAt: string
  updatedAt: string
}

interface UserProfileContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  refreshProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = async (user: User) => {
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const data = await response.json()
      setProfile(data)

      // Track user identification in analytics
      analytics.identify(user.uid, {
        email_domain: user.email?.split('@')[1],
        subscription_status: data.isSubscribed ? 'active' : 'inactive',
        display_name: user.displayName,
        created_at: data.createdAt
      })

    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'))
      
      analytics.trackError(
        err instanceof Error ? err : new Error('Failed to fetch user profile'),
        'UserProfileContext',
        { user_id: user.uid }
      )
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setIsLoading(true)
      setError(null)

      if (user) {
        await fetchProfile(user)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)
    await fetchProfile(user)
    setIsLoading(false)
  }

  return (
    <UserProfileContext.Provider
      value={{
        user,
        profile,
        isLoading,
        error,
        refreshProfile
      }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return context
} 
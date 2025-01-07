'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/client'
import analytics from '@/lib/analytics'
import { usePathname } from 'next/navigation'

interface UserProfile {
  // Core identity fields
  id: string
  uid: string
  email: string
  name: string
  displayName?: string
  firstName?: string
  lastName?: string
  
  // Profile fields
  bio?: string
  location?: string
  avatarUrl?: string
  profilePicUrl?: string
  phoneNumber?: string
  telegramUsername?: string

  // Collections/Lists
  playlists: string[]
  favoriteSongs: string[]
  favoriteArtists: string[]
  favoriteAlbums: string[]

  // Stripe billing fields
  stripeCustomerId?: string
  subscriptionStatus?: 'Active' | 'Unpaid' | 'Cancelled'
  stripePaymentMethods?: string[]
  stripeBillingDetails?: {
    address?: {
      city: string
      country: string
      line1: string
      line2?: string
      postal_code: string
      state: string
    }
    email?: string
    name?: string
    phone?: string
  }
  
  // Timestamps
  createdAt: string | { _seconds: number; _nanoseconds: number }
  updatedAt?: string | { _seconds: number; _nanoseconds: number } | null

  // Metadata flags
  metadata: {
    isPublished: boolean
    isFeatured: boolean
    isPrivate: boolean
    isDeleted: boolean
    isDraft: boolean
    isPending: boolean
    isApproved: boolean
    isRejected: boolean
    isHidden: boolean
  }
}

interface UserProfileContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  error: Error | null
  refreshProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

const PUBLIC_ROUTES = ['/', '/login', '/join']

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const pathname = usePathname()

  const fetchProfile = useCallback(async (user: User) => {
    try {
      // Don't fetch profile on public routes
      if (PUBLIC_ROUTES.includes(pathname || '')) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      // For non-public routes, we'll accept a minimal profile
      // as long as we have a user ID from Firebase
      if (!data.id) {
        data.id = user.uid // Use Firebase UID if profile ID is missing
      }
      if (!data.email) {
        data.email = user.email || '' // Use Firebase email if profile email is missing
      }

      setProfile(data)

      // Track user identification in analytics
      analytics.identify(user.uid, {
        email_domain: user.email?.split('@')[1],
        subscription_status: data.subscriptionStatus || 'Unpaid',
        display_name: data.name,
        created_at: data.createdAt,
        location: data.location,
        metadata: data.metadata
      })

    } catch (err) {
      console.error('Error fetching user profile:', err)
      // Create a minimal profile if fetch fails
      setProfile({
        id: user.uid,
        uid: user.uid,
        email: user.email || '',
        name: '',
        playlists: [],
        favoriteSongs: [],
        favoriteArtists: [],
        favoriteAlbums: [],
        metadata: {
          isPublished: false,
          isFeatured: false,
          isPrivate: true,
          isDeleted: false,
          isDraft: false,
          isPending: false,
          isApproved: false,
          isRejected: false,
          isHidden: false
        },
        createdAt: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }, [pathname])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setError(null)

      if (user) {
        // Don't fetch profile on public routes
        if (!PUBLIC_ROUTES.includes(pathname || '')) {
          setIsLoading(true)
          await fetchProfile(user)
        } else {
          setProfile(null)
          setIsLoading(false)
        }
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [pathname, fetchProfile])

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
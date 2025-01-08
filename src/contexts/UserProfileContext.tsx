'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/client'
import { db } from '@/firebase/firebase'
import { usePathname } from 'next/navigation'
import { doc, onSnapshot } from 'firebase/firestore'

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
  isDarkMode?: boolean

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
  const themeUnsubscribeRef = useRef<(() => void) | null>(null)

  const fetchProfile = useCallback(async (user: User) => {
    try {
      // Clean up any existing theme listener
      if (themeUnsubscribeRef.current) {
        themeUnsubscribeRef.current()
        themeUnsubscribeRef.current = null
      }

      // Don't fetch profile on public routes
      if (PUBLIC_ROUTES.includes(pathname || '')) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      console.log('[UserProfile] Starting profile fetch for user:', user.uid)
      const token = await user.getIdToken()
      console.log('[UserProfile] Got auth token, length:', token.length)

      console.log('[UserProfile] Making API request to /api/user-profile')
      const response = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('[UserProfile] API response status:', response.status)

      if (!response.ok) {
        // Try to parse error message if available
        let errorMessage = 'Failed to fetch profile'
        let errorDetails = null
        let responseText = null
        try {
          // First try to get the raw response text
          responseText = await response.text()
          console.error('[UserProfile] Raw error response:', responseText)
          
          try {
            // Then try to parse it as JSON
            const errorData = JSON.parse(responseText)
            console.error('[UserProfile] API error response:', errorData)
            errorMessage = errorData.error || errorMessage
            errorDetails = errorData.details || null
          } catch (jsonError) {
            // If we can't parse JSON, log both the raw text and parse error
            console.error('[UserProfile] Failed to parse error response as JSON:', jsonError)
            console.error('[UserProfile] Response was not JSON:', {
              status: response.status,
              statusText: response.statusText,
              contentType: response.headers.get('content-type'),
              responseText
            })
            // If it's HTML (likely a Next.js error page), extract any error message
            if (responseText.includes('<!DOCTYPE html>')) {
              console.error('[UserProfile] Received HTML error page instead of JSON response')
              // Try to extract error message from HTML without using 's' flag
              const errorMatch = responseText.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)
              if (errorMatch) {
                errorDetails = errorMatch[1].trim()
              }
            }
          }
        } catch (textError) {
          // If we can't even get the response text
          console.error('[UserProfile] Failed to read error response:', textError)
          console.error('[UserProfile] Response details:', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type')
          })
        }
        throw new Error(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`)
      }

      console.log('[UserProfile] Parsing response data')
      const data = await response.json()
      console.log('[UserProfile] Received profile data:', {
        id: data.id,
        email: data.email,
        hasMetadata: !!data.metadata,
        dataKeys: Object.keys(data)
      })

      // For non-public routes, we'll accept a minimal profile
      // as long as we have a user ID from Firebase
      if (!data.id) {
        console.log('[UserProfile] No ID in profile data, using Firebase UID')
        data.id = user.uid // Use Firebase UID if profile ID is missing
      }
      if (!data.email) {
        console.log('[UserProfile] No email in profile data, using Firebase email')
        data.email = user.email || '' // Use Firebase email if profile email is missing
      }

      // Ensure isDarkMode is false for public routes
      data.isDarkMode = PUBLIC_ROUTES.includes(pathname || '') ? false : (data.isDarkMode ?? false)
      console.log('[UserProfile] Setting profile data')
      setProfile(data)

      // Set up real-time listener for profile updates
      console.log('[UserProfile] Setting up Firestore listener')
      const userRef = doc(db, 'users', user.uid)
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data()
          console.log('[UserProfile] Real-time update received:', {
            hasData: !!userData,
            dataKeys: userData ? Object.keys(userData) : []
          })
          // Update profile
          setProfile(prev => {
            if (!prev) return null
            return { ...prev, ...userData }
          })
        } else {
          console.log('[UserProfile] Document does not exist in real-time update')
        }
      }, (error) => {
        console.error('[UserProfile] Firestore listener error:', error)
      })

      // Store the unsubscribe function
      themeUnsubscribeRef.current = unsubscribe

    } catch (err) {
      console.error('[UserProfile] Error in fetchProfile:', err)
      if (err instanceof Error) {
        console.error('[UserProfile] Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
      }
      // Create a minimal profile if fetch fails
      console.log('[UserProfile] Creating minimal profile due to error')
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
      // Set error state
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
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
        // Clean up any existing theme listener when user signs out
        if (themeUnsubscribeRef.current) {
          themeUnsubscribeRef.current()
          themeUnsubscribeRef.current = null
        }
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      // Clean up auth listener and theme listener
      unsubscribe()
      if (themeUnsubscribeRef.current) {
        themeUnsubscribeRef.current()
        themeUnsubscribeRef.current = null
      }
    }
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
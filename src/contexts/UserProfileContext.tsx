'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

interface UserProfile {
  name?: string
  avatarUrl?: string
  stripeCustomerId?: string
  isSubscribed?: boolean
}

interface UserProfileContextType {
  user: User | null
  profile: UserProfile | null
  signOut: () => Promise<void>
  loading: boolean
  refreshProfile: () => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  signOut: async () => {},
  loading: true,
  refreshProfile: async () => {}
})

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)
  const db = getFirestore(app)

  const fetchProfile = async (userId: string) => {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      setProfile(docSnap.data() as UserProfile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await fetchProfile(user.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, db])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid)
    }
  }

  return (
    <UserProfileContext.Provider value={{ user, profile, signOut, loading, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = () => useContext(UserProfileContext) 
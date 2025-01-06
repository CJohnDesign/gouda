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
}

const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  profile: null,
  signOut: async () => {},
})

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const auth = getAuth(app)
  const db = getFirestore(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
      } else {
        setProfile(null)
      }
    })

    return () => unsubscribe()
  }, [auth, db])

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <UserProfileContext.Provider value={{ user, profile, signOut }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export const useUserProfile = () => useContext(UserProfileContext) 
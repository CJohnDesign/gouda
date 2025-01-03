'use client'

import { useState, useEffect } from 'react'
import { getAuth, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { app } from '@/firebase/firebase'
import { Montserrat } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { Corners } from '@/components/ui/borders'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function StudioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user)
        // Get latest custom claims
        const idTokenResult = await user.getIdTokenResult(true)
        
        // If not subscribed, fetch profile to double-check subscription status
        if (!idTokenResult.claims.stripeRole) {
          try {
            const token = await user.getIdToken()
            const response = await fetch('/api/user-profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            })
            const profileData = await response.json()
            
            // If not subscribed in Firestore either, redirect to subscribe page
            if (profileData.subscriptionStatus !== 'active') {
              router.push('/subscribe')
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
            router.push('/subscribe')
          }
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, router])

  if (loading) {
    return (
      <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center ${montserrat.className}`}>
        <div>Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Navbar />
      <Corners />
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-[#262223] mb-8">Welcome to your studio space!</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-lg text-[#262223]">
            You have full access to all studio features.
          </p>
        </div>
      </div>
    </main>
  )
} 
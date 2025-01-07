'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { app } from '@/firebase/firebase'

export default function AuthHandler() {
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    // Check if this is an email sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email from localStorage
      let email = window.localStorage.getItem('emailForSignIn')
      if (!email) {
        email = window.prompt('Please provide your email for confirmation')
      }

      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            console.log('Successfully signed in with email link')
            window.localStorage.removeItem('emailForSignIn')
            router.push('/songbook')
          })
          .catch((error) => {
            console.error('Error signing in with email link:', error)
            router.push('/login')
          })
      } else {
        router.push('/login')
      }
    } else {
      // Not a sign-in link, redirect to home
      router.push('/')
    }
  }, [auth, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-center">
        <h1 className="text-2xl font-bold mb-4">Completing sign in...</h1>
        <p>Please wait while we verify your credentials.</p>
      </div>
    </div>
  )
} 
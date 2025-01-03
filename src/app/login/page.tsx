'use client'

import { useState, useEffect } from 'react'
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'
import { Montserrat } from 'next/font/google'
import { Navbar } from '@/components/ui/Navbar'
import { Corners } from '@/components/ui/borders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [isProcessingLink, setIsProcessingLink] = useState(false)
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/account/subscription')
      }
    })

    return () => unsubscribe()
  }, [auth, router])

  useEffect(() => {
    // Check if the URL contains a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setIsProcessingLink(true)
      
      // Get the email from localStorage
      let emailForSignIn = window.localStorage.getItem('emailForSignIn')
      
      if (!emailForSignIn) {
        // If email is not in storage, prompt user for it
        emailForSignIn = window.prompt('Please provide your email for confirmation')
      }

      if (emailForSignIn) {
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then(() => {
            // Clear the email from storage
            window.localStorage.removeItem('emailForSignIn')
            // Redirect to subscription page after successful sign-in
            router.push('/account/subscription')
          })
          .catch((error) => {
            setError(error.message)
            setIsProcessingLink(false)
          })
      } else {
        setError('Please provide your email to complete sign in')
        setIsProcessingLink(false)
      }
    }
  }, [auth, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/login',
        handleCodeInApp: true
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      
      // Save the email for later use
      window.localStorage.setItem('emailForSignIn', email)
      setEmailSent(true)
      setError('')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  if (isProcessingLink) {
    return (
      <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center ${montserrat.className}`}>
        <div>Completing sign in...</div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Navbar />
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-[#262223] mb-4">Login</h1>
        <p className="text-[#262223] text-lg mb-8">Sign in or create an account</p>
        
        {emailSent ? (
          <div className="space-y-4">
            <div className="text-[#262223] text-lg">
              Check your email! We&apos;ve sent you a magic link to sign in.
            </div>
            <div className="text-[#262223] text-sm mt-2">
              The link will expire in 15 minutes for security.
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full h-[48px] text-[18px] bg-white border-[#de9c0e] focus:border-[#de9c0e] focus:ring-[#de9c0e]"
              />
              
              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                className="w-full h-[48px] text-[21px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
              >
                SEND MAGIC LINK
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-[#262223]">
              <h2 className="font-bold text-sm">How it works</h2>
              <div className="text-xs space-y-2">
                <p>1. Enter your email address above</p>
                <p>2. We&apos;ll send you a secure magic link</p>
                <p>3. Click the link to sign in instantly</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
} 
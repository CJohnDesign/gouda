'use client'

import { useState, useEffect } from 'react'
import { getAuth, sendSignInLinkToEmail } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlatform, getEmailService } from '@/lib/platform'

const montserrat = Montserrat({ subsets: ['latin'] })

const EMAIL_LINKS = {
  desktop: [
    { name: 'Gmail', url: 'https://mail.google.com', platform: 'desktop', service: 'gmail' },
    { name: 'Outlook', url: 'https://outlook.com', platform: 'desktop', service: 'outlook' },
    { name: 'ProtonMail', url: 'https://mail.protonmail.com', platform: 'desktop', service: 'proton' },
  ],
  mobile: [
    { name: 'Apple Mail', url: 'message://', platform: 'apple' },
    { name: 'Gmail App', url: 'googlegmail://', platform: 'android', service: 'gmail' },
    { name: 'Android Mail', url: 'content://com.android.email', platform: 'android' },
  ]
}

export default function JoinPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [platform, setPlatform] = useState('unknown')
  const [emailService, setEmailService] = useState('gmail')
  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    setPlatform(getPlatform())
  }, [])

  // Update email service whenever email changes
  useEffect(() => {
    setEmailService(getEmailService(email))
  }, [email])

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/songbook')
      }
    })

    return () => unsubscribe()
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

  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-[#262223] mb-8">Learn Music Better</h1>
        <p className="text-[#262223] text-lg mb-8">Sign up for Gouda &amp; Company to get <strong>weekly group lessons</strong>, instructional videos and a helpful community.</p>
        {emailSent ? (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
              <AlertDescription className="text-[#262223]">
                <div className="text-lg mb-4">
                  Check your email!<br/>There&apos;s a link to get in!
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-bold mb-2">Open your email:</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {EMAIL_LINKS.desktop.map((link) => (
                      <Button
                        key={link.name}
                        variant={emailService === link.service ? 'default' : 'outline'}
                        asChild
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="md:hidden">
                  <div className="text-sm font-bold mb-2">Open email in:</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {EMAIL_LINKS.mobile.map((link) => (
                      <Button
                        key={link.name}
                        variant={platform === link.platform ? 'default' : 'outline'}
                        asChild
                      >
                        <a href={link.url}>
                          {link.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
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
              Join Now
            </Button>
          </form>
        )}
        <p className="mt-4 text-[14px] text-[#262223]">
          Already have an account? <Link href="/login" className="text-[#de9c0e] hover:underline">Login</Link>
        </p>
      </div>
    </main>
  )
} 
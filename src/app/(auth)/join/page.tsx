'use client'

import { useState, useEffect } from 'react'
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink } from 'firebase/auth'
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

  useEffect(() => {
    setEmailService(getEmailService(email))
  }, [email])

  // Check for sign-in link
  useEffect(() => {
    const checkSignInLink = async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          console.log('Detected sign-in link, redirecting to auth handler...')
          router.push(`/auth/handler${window.location.search}`)
        }
      } catch (error) {
        console.error('Error checking sign-in link:', error)
      }
    }

    checkSignInLink()
  }, [auth, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      console.log('Attempting to send magic link to:', email)
      console.log('Using app URL:', process.env.NEXT_PUBLIC_APP_URL)
      
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/handler`,
        handleCodeInApp: true
      }

      console.log('Action code settings:', actionCodeSettings)

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      console.log('Magic link sent successfully')
      
      // Save the email for confirmation
      window.localStorage.setItem('emailForSignIn', email)
      setEmailSent(true)
      setError('')
    } catch (error) {
      console.error('Error sending magic link:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-foreground mb-8">Learn Music Better</h1>
        <p className="text-foreground text-lg mb-8">Sign up for Gouda &amp; Company to get <strong>weekly group lessons</strong>, instructional videos and a helpful community.</p>
        {emailSent ? (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
              <AlertDescription className="text-foreground">
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
              className="w-full h-[48px] text-[18px] bg-white dark:bg-input border-primary focus:border-primary focus:ring-primary text-foreground"
            />
            
            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit"
              className="w-full h-[48px] text-[21px] leading-[32px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Join Now
            </Button>
          </form>
        )}
        <p className="mt-4 text-[14px] text-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </main>
  )
} 
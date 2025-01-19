'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlatform, getEmailService } from '@/lib/platform'
import { useAuthFlow } from '@/lib/auth/use-auth-flow'
import { AUTH_ROUTES } from '@/lib/auth/routes'
import { useState, useEffect } from 'react'
import { Logo } from '@/components/ui/Logo'

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

export default function LoginPage() {
  const [platform, setPlatform] = useState('unknown')
  const [emailService, setEmailService] = useState('gmail')
  
  const {
    email,
    error,
    emailSent,
    isProcessing,
    setEmail,
    handleSubmit,
  } = useAuthFlow({ returnUrl: AUTH_ROUTES.LOGIN })

  useEffect(() => {
    setPlatform(getPlatform())
  }, [])

  useEffect(() => {
    setEmailService(getEmailService(email))
  }, [email])

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <Logo />
        <h1 className="text-3xl font-bold text-foreground mb-4">Login</h1>
        <p className="text-foreground text-lg mb-8">Sign in or create an account</p>

        {emailSent ? (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-700/10">
              <AlertDescription className="text-foreground">
                <div className="text-lg mb-4">
                  Check your email!<br/><strong>There&apos;s a link to get in!</strong>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm mb-2">Open your email:</div>
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
            <div className="text-muted-foreground text-sm mt-2">
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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[48px] text-[18px] bg-white dark:bg-input border-primary focus:border-primary focus:ring-primary text-foreground"
                disabled={isProcessing}
              />
              
              {error && (
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                className="w-full h-[48px] text-[21px] leading-[32px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isProcessing}
              >
                {isProcessing ? 'SENDING...' : 'SEND MAGIC LINK'}
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-foreground">
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
'use client'

import { useState, useEffect } from 'react'
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, getAdditionalUserInfo } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'
import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPlatform, getEmailService } from '@/lib/platform'
import { FirebaseError } from 'firebase/app'

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
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [platform, setPlatform] = useState('unknown')
  const [emailService, setEmailService] = useState('gmail')
  const router = useRouter()
  const auth = getAuth(app)

  useEffect(() => {
    // Check if this is a sign-in with email link.
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Get the email if available. This should be available if the user completes
      // the flow on the same device where they started it.
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again.
        email = window.prompt('Please provide your email for confirmation');
      }
      // Ensure we have an email before attempting sign in
      if (email) {
        // The client SDK will parse the code from the link for you.
        signInWithEmailLink(auth, email, window.location.href)
          .then((result) => {
            // Clear email from storage.
            window.localStorage.removeItem('emailForSignIn');
            
            // Check if this is actually a new user
            const additionalInfo = getAdditionalUserInfo(result);
            const isNewUser = additionalInfo?.isNewUser ?? false;
            
            // Add newUser flag if they are actually new, regardless of entry point
            const redirectUrl = isNewUser 
              ? '/songbook?newUser=true'
              : '/songbook';
              
            console.log('Sign in successful:', {
              isNewUser,
              email: result.user.email,
              uid: result.user.uid
            });
            
            // Redirect to app
            router.push(redirectUrl);
          })
          .catch((error) => {
            console.error('Error signing in with email link:', error);
            setError('Error signing in. Please try again.');
          });
      } else {
        setError('Email is required to complete sign in.');
      }
    }
  }, [auth, router]);

  useEffect(() => {
    setPlatform(getPlatform())
  }, [])

  useEffect(() => {
    setEmailService(getEmailService(email))
  }, [email])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      console.log('Attempting to send magic link to:', email)
      
      // Must be absolute URL
      const url = `${window.location.origin}/login`  // Changed to /login since we handle the auth here
      console.log('Using callback URL:', url)
      
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: url,
        // This must be true for email link sign-in
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      console.log('Magic link sent successfully')
      
      // Save the email for confirmation
      window.localStorage.setItem('emailForSignIn', email)
      setEmailSent(true)
      setError('')
    } catch (error) {
      console.error('Error sending magic link:', error)
      // Handle specific error codes
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-email') {
          setError('Please enter a valid email address.')
        } else if (error.code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for email sign-in.')
        } else {
          setError(error.message)
        }
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <h1 className="text-3xl font-bold text-foreground mb-4">Login</h1>
        <p className="text-foreground text-lg mb-8">Sign in or create an account</p>

        {emailSent ? (
          <div className="space-y-4">
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
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
                SEND MAGIC LINK
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
'use client'

import '@/app/globals.css'
import { Montserrat } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { WelcomeTopBar } from '@/components/ui/WelcomeTopBar'
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext'
import { ProtectedRoute } from '@/components/auth/protected-route'
import Script from 'next/script'
import { Suspense } from 'react'
import { Analytics } from '@/components/analytics'
import { usePathname } from 'next/navigation'
import { Toaster as SonnerToaster } from 'sonner'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const PUBLIC_ROUTES = ['/', '/login', '/join', '/waitlist']

function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const { profile } = useUserProfile()
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '')

  // Always use light theme for public routes
  const isDark = isPublicRoute ? false : (profile?.isDarkMode ?? true)

  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${isDark ? 'dark' : ''}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4XC08SH2XT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-4XC08SH2XT');
          `}
        </Script>
      </head>
      <body className="bg-background font-sans antialiased" suppressHydrationWarning>
        <div className="relative min-h-screen flex flex-col">
          <WelcomeTopBar />
          <main className="flex-1">
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <p className="text-foreground">Loading...</p>
              </div>
            }>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </Suspense>
          </main>
        </div>
        <Toaster />
        <SonnerToaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProfileProvider>
      <RootLayoutInner>{children}</RootLayoutInner>
    </UserProfileProvider>
  )
}

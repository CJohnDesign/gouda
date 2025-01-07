'use client'

import '@/app/globals.css'

import { Montserrat } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { WelcomeTopBar } from '@/components/ui/WelcomeTopBar'
import { Footer } from '@/components/ui/Footer'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { ProtectedRoute } from '@/components/auth/protected-route'
import Script from 'next/script'
import { Suspense } from 'react'
import { Analytics } from '@/components/analytics'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
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
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system"
          disableTransitionOnChange
        >
          <UserProfileProvider>
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
              <Footer />
            </div>
            <Toaster />
            <Analytics />
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

'use client'

import '@/app/globals.css'

import { Montserrat } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { WelcomeTopBar } from '@/components/ui/WelcomeTopBar'
import { Footer } from '@/components/ui/Footer'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { usePathname } from 'next/navigation'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const FORCE_LIGHT_ROUTES = ['/', '/login', '/join']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const forceLightMode = FORCE_LIGHT_ROUTES.includes(pathname)

  return (
    <html lang="en" suppressHydrationWarning className={montserrat.variable}>
      <body className={cn('bg-background font-sans antialiased', forceLightMode && 'light')}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme={forceLightMode ? "light" : "system"} 
          enableSystem={!forceLightMode}
          disableTransitionOnChange
        >
          <UserProfileProvider>
            <div className="relative min-h-screen flex flex-col">
              <WelcomeTopBar />
              <main className="flex-1">
                <ProtectedRoute>
                  {children}
                </ProtectedRoute>
              </main>
              <Footer />
            </div>
            <Toaster />
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

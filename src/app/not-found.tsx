'use client'

import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function NotFound() {
  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 ${montserrat.className}`}>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Button asChild>
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </main>
  )
} 
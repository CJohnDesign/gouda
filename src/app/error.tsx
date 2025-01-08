'use client'

import { useEffect } from 'react'
import { Montserrat } from 'next/font/google'
import { Button } from '@/components/ui/button'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 ${montserrat.className}`}>
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          An error occurred. Please try again.
        </p>
        <div className="space-x-4">
          <Button onClick={reset}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Return Home
          </Button>
        </div>
      </div>
    </main>
  )
} 
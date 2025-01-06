'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

export function WelcomeTopBar() {
  const [isVisible, setIsVisible] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Show the top bar if there's a session_id in the URL
    setIsVisible(!!searchParams.get('session_id'))
  }, [searchParams])

  if (!isVisible) return null

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:px-16 sm:text-center">
          <p className="font-medium">
            Welcome to the Top! Can&apos;t wait to see you at a group session! 🎉
          </p>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-6">
          <button
            type="button"
            className="flex rounded-md p-2 hover:bg-primary/90 focus:outline-none"
            onClick={() => setIsVisible(false)}
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
} 
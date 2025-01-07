'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

function WelcomeTopBarContent() {
  const searchParams = useSearchParams()
  const [isVisible, setIsVisible] = useState(true)
  const isNewUser = searchParams.get('newUser') === 'true'

  if (!isNewUser || !isVisible) return null

  return (
    <Alert className="rounded-none border-t-0 border-x-0">
      <AlertDescription className="flex items-center justify-between">
        <span>Welcome to Gouda! We&apos;re excited to have you here.</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="h-4 w-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function WelcomeTopBar() {
  return (
    <Suspense fallback={null}>
      <WelcomeTopBarContent />
    </Suspense>
  )
} 
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PlaylistNavigationProps {
  playlistId: string
}

function PlaylistNavigationContent({ playlistId }: PlaylistNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentIndex = parseInt(searchParams.get('index') || '0')

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    router.push(`/song/${playlistId}?index=${newIndex}`)
  }

  return (
    <div className="flex justify-between items-center w-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('prev')}
        disabled={currentIndex <= 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function PlaylistNavigation(props: PlaylistNavigationProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-between items-center w-full">
        <Button variant="ghost" size="icon" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    }>
      <PlaylistNavigationContent {...props} />
    </Suspense>
  )
} 
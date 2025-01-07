'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPlaylist } from '@/lib/firestore/playlists'
import type { Playlist } from '@/types/music/playlist'

interface PlaylistNavigationProps {
  playlistId: string
}

function PlaylistNavigationContent({ playlistId }: PlaylistNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentIndex = parseInt(searchParams.get('index') || '0')
  const [playlist, setPlaylist] = useState<Partial<Playlist> | null>(null)

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const playlistData = await getPlaylist(playlistId)
        setPlaylist(playlistData)
      } catch (error) {
        console.error('Error fetching playlist:', error)
      }
    }

    fetchPlaylist()
  }, [playlistId])

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    router.push(`/song/${playlist?.songs?.[newIndex]}?playlistId=${playlistId}&index=${newIndex}`)
  }

  const totalSongs = playlist?.songs?.length || 0

  return (
    <div className="bg-card backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-4 min-w-[300px]">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('prev')}
        disabled={currentIndex <= 0}
        className="text-foreground hover:text-black"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1 text-center text-sm">
        <span className="text-muted-foreground">{playlist?.name}</span>
        <span className="text-muted-foreground mx-2">•</span>
        <span className="text-foreground">{currentIndex + 1} / {totalSongs}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('next')}
        disabled={currentIndex >= totalSongs - 1}
        className="text-foreground hover:text-black"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function PlaylistNavigation(props: PlaylistNavigationProps) {
  return (
    <Suspense fallback={
      <div className="bg-card backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-4 min-w-[300px]">
        <Button variant="ghost" size="icon" disabled className="text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center text-sm">
          <span className="text-muted-foreground">Loading...</span>
        </div>
        <Button variant="ghost" size="icon" disabled className="text-foreground">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    }>
      <PlaylistNavigationContent {...props} />
    </Suspense>
  )
} 
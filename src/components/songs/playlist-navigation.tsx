'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getPlaylist } from '@/lib/firestore/playlists'
import type { Playlist } from '@/types/music/playlist'

interface PlaylistNavigationProps {
  songId: string
}

export function PlaylistNavigation({ songId }: PlaylistNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [totalSongs, setTotalSongs] = useState(0)
  
  const playlistId = searchParams.get('playlistId')
  const position = parseInt(searchParams.get('position') || '1')

  useEffect(() => {
    if (playlistId) {
      getPlaylist(playlistId).then((playlist: Playlist | null) => {
        if (playlist) {
          setPlaylistTitle(playlist.name)
          setTotalSongs(playlist.songs.length)
        }
      })
    }
  }, [playlistId])

  if (!playlistId) return null

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newPosition = direction === 'next' ? position + 1 : position - 1
    if (newPosition < 1 || newPosition > totalSongs) return

    // Get the song ID for the new position
    getPlaylist(playlistId).then((playlist: Playlist | null) => {
      if (playlist && playlist.songs[newPosition - 1]) {
        const nextSongId = playlist.songs[newPosition - 1]
        router.push(`/song/${nextSongId}?playlistId=${playlistId}&position=${newPosition}`)
      }
    })
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('prev')}
        disabled={position <= 1}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="text-center min-w-[200px]">
        <p className="text-sm text-muted-foreground">{playlistTitle} • {position} / {totalSongs}</p>
       
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleNavigation('next')}
        disabled={position >= totalSongs}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
} 
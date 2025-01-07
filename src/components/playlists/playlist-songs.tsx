'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Song } from '@/types/music/song'
import { cn } from '@/lib/utils'

interface PlaylistSongsProps {
  playlistId: string
  songs: Song[]
}

export function PlaylistSongs({ playlistId, songs }: PlaylistSongsProps) {
  const router = useRouter()
  const [items, setItems] = useState<Song[]>([])

  // Update local items when songs prop changes
  useEffect(() => {
    setItems(songs)
  }, [songs])

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No songs in this playlist yet</p>
          <p className="text-sm mt-2">Add songs from the songbook to get started</p>
        </div>
      ) : (
        <div className="space-y-1">
          {items.map((song, index) => (
            <button
              key={song.id}
              className={cn(
                "flex w-full flex-row items-center gap-2 p-3 rounded-lg",
                "bg-card hover:bg-muted transition-colors",
                "text-card-foreground"
              )}
              onClick={(e) => {
                console.log('Song clicked:', song.title)
                console.log('PlaylistId:', playlistId)
                console.log('Position:', index + 1)
                console.log('URL to navigate:', `/song/${song.id}?playlistId=${playlistId}&position=${index + 1}`)
                e.preventDefault()
                e.stopPropagation()
                router.push(`/song/${song.id}?playlistId=${playlistId}&position=${index + 1}`)
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-left text-sm font-medium truncate text-card-foreground hover:text-primary transition-colors">{song.title}</p>
                <p className="text-left text-xs text-muted-foreground truncate">
                  {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 
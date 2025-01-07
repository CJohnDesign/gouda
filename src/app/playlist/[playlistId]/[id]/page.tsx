'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { getPlaylist, subscribeToPlaylist } from '@/lib/firestore/playlists'
import { getAllSongs } from '@/lib/firestore/songs'
import { Button } from '@/components/ui/button'
import { Share2, MoreVertical } from 'lucide-react'
import { Montserrat } from 'next/font/google'
import { PlaylistSongs } from '@/components/playlists/playlist-songs'
import type { Playlist } from '@/types/music/playlist'
import type { Song } from '@/types/music/song'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function PlaylistPage({ params }: { params: { playlistId: string } }) {
  const router = useRouter()
  const { user, isLoading } = useUserProfile()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Fetch all songs and set up playlist subscription
  useEffect(() => {
    if (!user) return

    let unsubscribe: (() => void) | undefined

    async function initialize() {
      try {
        // Fetch all songs first
        const songsData = await getAllSongs()

        // Then set up playlist subscription
        unsubscribe = subscribeToPlaylist(params.playlistId, (updatedPlaylist) => {
          if (!updatedPlaylist) {
            router.push('/playlists')
            return
          }

          // Create a new playlist object to force re-render
          const newPlaylist = {
            ...updatedPlaylist,
            songs: [...updatedPlaylist.songs] // Create a new array to ensure state update
          }
          setPlaylist(newPlaylist)

          // Update songs list based on playlist's songs array
          const updatedSongs = songsData.filter(song => 
            newPlaylist.songs.includes(song.id)
          ).sort((a, b) => {
            // Maintain playlist order
            const aIndex = newPlaylist.songs.indexOf(a.id)
            const bIndex = newPlaylist.songs.indexOf(b.id)
            return aIndex - bIndex
          })
          setSongs(updatedSongs)
        })

        // Initial playlist fetch to set loading state
        const initialPlaylist = await getPlaylist(params.playlistId)
        if (!initialPlaylist) {
          router.push('/playlists')
          return
        }
        setPlaylist(initialPlaylist)

        // Set initial songs
        const initialSongs = songsData.filter(song => 
          initialPlaylist.songs.includes(song.id)
        ).sort((a, b) => {
          const aIndex = initialPlaylist.songs.indexOf(a.id)
          const bIndex = initialPlaylist.songs.indexOf(b.id)
          return aIndex - bIndex
        })
        setSongs(initialSongs)
      } catch (error) {
        console.error('Error initializing playlist:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    initialize()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [params.playlistId, user, router])

  // Handle authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [isLoading, user, router])

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }
   
  if (!user || !playlist) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 z-10 max-w-6xl mx-auto px-4">
        {/* Playlist Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className={`text-3xl font-semibold ${montserrat.className} mb-2`}>
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {playlist.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <PlaylistSongs
          playlistId={playlist.id}
          songs={songs}
        />
      </div>
    </main>
  )
} 
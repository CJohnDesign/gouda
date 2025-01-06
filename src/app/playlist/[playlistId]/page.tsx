'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { Montserrat } from 'next/font/google'
import { getPlaylist, subscribeToPlaylist } from '@/lib/firestore/playlists'
import { getAllSongs } from '@/lib/firestore/songs'
import { PlaylistSongs } from '@/components/playlists/playlist-songs'
import type { Playlist } from '@/types/music/playlist'
import type { Song } from '@/types/music/song'
import { EditPlaylistDialog } from '@/components/playlists/edit-playlist-dialog'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function PlaylistPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useUserProfile()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const playlistId = params.playlistId as string

  useEffect(() => {
    // Handle authentication check
    if (!loading && !user) {
      router.push('/')
      return
    }

    // Fetch playlist and songs if user is authenticated
    async function fetchData() {
      try {
        const playlistData = await getPlaylist(playlistId)
        if (!playlistData) {
          router.push('/playlists')
          return
        }
        setPlaylist(playlistData)

        // Fetch all songs and filter to playlist songs
        const allSongs = await getAllSongs()
        const playlistSongs = allSongs.filter(song => 
          playlistData.songs.includes(song.id)
        ).sort((a, b) => {
          // Maintain playlist order
          return playlistData.songs.indexOf(a.id) - playlistData.songs.indexOf(b.id)
        })
        setSongs(playlistSongs)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user && playlistId) {
      fetchData()
      
      // Subscribe to playlist updates
      const unsubscribe = subscribeToPlaylist(playlistId, async (updatedPlaylist: Playlist | null) => {
        if (!updatedPlaylist) return
        setPlaylist(updatedPlaylist)
        
        // Update songs list with new order
        const allSongs = await getAllSongs()
        const playlistSongs = allSongs.filter(song => 
          updatedPlaylist.songs.includes(song.id)
        ).sort((a, b) => {
          return updatedPlaylist.songs.indexOf(a.id) - updatedPlaylist.songs.indexOf(b.id)
        })
        setSongs(playlistSongs)
      })

      return () => unsubscribe()
    }
  }, [loading, user, router, playlistId])

  if (loading || isLoading) {
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
        <div className="flex flex-col space-y-6">
          {/* Playlist Header */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className={`text-3xl font-bold text-foreground ${montserrat.className}`}>
                  {playlist.name}
                </h1>
                {playlist.description && (
                  <p className="text-muted-foreground mt-2">{playlist.description}</p>
                )}
              </div>
              
              <div className="flex items-center">
                <EditPlaylistDialog
                  playlistId={playlist.id}
                  userId={user.uid}
                  existingSongs={songs.map(song => song.id)}
                />
              </div>
            </div>
          </div>

          {/* Songs List */}
          <PlaylistSongs
            playlistId={playlist.id}
            userId={user.uid}
            songs={songs}
          />
        </div>
      </div>
    </main>
  )
} 
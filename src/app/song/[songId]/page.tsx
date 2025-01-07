'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { getSongById } from "@/lib/firestore/songs"
import type { Song } from "@/types/music/song"
import { PlaylistNavigation } from "@/components/songs/playlist-navigation"
import { Suspense } from "react"
import { ChordSheet } from "@/components/chord-sheet"
import { SongProfileSidebar } from "@/components/song-profile-sidebar"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

function SongPageContent() {
  const { songId } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: userLoading } = useUserProfile()
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const playlistId = searchParams.get('playlistId')

  useEffect(() => {
    // Handle authentication check
    if (!userLoading && !user) {
      router.push('/')
      return
    }

    // Fetch song if user is authenticated
    async function fetchSong() {
      try {
        const songData = await getSongById(songId as string)
        setSong(songData)
      } catch (error) {
        console.error('Error fetching song:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSong()
    }
  }, [userLoading, user, router, songId])

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (!user || !song) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Song Header */}
            <div className="max-w-4xl mx-auto mb-8">
              <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
              <p className="text-xl text-muted-foreground">{song.artist}</p>
            </div>

            {/* Chord Sheet */}
            <ChordSheet song={song} />

            {/* Playlist Navigation */}
            {playlistId && (
              <div className="max-w-4xl mx-auto mt-8">
                <PlaylistNavigation playlistId={playlistId} />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Music className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Sidebar */}
        <SongProfileSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          song={song}
        />
      </div>
    </div>
  )
}

export default function SongPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading song details...</p>
      </div>
    }>
      <SongPageContent />
    </Suspense>
  )
} 
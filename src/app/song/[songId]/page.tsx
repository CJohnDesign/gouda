'use client'

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getSongById } from "@/lib/firestore/songs"
import { SongProfileSidebar } from "@/components/song-profile-sidebar"
import { ChordSheet } from "@/components/chord-sheet"
import { Button } from "@/components/ui/button"
import { Music, X } from "lucide-react"
import type { Song } from "@/types/music/song"
import { cn } from "@/lib/utils"
import { PlaylistNavigation } from "@/components/songs/playlist-navigation"

function SongPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [song, setSong] = useState<Partial<Song> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const params = useParams()
  const songId = params.songId as string
  const playlistId = searchParams.get('playlistId')

  const handleClose = () => {
    if (playlistId) {
      router.push(`/playlist/${playlistId}`)
    } else {
      router.push('/songbook')
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (window.innerWidth < 1024 && !target.closest('[data-sidebar]') && !target.closest('button')) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Set default sidebar state based on screen size
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Set initial state
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchSong() {
      try {
        const songData = await getSongById(songId)
        setSong(songData)
      } catch (error) {
        console.error('Error fetching song:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSong()
  }, [songId])

  if (isLoading || !song) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-background border-b-[0.75px] border-foreground/20 dark:border-primary/30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-black"
                onClick={handleClose}
              >
                <X className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold leading-tight text-foreground">{song.title}</h1>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
                {song.featuring && song.featuring.length > 0 && (
                  <p className="text-xs text-muted-foreground/75">feat. {song.featuring.join(', ')}</p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-black ml-3"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              <Music className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          // Expand main content when sidebar is closed
          !sidebarOpen && "lg:mr-0",
          // Add margin when sidebar is open
          sidebarOpen && "lg:mr-64"
        )}>
          {/* Desktop Header */}
          <header className="hidden lg:block px-6 py-4 border-b-[0.75px] border-foreground/20 dark:border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-black"
                  onClick={handleClose}
                >
                  <X className="h-6 w-6" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold leading-tight truncate text-foreground">{song.title}</h1>
                  <p className="text-lg text-muted-foreground truncate">{song.artist}</p>
                  {song.featuring && song.featuring.length > 0 && (
                    <p className="text-sm text-muted-foreground/75 truncate">feat. {song.featuring.join(', ')}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-black"
                aria-label="Toggle sidebar"
                onClick={toggleSidebar}
              >
                <Music className="h-6 w-6" />
              </Button>
            </div>
          </header>

          <div className="px-4 py-6 lg:p-6">
            <ChordSheet song={song} />
          </div>
        </main>

        {/* Sidebar */}
        <SongProfileSidebar 
          song={song}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Playlist Navigation */}
      {playlistId && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <PlaylistNavigation playlistId={playlistId} />
        </div>
      )}
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
'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSongById } from "@/lib/firestore/songs"
import { SongProfileSidebar } from "@/components/song-profile-sidebar"
import { ChordSheet } from "@/components/chord-sheet"
import { Button } from "@/components/ui/button"
import { Music, ArrowLeft } from "lucide-react"
import type { Song } from "@/types/music/song"
import { cn } from "@/lib/utils"

export default function SongPage() {
  const router = useRouter()
  const [song, setSong] = useState<Partial<Song> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const params = useParams()
  const songId = params.songId as string

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (window.innerWidth < 768 && !target.closest('[data-sidebar]')) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Set default sidebar state based on screen size
  useEffect(() => {
    function handleResize() {
      setSidebarOpen(window.innerWidth >= 768)
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
      <header className="md:hidden bg-background border-b-[0.75px] border-primary/30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary"
                onClick={() => router.push('/songbook')}
              >
                <ArrowLeft className="h-6 w-6" />
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
              className="text-foreground hover:text-primary ml-3"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Music className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Main Content */}
        <main className="flex-1">
          {/* Desktop Header */}
          <header className="hidden md:block px-6 py-4 border-b-[0.75px] border-primary/30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary"
                onClick={() => router.push('/songbook')}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold leading-tight truncate text-foreground">{song.title}</h1>
                <p className="text-lg text-muted-foreground truncate">{song.artist}</p>
                {song.featuring && song.featuring.length > 0 && (
                  <p className="text-sm text-muted-foreground/75 truncate">feat. {song.featuring.join(', ')}</p>
                )}
              </div>
            </div>
          </header>

          <div className="px-4 py-6 md:p-6">
            <ChordSheet song={song} />
          </div>
        </main>

        {/* Sidebar */}
        <div data-sidebar className="md:w-64 flex-shrink-0 border-l border-primary/30">
          <SongProfileSidebar 
            song={song}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>
    </div>
  )
} 
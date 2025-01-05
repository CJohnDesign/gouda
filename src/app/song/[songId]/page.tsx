'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getSongById } from "@/lib/firestore/songs"
import { SongProfileSidebar } from "@/components/song-profile-sidebar"
import { ChordSheet } from "@/components/chord-sheet"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import type { Song } from "@/types/music/song"
import { cn } from "@/lib/utils"

export default function SongPage() {
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
      <div className="min-h-screen bg-[#f1e0b4] flex items-center justify-center">
        <p className="text-[#262223]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f1e0b4]">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#f1e0b4] border-b border-[#262223]/10 md:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#262223] hover:text-[#de9c0e]"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Music className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{song.title}</h1>
              <p className="text-sm text-[#262223]/75">{song.artist}</p>
              {song.featuring && song.featuring.length > 0 && (
                <p className="text-xs text-[#262223]/60">feat. {song.featuring.join(', ')}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end flex-wrap gap-2 mt-2">
            {song.genre?.map((genre) => (
              <span key={genre} className="px-3 py-1 text-xs rounded-full border border-[#262223]/20 text-[#262223]/75">
                {genre}
              </span>
            ))}
            {song.mood?.map((mood) => (
              <span key={mood} className="px-3 py-1 text-xs rounded-full border border-[#de9c0e]/30 text-[#de9c0e]">
                {mood}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div data-sidebar className="md:w-64 flex-shrink-0">
          <SongProfileSidebar 
            song={song}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 pt-24 md:pt-0">
          {/* Desktop Header */}
          <header className="hidden md:block px-6 py-4 border-b border-[#262223]/10">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-[#262223] hover:text-[#de9c0e]"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Music className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold leading-tight">{song.title}</h1>
                <p className="text-lg text-[#262223]/75">{song.artist}</p>
                {song.featuring && song.featuring.length > 0 && (
                  <p className="text-sm text-[#262223]/60">feat. {song.featuring.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {song.genre?.map((genre) => (
                <span key={genre} className="px-3 py-1 text-sm rounded-full border border-[#262223]/20 text-[#262223]/75">
                  {genre}
                </span>
              ))}
              {song.mood?.map((mood) => (
                <span key={mood} className="px-3 py-1 text-sm rounded-full border border-[#de9c0e]/30 text-[#de9c0e]">
                  {mood}
                </span>
              ))}
            </div>
          </header>

          <div className="px-4 py-6 md:p-6">
            <ChordSheet song={song} />
          </div>
        </main>
      </div>
    </div>
  )
} 
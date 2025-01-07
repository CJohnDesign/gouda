'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { getAllSongs } from '@/lib/firestore/songs'
import type { Song } from '@/types/music/song'
import { Montserrat } from 'next/font/google'
import { RequestSongDialog } from '@/components/songs/request-song-dialog'

const montserrat = Montserrat({ subsets: ['latin'] })

// Base unit is 2 columns × 3 rows, scales with breakpoints
const getCardStyle = (index: number) => {
  // Large feature (4×9) - 2×3 units
  if (index === 0) {
    return {
      className: 'col-span-12 row-span-9 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: 'bg-card'
    }
  }

  // Wide feature (4×6) - 2×2 units
  if (index % 13 === 1) {
    return {
      className: 'col-span-12 row-span-6 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: 'bg-card'
    }
  }

  // Tall vertical (2×9) - 1×3 units
  if (index % 7 === 2) {
    return {
      className: 'col-span-6 row-span-9 sm:col-span-4 md:col-span-3 lg:col-span-2',
      color: 'bg-card'
    }
  }

  // Standard vertical (2×6) - 1×2 units
  if (index % 5 === 0) {
    return {
      className: 'col-span-6 row-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2',
      color: 'bg-card'
    }
  }

  // Standard horizontal (4×3) - 2×1 unit
  if (index % 6 === 4) {
    return {
      className: 'col-span-12 row-span-3 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: 'bg-card'
    }
  }

  // Default to standard sizes only
  const variations = [
    // Standard vertical (1×2 units)
    'col-span-6 row-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2',
    // Standard horizontal (2×1 unit)
    'col-span-12 row-span-3 sm:col-span-8 md:col-span-6 lg:col-span-4',
    // Standard vertical (1×2 units)
    'col-span-6 row-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2',
    // Standard small (1×1 unit)
    'col-span-6 row-span-3 sm:col-span-4 md:col-span-3 lg:col-span-2'
  ]
  return {
    className: variations[index % variations.length],
    color: 'bg-card'
  }
}

export default function SongbookPage() {
  const router = useRouter()
  const { user, isLoading } = useUserProfile()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(true)

  useEffect(() => {
    // Handle authentication check
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    // Fetch songs if user is authenticated and not loading
    if (user && !isLoading) {
      async function fetchSongs() {
        try {
          const songsData = await getAllSongs()
          setSongs(songsData)
        } catch (error) {
          console.error('Error fetching songs:', error)
        } finally {
          setIsLoadingSongs(false)
        }
      }

      fetchSongs()
    }
  }, [isLoading, user, router])

  // Show loading state while checking auth or fetching songs
  if (isLoading || (user && isLoadingSongs)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }
   
  // Don't render anything if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container pt-16 pb-20 space-y-2">
        <div className="flex flex-row justify-between items-end mb-8">
          <div>
            <h1 className={`scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${montserrat.className}`}>
              Songbook
            </h1>
          </div>
          <div>
            <RequestSongDialog />
          </div>
        </div>
        <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-24 lg:grid-cols-24 auto-rows-[50px] gap-2 grid-flow-dense justify-center">
          {songs.map((song, index) => {
            const style = getCardStyle(index)
            
            return (
              <div
                key={song.id}
                className={`
                  ${style.className}
                  bg-card hover:bg-muted
                  transition-all hover:scale-[1.05]
                  overflow-hidden
                `}
              >
                <SongCard 
                  song={song}
                  size={style.className.includes('row-span-9') ? 'large' : 'small'}
                />
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

interface SongCardProps {
  song: Song
  size: 'large' | 'small'
}

function SongCard({ song, size }: SongCardProps) {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.push(`/song/${song.id}`)}
      className={`h-full w-full p-4 flex flex-col text-left ${montserrat.className}`}
    >
      {/* Genre and key */}
      <div className="text-xs uppercase tracking-widest mb-2 text-muted-foreground">
        {song.genre[0]} • {song.theory.key}
      </div>

      {/* Title and Artist */}
      <div className="mb-auto">
        <h3 className={`font-mono font-normal ${size === 'large' ? 'text-xl mb-2' : 'text-base mb-1'} text-foreground`}>
          {song.title}
        </h3>
        <p className={`text-muted-foreground ${size === 'large' ? 'text-base' : 'text-sm'}`}>
          {song.artist}
        </p>
      </div>
      
      {/* Description - only on large cards */}
      {size === 'large' && song.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {song.description}
        </p>
      )}
      
      {/* Metadata */}
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        {size === 'large' ? (
          <>
            <p>{song.theory.bpm} BPM • {song.duration}</p>
            <p>{song.mood[0]}</p>
            <p>{song.releaseYear}</p>
          </>
        ) : (
          <p>{song.duration} • {song.releaseYear}</p>
        )}
      </div>
    </button>
  )
} 
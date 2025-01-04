'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Corners } from "@/components/ui/borders"
import { Montserrat } from 'next/font/google'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/firebase'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

// Color palette - warm theme
const cardColors = {
  dark: 'bg-[#262223]',
  primary: 'bg-[#262223]',
  accent1: 'bg-[#262223]',
  accent2: 'bg-[#262223]',
  accent3: 'bg-[#262223]',
  light: 'bg-[#262223]'
}

// Base unit is 2 columns × 3 rows, scales with breakpoints
const getCardStyle = (index: number, hasDescription: boolean) => {
  // Large feature (4×9) - 2×3 units
  if (index === 0) {
    return {
      className: 'col-span-12 row-span-9 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: cardColors.dark
    }
  }

  // Wide feature (4×6) - 2×2 units
  if (index % 13 === 1) {
    return {
      className: 'col-span-12 row-span-6 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: cardColors.primary
    }
  }

  // Tall vertical (2×9) - 1×3 units
  if (index % 7 === 2) {
    return {
      className: 'col-span-6 row-span-9 sm:col-span-4 md:col-span-3 lg:col-span-2',
      color: cardColors.accent1
    }
  }

  // Standard vertical (2×6) - 1×2 units
  if (index % 5 === 0) {
    return {
      className: 'col-span-6 row-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2',
      color: cardColors.accent2
    }
  }

  // Standard horizontal (4×3) - 2×1 unit
  if (index % 6 === 4) {
    return {
      className: 'col-span-12 row-span-3 sm:col-span-8 md:col-span-6 lg:col-span-4',
      color: cardColors.dark
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
    color: index % 2 === 0 ? cardColors.light : cardColors.primary
  }
}

interface Song {
  id: string
  title: string
  artist: string
  coverUrl: string
  bpm: number
  key: string
  genre: string
  mood: string
  duration: string
  releaseYear: number
  description?: string | null
  createdAt: any
  updatedAt: any
}

export default function SongbookPage() {
  const router = useRouter()
  const { user, loading } = useUserProfile()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSongs() {
      try {
        const songsQuery = query(
          collection(db, 'songs'),
          orderBy('createdAt', 'desc')
        )
        const querySnapshot = await getDocs(songsQuery)
        const songsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Song[]
        setSongs(songsData)
      } catch (error) {
        console.error('Error fetching songs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSongs()
    }
  }, [user])

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  if (!user) { 
    router.push('/')
    return null 
  }

  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col ${montserrat.className}`}>
      
      <Navbar />
      
      <div className="pt-20 z-10">
        <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-24 lg:grid-cols-24 auto-rows-[50px] gap-1 p-2 grid-flow-dense">
          {songs.map((song, index) => {
            const style = getCardStyle(index, !!song.description)
            const isDark = style.color === cardColors.dark
            const isAccent = style.color !== cardColors.dark && style.color !== cardColors.light
            
            return (
              <div 
                key={song.id} 
                className={`
                  ${style.className}
                  ${style.color}
                  transition-all hover:scale-[1.01]
                  overflow-hidden
                `}
              >
                <SongCard 
                  song={song}
                  isDark={isDark}
                  isAccent={isAccent}
                  size={style.className.includes('row-span-9') ? 'large' : 'small'}
                />
              </div>
            )
          })}
        </div>
      </div>
      <Corners />
    </main>
  )
}

interface SongCardProps {
  song: Song
  isDark: boolean
  isAccent: boolean
  size: 'large' | 'small'
}

function SongCard({ song, isDark, isAccent, size }: SongCardProps) {
  // Always use white text since all cards are dark
  const textColor = 'text-white'
  const mutedTextColor = 'text-white/70'
  
  return (
    <div className="h-full p-4 flex flex-col">
      {/* Genre and key */}
      <div className={`text-xs uppercase tracking-wider mb-2 ${mutedTextColor}`}>
        {song.genre} • {song.key}
      </div>

      {/* Title and Artist */}
      <div className="mb-auto">
        <h3 className={`font-bold ${size === 'large' ? 'text-xl mb-2' : 'text-base mb-1'} ${textColor}`}>
          {song.title}
        </h3>
        <p className={`${mutedTextColor} ${size === 'large' ? 'text-base' : 'text-sm'}`}>
          {song.artist}
        </p>
      </div>
      
      {/* Description - only on large cards */}
      {size === 'large' && song.description && (
        <p className={`${mutedTextColor} text-sm mb-4 line-clamp-3`}>
          {song.description}
        </p>
      )}
      
      {/* Metadata */}
      <div className={`mt-2 space-y-1 text-sm ${mutedTextColor}`}>
        {size === 'large' ? (
          <>
            <p>{song.bpm} BPM • {song.duration}</p>
            <p>{song.mood}</p>
            <p>{song.releaseYear}</p>
          </>
        ) : (
          <p>{song.duration} • {song.releaseYear}</p>
        )}
      </div>
    </div>
  )
} 
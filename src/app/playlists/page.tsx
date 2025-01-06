'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { getUserPlaylists } from '@/lib/firestore/playlists'
import { CreatePlaylistDialog } from '@/components/playlists/create-playlist-dialog'
import type { Playlist } from '@/types/music/playlist'
import { Montserrat } from 'next/font/google'
import { Music4 } from 'lucide-react'

const montserrat = Montserrat({ subsets: ['latin'] })

// Format date safely
const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString()
}

// Simpler card style system compared to songbook
const getCardStyle = (index: number) => {
  // Featured playlist (large)
  if (index === 0) {
    return {
      className: 'col-span-12 row-span-6 sm:col-span-8 md:col-span-6 lg:col-span-4',
      size: 'large' as const
    }
  }

  // Standard sizes alternating between vertical and horizontal
  const variations = [
    // Vertical (1×2 units)
    {
      className: 'col-span-6 row-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2',
      size: 'small' as const
    },
    // Horizontal (2×1 unit)
    {
      className: 'col-span-12 row-span-3 sm:col-span-8 md:col-span-6 lg:col-span-4',
      size: 'small' as const
    }
  ]
  
  return variations[index % variations.length]
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, loading } = useUserProfile()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Handle authentication check
    if (!loading && !user) {
      router.push('/')
      return
    }

    // Fetch playlists if user is authenticated
    async function fetchPlaylists() {
      try {
        if (!user) return
        const playlistsData = await getUserPlaylists(user.uid)
        setPlaylists(playlistsData.map(p => p.playlist))
      } catch (error) {
        console.error('Error fetching playlists:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchPlaylists()
    }
  }, [loading, user, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }
   
  // Don't render anything while redirecting
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 z-10 max-w-6xl mx-auto px-4">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl font-semibold ${montserrat.className}`}>Your Playlists</h1>
          <CreatePlaylistDialog />
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-24 lg:grid-cols-24 auto-rows-[50px] gap-2 grid-flow-dense">
          {playlists.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Music4 className="h-12 w-12 mb-4" />
              <p className="text-lg mb-2">No playlists yet</p>
              <p className="text-sm">Create your first playlist to get started</p>
            </div>
          ) : (
            playlists.map((playlist, index) => {
              const style = getCardStyle(index)
              
              return (
                <div
                  key={playlist.id}
                  className={`
                    ${style.className}
                    bg-card hover:bg-muted
                    transition-all hover:scale-[1.02]
                    overflow-hidden rounded-lg border shadow-sm
                  `}
                >
                  <PlaylistCard 
                    playlist={playlist}
                    size={style.size}
                  />
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}

interface PlaylistCardProps {
  playlist: Playlist
  size: 'large' | 'small'
}

function PlaylistCard({ playlist, size }: PlaylistCardProps) {
  const router = useRouter()
  
  return (
    <button 
      onClick={() => router.push(`/playlist/${playlist.id}`)}
      className={`h-full w-full p-4 flex flex-col text-left ${montserrat.className}`}
    >
      {/* Visibility and Song Count */}
      <div className="text-xs uppercase tracking-widest mb-2 text-muted-foreground">
        {playlist.isPublic ? 'Public' : 'Private'} • {playlist.songs.length} songs
      </div>

      {/* Title */}
      <div className="mb-auto">
        <h3 className={`font-mono font-normal ${size === 'large' ? 'text-xl mb-2' : 'text-base mb-1'} text-foreground`}>
          {playlist.name}
        </h3>
      </div>
      
      {/* Description - only on large cards */}
      {size === 'large' && playlist.description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {playlist.description}
        </p>
      )}
      
      {/* Metadata */}
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        {size === 'large' ? (
          <>
            <p>{playlist.likeCount} likes • {playlist.shareCount} shares</p>
            <p>Created {formatDate(playlist.createdAt)}</p>
          </>
        ) : (
          <p>Updated {formatDate(playlist.updatedAt)}</p>
        )}
      </div>
    </button>
  )
} 
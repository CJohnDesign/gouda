'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from "@/components/ui/Navbar"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { getUserPlaylists } from '@/lib/firestore/playlists'
import { CreatePlaylistDialog } from '@/components/playlists/create-playlist-dialog'
import { PlaylistCard } from '@/components/playlists/playlist-card'
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
  const { user, loading } = useUserProfile()
  const router = useRouter()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
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
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 z-10 max-w-6xl mx-auto px-4">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`scroll-m-20 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${montserrat.className}`}>Your Playlists</h1>
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
                    shadow-sm
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
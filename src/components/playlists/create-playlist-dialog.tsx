'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { createPlaylist } from '@/lib/firestore/playlists'
import { getAllSongs } from '@/lib/firestore/songs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Song } from '@/types/music/song'

interface CreatePlaylistDialogProps {
  className?: string
}

export function CreatePlaylistDialog({ className }: CreatePlaylistDialogProps) {
  const router = useRouter()
  const { user } = useUserProfile()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'details' | 'songs'>('details')
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  
  // Song selection state
  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')

  // Fetch songs on mount
  useEffect(() => {
    async function fetchSongs() {
      try {
        const allSongs = await getAllSongs()
        setSongs(allSongs)
        setFilteredSongs(allSongs)
      } catch (error) {
        console.error('Error fetching songs:', error)
      }
    }
    fetchSongs()
  }, [])

  // Filter songs based on search and genre
  useEffect(() => {
    let filtered = songs

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      )
    }

    // Apply genre filter
    if (genreFilter && genreFilter !== 'all') {
      filtered = filtered.filter(song => 
        song.genre.includes(genreFilter)
      )
    }

    setFilteredSongs(filtered)
  }, [searchQuery, genreFilter, songs])

  // Get unique genres from songs
  const genres = Array.from(new Set(songs.flatMap(song => song.genre)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid || !name.trim()) return

    setIsLoading(true)
    try {
      // Create playlist data object
      const playlistData = {
        name: name.trim(),
        isPublic,
        songs: selectedSongs,
        ...(description.trim() && { description: description.trim() }) // Only include description if it exists
      }

      const playlistId = await createPlaylist(
        user.uid,
        playlistData.name,
        playlistData.description,
        playlistData.isPublic
      )
      setOpen(false)
      router.push(`/playlist/${playlistId}`)
    } catch (error) {
      console.error('Error creating playlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      // Reset form
      setStep('details')
      setName('')
      setDescription('')
      setIsPublic(false)
      setSelectedSongs([])
      setSearchQuery('')
      setGenreFilter('all')
    }
  }

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className={`gap-2 ${className}`}>
          <Plus className="h-4 w-4" />
          <span>New Playlist</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {step === 'details' ? 'Create Playlist' : 'Add Songs'}
            </DialogTitle>
            <DialogDescription>
              {step === 'details' 
                ? 'Create a new playlist to organize your songs.'
                : 'Select songs to add to your playlist.'}
            </DialogDescription>
          </DialogHeader>

          {step === 'details' ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add an optional description"
                  className="col-span-3"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public" className="text-right">
                  Make playlist public
                </Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {/* Search and Filter Controls */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={genreFilter}
                  onValueChange={setGenreFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map(genre => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Songs List */}
              <div className="border rounded-md">
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredSongs.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No songs found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredSongs.map(song => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedSongs.includes(song.id) ? "default" : "ghost"}
                            className="ml-2"
                            onClick={() => toggleSongSelection(song.id)}
                            type="button"
                          >
                            {selectedSongs.includes(song.id) ? 'Added' : 'Add'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'details' ? (
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!name.trim()}
                  onClick={() => setStep('songs')}
                >
                  Skip Songs
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={!name.trim()}
                    onClick={() => setStep('songs')}
                  >
                    Add Songs
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Playlist'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
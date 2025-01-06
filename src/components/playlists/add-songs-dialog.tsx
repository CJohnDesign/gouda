'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Loader2, X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Select from '@radix-ui/react-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAllSongs } from '@/lib/firestore/songs'
import { addSongToPlaylist, removeSongFromPlaylist, subscribeToPlaylist } from '@/lib/firestore/playlists'
import type { Song } from '@/types/music/song'

interface AddSongsDialogProps {
  playlistId: string
  userId: string
  existingSongs: string[]
}

export function AddSongsDialog({ playlistId, userId, existingSongs }: AddSongsDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('add')
  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [existingSongsList, setExistingSongsList] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' })
  const [removedSongId, setRemovedSongId] = useState<string | null>(null)
  const [addedSongId, setAddedSongId] = useState<string | null>(null)
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState<string[]>(existingSongs)

  // Subscribe to playlist updates
  useEffect(() => {
    if (!open) return

    const unsubscribe = subscribeToPlaylist(playlistId, (updatedPlaylist) => {
      if (!updatedPlaylist) return
      setCurrentPlaylistSongs(updatedPlaylist.songs)
      
      // Update existing songs list
      const updatedExistingSongs = songs.filter(song => 
        updatedPlaylist.songs.includes(song.id)
      )
      setExistingSongsList(updatedExistingSongs)

      // Update available songs list
      const updatedAvailableSongs = songs.filter(song => 
        !updatedPlaylist.songs.includes(song.id)
      )
      setFilteredSongs(updatedAvailableSongs)
    })

    return () => unsubscribe()
  }, [open, playlistId, songs])

  // Fetch songs on mount
  useEffect(() => {
    async function fetchSongs() {
      try {
        const allSongs = await getAllSongs()
        setSongs(allSongs)
        
        // Split songs into available and existing
        const existing = allSongs.filter(song => currentPlaylistSongs.includes(song.id))
        const available = allSongs.filter(song => !currentPlaylistSongs.includes(song.id))
        
        setExistingSongsList(existing)
        setFilteredSongs(available)
      } catch (error) {
        console.error('Error fetching songs:', error)
      }
    }
    if (open) {
      fetchSongs()
    }
  }, [open, currentPlaylistSongs])

  // Filter songs based on search and genre
  useEffect(() => {
    let filtered = songs.filter(song => !currentPlaylistSongs.includes(song.id))

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
  }, [searchQuery, genreFilter, songs, currentPlaylistSongs])

  // Show toast message
  const showMessage = (title: string, description: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, description, type })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // Get unique genres from songs
  const genres = Array.from(new Set(songs.flatMap(song => song.genre)))

  const handleAddSong = async (song: Song) => {
    setLoadingStates(prev => ({ ...prev, [song.id]: true }))
    try {
      await addSongToPlaylist(playlistId, song.id, userId)
      setAddedSongId(song.id)
      showMessage('Song Added', `${song.title} has been added to the playlist.`)
      setTimeout(() => setAddedSongId(null), 300)
    } catch (error) {
      console.error('Error adding song:', error)
      showMessage('Error', 'Failed to add song to playlist.', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, [song.id]: false }))
    }
  }

  const handleRemoveSong = async (song: Song) => {
    setLoadingStates(prev => ({ ...prev, [song.id]: true }))
    try {
      await removeSongFromPlaylist(playlistId, song.id, userId)
      setRemovedSongId(song.id)
      showMessage('Song Removed', `${song.title} has been removed from the playlist.`)
      setTimeout(() => setRemovedSongId(null), 300)
    } catch (error) {
      console.error('Error removing song:', error)
      showMessage('Error', 'Failed to remove song from playlist.', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, [song.id]: false }))
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Songs
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[600px] bg-[#121212] rounded-lg shadow-lg p-6 border border-border">
          <Dialog.Title className="text-lg font-semibold mb-1">
            Manage Songs
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Add or remove songs from your playlist.
          </Dialog.Description>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex space-x-1 border-b border-border mb-4">
              <Tabs.Trigger
                value="add"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Add Songs
              </Tabs.Trigger>
              <Tabs.Trigger
                value="manage"
                className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Current Songs
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="add" className="space-y-4">
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
                <Select.Root value={genreFilter} onValueChange={setGenreFilter}>
                  <Select.Trigger className="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm bg-background border border-input hover:bg-accent hover:text-accent-foreground w-[180px]">
                    <Select.Value placeholder="Genre" />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="overflow-hidden bg-background rounded-md shadow-md">
                      <Select.Viewport className="p-1">
                        <Select.Item value="all" className="relative flex items-center px-8 py-2 text-sm rounded-sm hover:bg-accent cursor-default">
                          <Select.ItemText>All Genres</Select.ItemText>
                        </Select.Item>
                        {genres.map(genre => (
                          <Select.Item
                            key={genre}
                            value={genre}
                            className="relative flex items-center px-8 py-2 text-sm rounded-sm hover:bg-accent cursor-default"
                          >
                            <Select.ItemText>{genre}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Available Songs List */}
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
                          className={`
                            flex items-center justify-between p-3 hover:bg-muted/50
                            transition-all duration-300
                            ${removedSongId === song.id ? 'animate-in fade-in slide-in-from-right' : ''}
                          `}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            onClick={() => handleAddSong(song)}
                            disabled={loadingStates[song.id]}
                          >
                            {loadingStates[song.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="manage" className="space-y-4">
              {/* Current Songs List */}
              <div className="border rounded-md">
                <div className="max-h-[400px] overflow-y-auto">
                  {existingSongsList.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No songs in playlist
                    </div>
                  ) : (
                    <div className="divide-y">
                      {existingSongsList.map(song => (
                        <div
                          key={song.id}
                          className={`
                            flex items-center justify-between p-3 hover:bg-muted/50
                            transition-all duration-300
                            ${addedSongId === song.id ? 'animate-in fade-in slide-in-from-left' : ''}
                          `}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveSong(song)}
                            disabled={loadingStates[song.id]}
                          >
                            {loadingStates[song.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>
          </Tabs.Root>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full w-8 h-8 hover:bg-muted/50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Toast Message */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          toastMessage.type === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
        }`}>
          <h4 className="font-medium">{toastMessage.title}</h4>
          <p className="text-sm opacity-90">{toastMessage.description}</p>
        </div>
      )}
    </Dialog.Root>
  )
} 
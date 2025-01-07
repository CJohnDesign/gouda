'use client'

import { useState, useEffect } from 'react'
import { Pencil, Loader2, X, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import * as Select from '@radix-ui/react-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getAllSongs } from '@/lib/firestore/songs'
import { addSongToPlaylist, removeSongFromPlaylist, subscribeToPlaylist, updatePlaylist, deletePlaylist } from '@/lib/firestore/playlists'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableItem } from './sortable-item'
import { GripVertical } from 'lucide-react'
import type { Song } from '@/types/music/song'
import type { Playlist } from '@/types/music/playlist'

interface EditPlaylistDialogProps {
  playlistId: string
  userId: string
  existingSongs: string[]
}

export function EditPlaylistDialog({ playlistId, userId, existingSongs }: EditPlaylistDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [existingSongsList, setExistingSongsList] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [genreFilter, setGenreFilter] = useState<string>('all')
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: '', description: '', type: 'success' })
  const [addedSongId, setAddedSongId] = useState<string | null>(null)
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState<string[]>(existingSongs)
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Subscribe to playlist updates
  useEffect(() => {
    if (!open) return

    const unsubscribe = subscribeToPlaylist(playlistId, (updatedPlaylist) => {
      if (!updatedPlaylist) return
      setPlaylist(updatedPlaylist)
      // Only set initial values when opening the dialog
      if (name === '') {
        setName(updatedPlaylist.name)
        setDescription(updatedPlaylist.description || '')
      }
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
  }, [open, playlistId, songs, name])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
    }
  }, [open])

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
      showMessage('Song Removed', `${song.title} has been removed from the playlist.`)
    } catch (error) {
      console.error('Error removing song:', error)
      showMessage('Error', 'Failed to remove song from playlist.', 'error')
    } finally {
      setLoadingStates(prev => ({ ...prev, [song.id]: false }))
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = existingSongsList.findIndex(item => item.id === active.id)
      const newIndex = existingSongsList.findIndex(item => item.id === over.id)
      
      const newItems = arrayMove(existingSongsList, oldIndex, newIndex)
      setExistingSongsList(newItems)

      // Update playlist with new song order
      try {
        const updatedSongIds = newItems.map(song => song.id)
        await updatePlaylist(playlistId, {
          songs: updatedSongIds
        })
      } catch (error) {
        console.error('Error updating song positions:', error)
        showMessage('Error', 'Failed to update song order.', 'error')
      }
    }
  }

  const handleUpdateDetails = async () => {
    if (!playlist) return

    try {
      await updatePlaylist(playlistId, {
        name,
        description: description || undefined
      })
      showMessage('Success', 'Playlist details updated successfully.')
    } catch (error) {
      console.error('Error updating playlist:', error)
      showMessage('Error', 'Failed to update playlist details.', 'error')
    }
  }

  const handleDeletePlaylist = async () => {
    try {
      await deletePlaylist(playlistId)
      setOpen(false)
      router.push('/playlists')
      showMessage('Success', 'Playlist deleted successfully.')
    } catch (error) {
      console.error('Error deleting playlist:', error)
      showMessage('Error', 'Failed to delete playlist.', 'error')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button 
          variant="default"
          size="sm" 
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit Playlist
        </Button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[600px] bg-card rounded-lg shadow-lg p-6 border border-border">
          <Dialog.Title className="text-lg font-semibold mb-1 text-foreground">
            Edit Playlist
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Manage your playlist details and songs.
          </Dialog.Description>

          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex space-x-1 border-b border-border mb-4">
              <Tabs.Trigger
                value="details"
                className="px-4 py-2 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Details
              </Tabs.Trigger>
              <Tabs.Trigger
                value="songs"
                className="px-4 py-2 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Playlist Songs
              </Tabs.Trigger>
              <Tabs.Trigger
                value="library"
                className="px-4 py-2 text-sm text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                Song Library
              </Tabs.Trigger>
              <Tabs.Trigger
                value="delete"
                className="px-4 py-2 text-sm text-destructive data-[state=active]:text-destructive data-[state=active]:border-b-2 data-[state=active]:border-destructive"
              >
                Delete
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="details" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Playlist name"
                    className="bg-transparent text-card-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add an optional description"
                    className="bg-transparent text-card-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button onClick={handleUpdateDetails} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Details
                </Button>
              </div>
            </Tabs.Content>

            <Tabs.Content value="songs" className="space-y-4">
              {/* Current Songs List with Reordering */}
              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Current Playlist Songs</h3>
                  <p className="text-sm text-muted-foreground">Drag to reorder or remove songs</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {existingSongsList.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No songs in playlist
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={existingSongsList}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="divide-y">
                          {existingSongsList.map(song => (
                            <SortableItem key={song.id} id={song.id}>
                              <div className="flex items-center gap-2 p-3 bg-transparent group">
                                <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors cursor-grab" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{song.title}</p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="library" className="space-y-4">
              {/* Song Library Content */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="search"
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-card-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Select.Root value={genreFilter} onValueChange={setGenreFilter}>
                    <Select.Trigger className="w-[180px] bg-transparent text-card-foreground">
                      <Select.Value placeholder="All Genres" />
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content>
                        <Select.ScrollUpButton />
                        <Select.Viewport>
                          <Select.Item value="all">
                            <Select.ItemText>All Genres</Select.ItemText>
                          </Select.Item>
                          {genres.map(genre => (
                            <Select.Item key={genre} value={genre}>
                              <Select.ItemText>{genre}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                        <Select.ScrollDownButton />
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div className="border rounded-md">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Available Songs</h3>
                    <p className="text-sm text-muted-foreground">Click + to add songs to your playlist</p>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y">
                    {filteredSongs.map(song => (
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
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="delete" className="space-y-4">
              <div className="space-y-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Delete Playlist</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this playlist? This action cannot be undone.
                  All songs in the playlist will be removed, but they will remain in your library.
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeletePlaylist}
                >
                  Delete Playlist
                </Button>
              </div>
            </Tabs.Content>
          </Tabs.Root>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 inline-flex items-center justify-center rounded-full w-8 h-8 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Toast Message */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border border-border z-[100] ${
          toastMessage.type === 'error' 
            ? 'bg-destructive text-destructive-foreground border-destructive/50' 
            : 'bg-background text-foreground'
        }`}>
          <h4 className="font-medium">{toastMessage.title}</h4>
          <p className="text-sm opacity-90">{toastMessage.description}</p>
        </div>
      )}
    </Dialog.Root>
  )
} 
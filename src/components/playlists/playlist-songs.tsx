'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { GripVertical } from 'lucide-react'
import { SortableItem } from './sortable-item'
import { updatePlaylistSongPositions } from '@/lib/firestore/playlists'
import type { Song } from '@/types/music/song'

interface PlaylistSongsProps {
  playlistId: string
  userId: string
  songs: Song[]
}

export function PlaylistSongs({ playlistId, userId, songs }: PlaylistSongsProps) {
  const router = useRouter()
  const [items, setItems] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Update local items when songs prop changes
  useEffect(() => {
    setItems(songs)
  }, [songs])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)

      // Update positions in Firestore
      try {
        setIsLoading(true)
        const updatedSongIds = newItems.map((song, index) => ({
          id: song.id,
          position: index
        }))
        await updatePlaylistSongPositions(playlistId, updatedSongIds)
      } catch (error) {
        console.error('Error updating song positions:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No songs in this playlist yet</p>
          <p className="text-sm mt-2">Add songs from the songbook to get started</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {items.map((song) => (
                <SortableItem key={song.id} id={song.id}>
                  <div 
                    className="flex items-center gap-2 p-3 bg-card rounded-lg group hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/song/${song.id}`)}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                      </p>
                    </div>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
} 
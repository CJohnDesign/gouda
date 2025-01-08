'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GripVertical, Loader2 } from 'lucide-react'
import type { Song } from '@/types/music/song'
import { cn } from '@/lib/utils'
import { updatePlaylist } from '@/lib/firestore/playlists'
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

interface PlaylistSongsProps {
  playlistId: string
  userId: string
  songs: Song[]
}

export function PlaylistSongs({ playlistId, userId, songs }: PlaylistSongsProps) {
  const router = useRouter()
  const [items, setItems] = useState<Song[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

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
      setIsUpdating(true)
      try {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        setItems(newItems)

        // Update playlist with new song order
        await updatePlaylist(playlistId, {
          songs: newItems.map(song => song.id)
        })
      } catch (error) {
        console.error('Error updating song positions:', error)
        // Revert to original order on error
        setItems(songs)
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleSongClick = (e: React.MouseEvent, song: Song, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/song/${song.id}?playlistId=${playlistId}&position=${index + 1}`)
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
              {items.map((song, index) => (
                <SortableItem key={song.id} id={song.id}>
                  {(listeners) => (
                    <div
                      role="button"
                      className={cn(
                        "flex w-full flex-row items-center gap-2 p-3 rounded-lg group",
                        "bg-card hover:bg-muted transition-colors",
                        "text-card-foreground"
                      )}
                      onClick={(e) => handleSongClick(e, song, index)}
                    >
                      <div {...listeners} className="flex items-center cursor-grab">
                        {isUpdating ? (
                          <Loader2 className="h-5 w-5 text-muted-foreground/40 animate-spin" />
                        ) : (
                          <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-card-foreground">
                          {song.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist} • {song.theory.key} • {song.theory.bpm} BPM
                        </p>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
} 
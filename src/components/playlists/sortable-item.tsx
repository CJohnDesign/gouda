'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'

interface SortableItemProps {
  id: string
  children: (listeners: SyntheticListenerMap) => React.ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : undefined
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children(listeners || {})}
    </div>
  )
} 
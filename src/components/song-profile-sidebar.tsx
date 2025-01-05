'use client'

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Song } from '@/types/music/song'

interface SongProfileSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  song: Partial<Song>;
}

export function SongProfileSidebar({ 
  isOpen,
  onClose,
  song
}: SongProfileSidebarProps) {
  return (
    <div 
      className={cn(
        // Mobile: fullscreen overlay
        "fixed inset-0 z-50 bg-background transform transition-all duration-300 ease-in-out",
        // Desktop: static sidebar, always visible
        "md:static md:h-screen md:w-64 md:translate-y-0 md:translate-x-0 md:block",
        // Mobile: slide from top
        isOpen ? "translate-y-0" : "-translate-y-full",
        // Hide on mobile when closed
        !isOpen && "invisible md:visible"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 sm:hidden text-foreground hover:text-primary"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close sidebar</span>
      </Button>

      <ScrollArea className="h-screen">
        {/* Cover Box */}
        <div className="w-full aspect-square bg-muted border-b border-border" />

        <div className="p-6 md:p-4 space-y-6">
          {/* Key Music Theory */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-primary border-b border-primary/20 pb-2">
              Music Theory
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Key:</span> <span className="text-foreground">{song.theory?.key}</span></p>
              <p><span className="text-muted-foreground">Time:</span> <span className="text-foreground">{song.theory?.timeSignature?.join('/')}</span></p>
              <p><span className="text-muted-foreground">Tempo:</span> <span className="text-foreground">{song.theory?.bpm} BPM</span></p>
              <p><span className="text-muted-foreground">Mode:</span> <span className="text-foreground">{song.theory?.mode}</span></p>
              <p><span className="text-muted-foreground">Scale:</span> <span className="text-foreground">{song.theory?.scale}</span></p>
            </div>
          </div>

          {/* Song Details */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-primary border-b border-primary/20 pb-2">
              Song Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Artist:</span> <span className="text-foreground">{song.artist}</span></p>
              <p><span className="text-muted-foreground">Album:</span> <span className="text-foreground">{song.album}</span></p>
              <p><span className="text-muted-foreground">Duration:</span> <span className="text-foreground">{song.duration}</span></p>
              <p><span className="text-muted-foreground">Year:</span> <span className="text-foreground">{song.releaseYear}</span></p>
              <p><span className="text-muted-foreground">Writer:</span> <span className="text-foreground">{song.writer}</span></p>
            </div>
          </div>

          {/* Vocal & Performance */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-primary border-b border-primary/20 pb-2">
              Vocal & Performance
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Range:</span> <span className="text-foreground">{song.theory?.melodicAnalysis.vocalRange}</span></p>
              <p><span className="text-muted-foreground">Techniques:</span> <span className="text-foreground">{song.theory?.melodicAnalysis.vocalTechniques.join(', ')}</span></p>
              <p><span className="text-muted-foreground">Vocals:</span> <span className="text-foreground">{song.hasFemaleVocals ? 'Female' : song.hasMaleVocals ? 'Male' : 'None'}</span></p>
              <p><span className="text-muted-foreground">Guitar Solo:</span> <span className="text-foreground">{song.hasGuitarSolo ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 
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
        // Base styles
        "fixed inset-y-0 right-0 z-50 w-full sm:w-96 lg:w-64",
        // Mobile styles
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "sm:bg-background sm:backdrop-blur-none",
        // Border and transform
        "transform transition-transform duration-300 ease-in-out border-l border-primary/30",
        // Slide transform for all screen sizes
        !isOpen ? "translate-x-full" : "translate-x-0"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 lg:hidden text-foreground hover:text-primary"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close sidebar</span>
      </Button>

      <ScrollArea className="h-screen">
        {/* Cover Box */}
        <div className="w-full aspect-square bg-muted border-b border-border" />

        <div className="p-6 lg:p-4 space-y-6">
          {/* Key Music Theory */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-foreground dark:text-primary border-b border-primary/20 pb-2">
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

          {/* Genre */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-foreground dark:text-primary border-b border-primary/20 pb-2">
              Genre
            </h3>
            <div className="flex flex-wrap gap-2">
              {song.genre?.map((genre) => (
                <span key={genre} className="px-3 py-1 text-sm rounded-full border border-[0.75px] border-border text-muted-foreground">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-foreground dark:text-primary border-b border-primary/20 pb-2">
              Mood
            </h3>
            <div className="flex flex-wrap gap-2">
              {song.mood?.map((mood) => (
                <span key={mood} className="px-3 py-1 text-sm rounded-full border border-[0.75px] border-border text-muted-foreground">
                  {mood}
                </span>
              ))}
            </div>
          </div>

          {/* Vocal & Performance */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-foreground dark:text-primary border-b border-primary/20 pb-2">
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
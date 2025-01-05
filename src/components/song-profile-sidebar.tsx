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
        "fixed inset-0 z-50 bg-[#f1e0b4] transform transition-all duration-300 ease-in-out",
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
        className="absolute top-4 right-4 z-50 sm:hidden text-[#262223] hover:text-[#de9c0e]"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Close sidebar</span>
      </Button>

      <ScrollArea className="h-screen">
        {/* Cover Box */}
        <div className="w-full aspect-square bg-[#262223]/5 border-b border-[#262223]/10" />

        <div className="p-6 md:p-4 space-y-6">
          {/* Key Music Theory */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-[#262223]/75">
              Music Theory
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#262223]/75">Key:</span> {song.theory?.key}</p>
              <p><span className="text-[#262223]/75">Time:</span> {song.theory?.timeSignature?.join('/')}</p>
              <p><span className="text-[#262223]/75">Tempo:</span> {song.theory?.bpm} BPM</p>
              <p><span className="text-[#262223]/75">Mode:</span> {song.theory?.mode}</p>
              <p><span className="text-[#262223]/75">Scale:</span> {song.theory?.scale}</p>
            </div>
          </div>

          {/* Song Details */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-[#262223]/75">
              Song Details
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#262223]/75">Artist:</span> {song.artist}</p>
              <p><span className="text-[#262223]/75">Album:</span> {song.album}</p>
              <p><span className="text-[#262223]/75">Duration:</span> {song.duration}</p>
              <p><span className="text-[#262223]/75">Year:</span> {song.releaseYear}</p>
              <p><span className="text-[#262223]/75">Writer:</span> {song.writer}</p>
            </div>
          </div>

          {/* Vocal & Performance */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest mb-3 text-[#262223]/75">
              Vocal & Performance
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-[#262223]/75">Range:</span> {song.theory?.melodicAnalysis.vocalRange}</p>
              <p><span className="text-[#262223]/75">Techniques:</span> {song.theory?.melodicAnalysis.vocalTechniques.join(', ')}</p>
              <p><span className="text-[#262223]/75">Vocals:</span> {song.hasFemaleVocals ? 'Female' : song.hasMaleVocals ? 'Male' : 'None'}</p>
              <p><span className="text-[#262223]/75">Guitar Solo:</span> {song.hasGuitarSolo ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
} 
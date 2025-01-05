'use client'

import React from "react"
import { ChordGrid } from "./chord-grid"
import type { Song } from "@/types/music/song"

interface ChordSheetProps {
  song: Partial<Song>;
}

export function ChordSheet({ song }: ChordSheetProps) {
  if (!song.structure || song.structure.length === 0) {
    return (
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          No chord sheet available for this song.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-auto">
      <div className="max-w-4xl mx-auto space-y-16 px-2 md:px-4 lg:px-8">
        {song.structure.map((section, index) => (
          <div key={index}>
            <h3 className="text-xs uppercase tracking-widest mb-6 text-primary">
              {section.section}
            </h3>
            <div>
              <div className="space-y-4 mb-4">
                {section.lyrics.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-xl font-mono text-muted-foreground leading-snug tracking-wide whitespace-pre-wrap max-w-[65ch]">
                    {line}
                  </p>
                ))}
              </div>
              <div className="rounded-md">
                <ChordGrid 
                  chords={section.chords} 
                  bars={Math.ceil(section.chords.length / 4)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
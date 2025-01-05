'use client'

import React from "react"
import { ChordGrid } from "./chord-grid"
import type { Song } from "@/types/music/song"

interface ChordSheetProps {
  song: Partial<Song>;
}

export function ChordSheet({ song }: ChordSheetProps) {
  if (!song.sections || song.sections.length === 0) {
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
        {song.sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-xs uppercase tracking-widest mb-6 text-primary">
              {section.type}
            </h3>
            {section.content.map((content, contentIndex) => (
              <div key={contentIndex}>
                <div className="mb-4 rounded-md overflow-hidden border border-[0.75px] border-primary/20">
                  <ChordGrid 
                    chords={content.chordProgression} 
                    bars={Math.ceil(content.chordProgression.length / 4)}
                  />
                </div>
                <div className="space-y-2">
                  {content.lyrics.map((line, lineIndex) => (
                    <p key={lineIndex} className="text-xl font-mono text-muted-foreground leading-relaxed tracking-wide whitespace-pre-wrap max-w-[65ch] mx-auto text-center">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 
import React from "react"

interface ChordGridProps {
  chords: string[];
  bars: number;
}

export function ChordGrid({ chords, bars }: ChordGridProps) {
  const rows = Math.ceil(bars / 4);

  return (
    <div className="grid gap-px bg-[#262223]/10">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-px">
          {[...Array(4)].map((_, colIndex) => {
            const chordIndex = rowIndex * 4 + colIndex;
            return (
              <div key={colIndex} className="bg-[#262223]/5 p-2 flex items-center justify-center h-16">
                <span className="font-mono text-xl text-[#262223]/85">
                  {chordIndex < chords.length ? chords[chordIndex] : "\u00A0"}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  )
} 
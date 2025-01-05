import React from "react"

interface ChordGridProps {
  chords: string[];
  bars: number;
}

export function ChordGrid({ chords }: ChordGridProps) {
  // Split chords into groups of 4
  const chordRows = chords.reduce((rows: string[][], chord: string, index: number) => {
    if (index % 4 === 0) rows.push([]);
    rows[rows.length - 1].push(chord);
    return rows;
  }, []);

  return (
    <div className="grid gap-px bg-border">
      {chordRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-px">
          {row.map((chord, colIndex) => (
            <div key={colIndex} className="bg-background p-2 flex items-center justify-center h-16">
              <span className="font-mono text-xl text-foreground">
                {chord}
              </span>
            </div>
          ))}
          {/* Fill empty spaces with blank cells to maintain grid */}
          {[...Array(4 - row.length)].map((_, i) => (
            <div key={`empty-${i}`} className="bg-background p-2 flex items-center justify-center h-16">
              <span className="font-mono text-xl text-foreground">
                {"\u00A0"}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
} 
import React from "react"

interface ChordGridProps {
  chords: string[];
  bars: number;
}

interface ProcessedChord {
  main: string;
  parentheticals: string[];
}

function processChords(chords: string[]): ProcessedChord[] {
  const processed: ProcessedChord[] = [];
  
  chords.forEach((chord, index) => {
    if (chord.startsWith('(')) {
      // If this is a parenthetical chord, add it to the previous chord
      if (processed.length > 0) {
        processed[processed.length - 1].parentheticals.push(chord.slice(1, -1));
      }
    } else {
      // Regular chord
      processed.push({ 
        main: chord,
        parentheticals: []
      });
    }
  });
  
  return processed;
}

export function ChordGrid({ chords }: ChordGridProps) {
  // Process chords and split into groups of 4
  const processedChords = processChords(chords);
  const chordRows = processedChords.reduce((rows: ProcessedChord[][], chord: ProcessedChord, index: number) => {
    if (index % 4 === 0) rows.push([]);
    rows[rows.length - 1].push(chord);
    return rows;
  }, []);

  return (
    <div className="grid gap-px bg-border">
      {chordRows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-px">
          {row.map((chord, colIndex) => (
            <div key={colIndex} className="bg-background p-2 flex items-center justify-center h-16 gap-1.5">
              <span className="font-mono text-xl text-foreground">
                {chord.main}
              </span>
              {chord.parentheticals.map((passing, i) => (
                <span key={i} className="font-mono text-sm text-foreground/65">
                  ({passing})
                </span>
              ))}
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
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
  
  chords.forEach((chord) => {
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
  const processedChords = processChords(chords);
  const chordsPerRow = processedChords.length <= 2 ? 2 : 4;
  const chordRows = processedChords.reduce((rows: ProcessedChord[][], chord: ProcessedChord, index: number) => {
    if (index % chordsPerRow === 0) rows.push([]);
    rows[rows.length - 1].push(chord);
    return rows;
  }, []);

  return (
    <div>
      {chordRows.map((row, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`grid`}
          style={{ gridTemplateColumns: `repeat(${chordsPerRow}, 1fr)` }}
        >
          {row.map((chord, colIndex) => (
            <div 
              key={colIndex} 
              className={`
                bg-background p-4 flex items-center justify-center h-16
                ${colIndex > 0 ? 'border-l border-muted-foreground/30 dark:border-primary/30' : ''}
                ${rowIndex > 0 ? 'border-t border-muted-foreground/30 dark:border-primary/30' : ''}
                transition-all
              `}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl text-foreground">{chord.main}</span>
                <div className={chord.parentheticals.length > 1 ? "flex flex-col" : "flex"}>
                  {chord.parentheticals.map((passing, i) => (
                    <span key={i} className="font-mono text-lg text-foreground/65">({passing})</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {[...Array(chordsPerRow - row.length)].map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className={`
                bg-background p-4 flex items-center justify-center h-16
                ${row.length + i > 0 ? 'border-l border-muted-foreground/30 dark:border-primary/30' : ''}
                ${rowIndex > 0 ? 'border-t border-muted-foreground/30 dark:border-primary/30' : ''}
              `}
            />
          ))}
        </div>
      ))}
    </div>
  )
} 
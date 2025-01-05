// Music theory details for a song
export interface MusicTheory {
  key: string;
  scale: string;
  mode: string;
  tempoMarking: string;
  timeSignature: [number, number];
  bpm: number;
  harmonicAnalysis: HarmonicAnalysis;
  melodicAnalysis: MelodicAnalysis;
}

// Harmonic analysis details
export interface HarmonicAnalysis {
  chordProgression: string;
  secondaryDominants?: string[];
  borrowedChords?: string[];
  modulationSections?: string[];
}

// Melodic analysis details
export interface MelodicAnalysis {
  vocalRange: string;
  vocalTechniques: string[];
  motifs: string[];
  phrasingPatterns: string[];
} 
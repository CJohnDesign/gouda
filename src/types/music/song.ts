import { MetadataEntity } from '../metadata';
import { MusicTheory } from './theory';

// Song sections (e.g., intro, verse, chorus) with linked lyrics and chord progressions
export interface SongSection {
  type: 'Intro' | 'Verse' | 'Chorus' | 'Bridge' | 'Outro' | 'Pre-Chorus' | 'Refrain' | 'Interlude' | 'Solo' | 'Coda';
  content: SectionContent[];
  rhythmPattern: string;
  keyChange?: string;
}

// Content for each song section
export interface SectionContent {
  lyrics: string[];
  chordProgression: string[];
}

// Chart performance section
export interface ChartPerformance {
  chartName: string;
  position: number;
}

// Main Song interface
export interface Song extends MetadataEntity {
  id: string;
  title: string;
  artist: string;
  featuring?: string[];
  artistId: string;
  album: string;
  albumId: string;
  writer: string;
  coverUrl: string;
  description: string;
  releaseYear: number;
  genre: string[];
  mood: string[];
  duration: string;
  sections: SongSection[];
  theory: MusicTheory;
  chartPerformance?: ChartPerformance[];
  hasMaleVocals?: boolean;
  hasFemaleVocals?: boolean;
  hasGuitarSolo?: boolean;
} 

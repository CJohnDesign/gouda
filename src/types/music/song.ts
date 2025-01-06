import { MetadataEntity } from '../metadata';
import { MusicTheory } from './theory';

// Song structure section
export interface SongStructureSection {
  section: string;
  lyrics: string[];
  chords: string[];
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
  structure: SongStructureSection[];
  theory: MusicTheory;
  chartPerformance?: ChartPerformance[];
  hasMaleVocals?: boolean;
  hasFemaleVocals?: boolean;
  hasGuitarSolo?: boolean;
}

// Chart performance section
export interface ChartPerformance {
  chartName: string;
  position: number;
}

// Song request interface
export interface SongRequest extends MetadataEntity {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  genre?: string[];
  createdAt: string;
  updatedAt?: string | null;
} 

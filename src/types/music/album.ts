import { MetadataEntity } from '../metadata';

// Album interface
export interface Album extends MetadataEntity {
  id: string;
  title: string;
  artistId: string;
  releaseYear: number;
  coverUrl: string;
  genre: string[];
  description?: string;
  songs: string[];
} 
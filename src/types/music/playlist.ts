import { MetadataEntity } from '../metadata';

// Playlist interface
export interface Playlist extends MetadataEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  songs: string[];
  isPublic: boolean;
  tags?: string[];
} 
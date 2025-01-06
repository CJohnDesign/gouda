import { MetadataEntity } from '../metadata';

// Role type for playlist access
export type PlaylistRole = 'owner' | 'editor' | 'viewer';

// Playlist interface
export interface Playlist extends MetadataEntity {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  songs: string[];  // Array of song IDs
  isPublic: boolean;
  tags?: string[];
  likeCount: number;
  shareCount: number;
}

// Playlist access interface
export interface PlaylistAccess {
  userId: string;
  role: PlaylistRole;
  addedAt: string;
}

// User's playlist reference
export interface UserPlaylist {
  id: string;
  role: PlaylistRole;
  addedAt: string;
} 
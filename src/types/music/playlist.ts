// Role type for playlist access
export type PlaylistRole = 'owner' | 'editor' | 'viewer';

// Playlist interface
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  songs: string[];  // Array of song IDs
  isPublic: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  metadata?: {
    isPublished: boolean;
    isFeatured: boolean;
    isPrivate: boolean;
    isDeleted: boolean;
    isDraft: boolean;
    isPending: boolean;
    isApproved: boolean;
    isRejected: boolean;
    isHidden: boolean;
  };
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
  addedAt: string | null;
} 
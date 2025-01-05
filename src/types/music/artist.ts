import { MetadataEntity } from '../metadata';

// Social media links for artists
export interface SocialLink {
  platform: string;
  url: string;
}

// Artist interface
export interface Artist extends MetadataEntity {
  id: string;
  name: string;
  bio: string;
  coverUrl: string;
  genre: string[];
  activeYears: string;
  albums: string[];
  songs: string[];
  socialLinks?: SocialLink[];
} 
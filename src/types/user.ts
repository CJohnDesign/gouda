import { Metadata } from './metadata';

export interface User {
  // Core identity fields
  id: string;
  uid: string; // Keep for backward compatibility
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  
  // Profile fields
  bio?: string;
  location?: string;
  avatarUrl?: string;
  profilePicUrl?: string; // Legacy field
  phoneNumber?: string;
  telegramUsername?: string;

  // Collections/Lists
  playlists: string[];
  favoriteSongs: string[];
  favoriteArtists: string[];
  favoriteAlbums: string[];

  // Stripe billing fields
  stripeCustomerId?: string;
  subscriptionStatus?: 'Active' | 'Unpaid' | 'Cancelled';
  stripePaymentMethods?: string[]; // IDs of saved payment methods
  stripeBillingDetails?: {
    address?: {
      city: string;
      country: string;
      line1: string;
      line2?: string;
      postal_code: string;
      state: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt?: string | null;
  
  // Metadata flags
  metadata: Metadata;
}

// For backward compatibility during migration
export type UserProfile = User; 
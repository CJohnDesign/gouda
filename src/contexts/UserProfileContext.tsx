'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAuth, User } from 'firebase/auth';
import { app } from '@/firebase/firebase';
import type { UserProfile } from '@/types/user';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// List of public routes that don't require authentication
const publicRoutes = ['/', '/join', '/login'];

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = getAuth(app);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          router.push('/account/profile');
          return;
        }
        throw new Error(errorData.error?.message || 'Failed to fetch profile');
      }

      const profileData = await response.json();
      setProfile(profileData);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  }, [router]);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        await fetchProfile(user);
      } else {
        setUser(null);
        setProfile(null);
        if (!publicRoutes.includes(pathname)) {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router, pathname, fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ user, profile, loading, error, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
} 
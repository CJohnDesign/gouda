'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { StorageWarning } from '@/components/ui/storage-warning'
import { setupAuthPersistence } from '@/lib/auth/firebase-auth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme, theme } = useTheme()

  // Force light mode for auth pages
  useEffect(() => {
    // Immediately set to light mode
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
    setTheme('light')

    // Prevent theme changes while in auth layout
    return () => {
      document.documentElement.classList.remove('no-transitions')
    }
  }, [setTheme])

  // Setup auth persistence on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const persistenceType = await setupAuthPersistence();
        console.log('Auth persistence initialized:', persistenceType);
      } catch (error) {
        console.error('Error setting up auth persistence:', error);
      }
    };
    
    initAuth();
  }, []);

  // Ensure light mode is maintained
  if (theme !== 'light') {
    setTheme('light')
  }

  return (
    <>
      {children}
      <StorageWarning />
    </>
  )
} 
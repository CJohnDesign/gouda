'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

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

  // Ensure light mode is maintained
  if (theme !== 'light') {
    setTheme('light')
  }

  return children
} 
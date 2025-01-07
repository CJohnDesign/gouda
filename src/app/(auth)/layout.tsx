'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  // Force light mode for auth pages
  useEffect(() => {
    // Set theme without transition to avoid flash
    document.documentElement.classList.add('no-transitions')
    setTheme('light')
    
    // Remove the no-transitions class after a short delay
    const timeout = setTimeout(() => {
      document.documentElement.classList.remove('no-transitions')
    }, 100)

    return () => {
      clearTimeout(timeout)
      document.documentElement.classList.remove('no-transitions')
    }
  }, [setTheme])

  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  )
} 
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
    setTheme('light')
    return () => {
      // Reset to system theme when leaving auth pages
      setTheme('system')
    }
  }, [setTheme])

  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  )
} 
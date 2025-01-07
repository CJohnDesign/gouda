'use client'

import React, { useEffect, useState } from 'react'
import { useUserProfile } from '../../contexts/UserProfileContext'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const PUBLIC_ROUTES = ['/', '/login', '/join']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUserProfile()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname || '')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user && !isPublicRoute) {
      router.push('/login')
    }
  }, [user, isLoading, router, pathname, isPublicRoute, mounted])

  // Always show loading state until mounted and while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render anything if we're not authenticated on a protected route
  if (!user && !isPublicRoute) {
    return null
  }

  // Render children if:
  // 1. We're authenticated, or
  // 2. We're on a public route
  return <>{children}</>
} 
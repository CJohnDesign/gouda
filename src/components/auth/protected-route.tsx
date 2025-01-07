'use client'

import React, { useEffect } from 'react'
import { useUserProfile } from '../../contexts/UserProfileContext'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const PUBLIC_ROUTES = ['/', '/login', '/join']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUserProfile()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname)) {
      router.push('/login')
    }
  }, [user, loading, router, pathname])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    return null
  }

  return <>{children}</>
} 
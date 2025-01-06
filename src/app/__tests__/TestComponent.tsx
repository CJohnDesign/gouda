'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'

export function TestComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, loading } = useUserProfile()

  if (loading) {
    return null
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const protectedRoutes = ['/playlist/', '/song/']
  const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route))

  if (isProtectedRoute && profile?.subscriptionStatus !== 'Active') {
    router.push('/songbook')
    return null
  }

  return <div>Test Component</div>
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'

export default function Home() {
  const router = useRouter()
  const { user } = useUserProfile()

  useEffect(() => {
    if (user) {
      router.push('/songbook')
    }
  }, [user, router])

  return null
}


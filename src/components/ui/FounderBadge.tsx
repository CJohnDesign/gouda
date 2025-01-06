'use client'

import { useUserProfile } from '@/contexts/UserProfileContext'
import { Badge } from '@/components/ui/badge'

export function FounderBadge() {
  const { profile } = useUserProfile()

  if (!profile?.isSubscribed) return null

  return (
    <Badge variant="secondary" className="rounded-md">
      Founder
    </Badge>
  )
} 
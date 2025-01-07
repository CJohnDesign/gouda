'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import analytics from '@/lib/analytics'

function AnalyticsContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  // Only track page views after component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    analytics.trackPageView(url)
  }, [pathname, searchParams, isMounted])

  return null
}

export function Analytics() {
  return (
    <Suspense>
      <AnalyticsContent />
    </Suspense>
  )
} 
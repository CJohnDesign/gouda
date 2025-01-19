'use client'

import { useEffect, useState } from 'react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { PublicPageLayout } from '@/components/layout/public-page-layout'

export default function Home() {
  const { user, isLoading } = useUserProfile()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only redirect to songbook if user is logged in
  useEffect(() => {
    if (mounted && !isLoading && user) {
      router.push('/songbook')
    }
  }, [user, isLoading, router, mounted])

  // Show loading state until mounted
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show landing page for non-logged in users
  return (
    <PublicPageLayout>
      <Logo />
      <h1 className="text-3xl font-bold text-foreground mb-4">Ready to Rock? 🎸</h1>
      <p className="text-foreground text-lg mb-8">
        Where music lovers become music makers. Group lessons, training tools and a helpful community. <strong>Opening March 2025!</strong>  
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Button 
            variant="filled"
            size="lg"
            className="w-full text-[21px] leading-[32px] font-bold"
            asChild
          >
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
        </div>
        
        <p className="text-[14px] text-muted-foreground">
          Want a sneak peek?? <Link href="/join" className="hover:text-primary hover:underline underline">Join</Link>
        </p>
      </div>
    </PublicPageLayout>
  )
}


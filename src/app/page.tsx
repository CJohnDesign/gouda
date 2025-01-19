'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const montserrat = Montserrat({ subsets: ['latin'] })

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
    <main className={`min-h-screen flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <div className="mb-8">
          <Image
            src="/images/GOUDA_Logo.webp"
            alt="Gouda"
            width={300}
            height={300}
            className="mx-auto"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Learn Music Better</h1>
        <p className="text-foreground text-lg mb-8">
          Something special is coming! Join the waitlist to be the first to know when we launch our <strong>weekly group lessons</strong>, instructional videos and helpful community.
        </p>
        <div className="space-y-4">
          <Button 
            variant="filled"
            size="lg"
            className="w-full text-[21px] leading-[32px] font-bold"
            asChild
          >
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
          
          <p className="text-[14px] text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}


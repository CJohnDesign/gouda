'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Corners } from "@/components/ui/borders"
import { Montserrat } from 'next/font/google'
import { Navbar } from "@/components/ui/Navbar"
import Link from 'next/link'
import { useUserProfile } from '@/contexts/UserProfileContext'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

export default function Home() {
  const router = useRouter()
  const { user, loading } = useUserProfile()

  useEffect(() => {
    // Only redirect to studio if user is logged in
    if (!loading && user) {
      router.push('/studio')
    }
  }, [loading, user, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#262223]">Loading...</div>
      </div>
    )
  }

  // If not logged in, show the homepage
  return (
    <main className={`min-h-screen bg-[#f1e0b4] flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <Navbar />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        {/* Logo Section */}
        <div className="relative w-full aspect-square max-w-[300px] mx-auto mb-8">
          <Image
            src="/images/GOUDA_Logo.png"
            alt="Gouda & Company Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[18px] leading-[24px] font-regular text-[#262223] max-w-[390px] mx-auto mb-4">
              Gouda & Company is a music school focusing on rocking at jam sessions.<br/>
              All instruments welcome!
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full h-[48px] text-[21px] leading-[32px] font-bold bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-black"
            asChild
          >
            <Link href="/join">
              JOIN
            </Link>
          </Button>

          {/* Footer Info */}
          <div className="space-y-1 text-[#262223]">
            <p className="text-[14px] leading-[21px] font-medium">
              Group Lessons Twice a Month <br/>
              in North Miami Beach + Telegram Community
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}


'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'

const montserrat = Montserrat({ subsets: ['latin'] })

export default function Home() {
  const { setTheme } = useTheme()
  const { user } = useUserProfile()

  useEffect(() => {
    if (!user) {
      setTheme('light')
    }
  }, [user, setTheme])

  return (
    <main className={`min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <div className="mb-8">
          <Image
            src="/images/GOUDA_Logo.png"
            alt="Gouda"
            width={300}
            height={300}
            className="mx-auto"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Learn Music Better</h1>
        <p className="text-foreground text-lg mb-8">Join Gouda & Company to get <strong>weekly group lessons</strong>, instructional videos and a helpful community.</p>
        <div className="space-y-4">
          <Link 
            href="/join" 
            className="block w-full h-[48px] text-[21px] leading-[48px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
          >
            Join Now
          </Link>
          
          <p className="text-[14px] text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}


'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

const montserrat = Montserrat({ subsets: ['latin'] })

interface PublicPageLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PublicPageLayout({
  children,
  className,
}: PublicPageLayoutProps) {
  return (
    <main className={cn(
      'min-h-screen flex flex-col items-center justify-center',
      'pt-2 sm:pt-4 md:pt-8 lg:pt-12',
      'px-2 sm:px-2 md:px-8',
      'pb-12 sm:pb-24',
      '[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:md:text-4xl',
      '[&_p]:text-sm [&_p]:sm:text-base [&_p]:md:text-lg',
      '[&_button]:text-base [&_button]:sm:text-lg [&_button]:md:text-xl',
      'z-[1]',
      montserrat.className,
      className
    )}>
      <Corners />
      <div className={cn(
        'w-full md:max-w-[500px] mx-auto text-center flex flex-col justify-center flex-1 z-[1]',
        'px-4 sm:px-6 md:px-8',
      )}>
        <Link href="/" className="block mb-4 sm:mb-6 md:mb-8">
          <Image
            src="/images/GOUDA_Logo.webp"
            alt="Gouda & Company"
            width={300}
            height={300}
            className="w-[200px] md:w-[300px] lg:w-[400px] mx-auto"
            priority
            quality={85}
            loading="eager"
          />
        </Link>
        {children}
      </div>
    </main>
  )
} 
'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import { cn } from '@/lib/utils'

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
      'pt-32 lg:pt-24 md:pt-16 sm:pt-12',
      'pb-12 lg:pb-12 md:pb-8 sm:pb-6',
      montserrat.className,
      className
    )}>
      <Corners />
      <div className={cn(
        'w-full mx-auto text-center flex flex-col justify-center flex-1 z-[1]',
        'px-8 lg:px-6 md:px-4 sm:px-4',
        'max-w-[320px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl'
      )}>
        {children}
      </div>
    </main>
  )
} 
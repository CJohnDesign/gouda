'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/ui/Navbar'

const navigationItems = [
  { name: 'Profile', href: '/account/profile' },
  { name: 'Subscription', href: '/account/subscription' },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === '/account') {
      router.replace('/account/profile')
    }
  }, [pathname, router])

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#f1e0b4] pt-16">
        <aside className="border-r border-[#262223]/10 px-4 py-8">
          <nav>
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm font-medium",
                      pathname === item.href
                        ? "bg-[#de9c0e] text-[#262223]"
                        : "text-[#262223] hover:bg-[#de9c0e]/10"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="py-8 px-4">
          {children}
        </main>
      </div>
    </>
  )
} 
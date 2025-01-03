'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/ui/Navbar'

const menuItems = [
  { name: 'Profile', href: '/account/profile' },
  { name: 'Subscription', href: '/account/subscription' },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f1e0b4] pt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <nav>
                <ul className="space-y-1">
                  {menuItems.map((item) => (
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
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 
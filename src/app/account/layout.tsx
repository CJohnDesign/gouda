'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/ui/Navbar'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Get the active page name and inactive items
  const activePage = menuItems.find(item => item.href === pathname)?.name || 'Menu'
  const inactiveItems = menuItems.filter(item => item.href !== pathname)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f1e0b4] pt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Mobile Navigation */}
            <div className="md:hidden flex flex-col gap-1">
              {/* Active Page */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 bg-[#de9c0e] text-[#262223] rounded-md shadow-sm"
              >
                <span className="text-sm font-medium">{activePage}</span>
                {isMenuOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {/* Inactive Items Menu */}
              {isMenuOpen && (
                <nav>
                  <ul className="space-y-1">
                    {inactiveItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-sm font-medium text-[#262223] hover:bg-[#de9c0e]/10"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
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
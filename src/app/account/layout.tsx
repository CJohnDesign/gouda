'use client'

import { Navbar } from "@/components/ui/Navbar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1 py-8">
              <Link
                href="/account/profile"
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === '/account/profile'
                    ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Profile
              </Link>
              <Link
                href="/account/subscription"
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === '/account/subscription'
                    ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Subscription
              </Link>
              <Link
                href="/account/settings"
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  pathname === '/account/settings'
                    ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                Settings
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 py-8 lg:pl-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 
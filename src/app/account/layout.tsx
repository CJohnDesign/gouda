'use client'

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Settings, User, CreditCard } from "lucide-react"
import { Navbar } from "@/components/ui/Navbar"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon?: React.ReactNode
  }[]
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const items = [
    {
      href: "/account/profile",
      title: "Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      href: "/account/subscription",
      title: "Subscription",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      href: "/account/settings",
      title: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="space-y-6 p-10 pb-16 mt-8">
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={items} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">{children}</div>
          </div>
        </div>
      </div>
    </>
  )
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted text-foreground"
              : "hover:bg-transparent hover:text-foreground",
            "justify-start",
            "flex gap-2 items-center"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 
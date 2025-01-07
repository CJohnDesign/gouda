"use client"

import { useUserProfile } from '@/contexts/UserProfileContext'
import { FounderBadge } from './FounderBadge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ProfileMenu() {
  const router = useRouter()
  const { user, profile } = useUserProfile()

  if (!user) return null

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0].toUpperCase() || '?'

  return (
    <div className="flex items-center gap-2">
      <FounderBadge />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-transparent">
            <Avatar className="h-8 w-8 bg-secondary">
              <AvatarImage src={profile?.photoURL || undefined} alt={profile?.displayName || user.email || 'User'} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/account/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/account/subscription')}>
            Subscription
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/account/settings')}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 
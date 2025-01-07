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
  const { user, profile, signOut } = useUserProfile()

  if (!user) return null

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0].toUpperCase() || '?'

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-2">
      <FounderBadge />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-transparent">
            <Avatar className="h-8 w-8 bg-secondary">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.name || user.email || 'User'} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{profile?.name || 'User'}</p>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 
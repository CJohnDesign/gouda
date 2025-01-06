"use client"

import Link from "next/link"
import { Book, Sparkles, ExternalLink, ListMusic } from "lucide-react"
import { Button } from "./button"
import { ProfileMenu } from "./profile-menu"
import { useUserProfile } from '@/contexts/UserProfileContext'
import { FounderBadge } from './FounderBadge'

export function Navbar() {
  return (
    <nav className="h-16 bg-background border-b border-primary/30">
      <div className="h-full max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2"
            asChild
          >
            <Link href="/songbook">
              <Book className="h-5 w-5" />
              <span>Songbook</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            asChild
          >
            <Link href="/songbook">
              <Book className="h-5 w-5" />
              <span className="sr-only">Songbook</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2"
            asChild
          >
            <Link href="/playlists">
              <ListMusic className="h-5 w-5" />
              <span>Playlists</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            asChild
          >
            <Link href="/playlists">
              <ListMusic className="h-5 w-5" />
              <span className="sr-only">Playlists</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2"
            asChild
          >
            <Link 
              href="https://chatgpt.com/g/g-papOU9639-harmonyquill"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles className="h-5 w-5" />
              <span>HarmonyQuill</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            asChild
          >
            <Link 
              href="https://chatgpt.com/g/g-papOU9639-harmonyquill"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles className="h-5 w-5" />
              <span className="sr-only">HarmonyQuill</span>
            </Link>
          </Button>
        </div>
        <ProfileMenu />
      </div>
    </nav>
  )
}

export function ProfileMenu() {
  const { user, profile } = useUserProfile()
  
  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <FounderBadge />
      {/* Existing profile menu content */}
    </div>
  )
}


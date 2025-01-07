"use client"

import Link from "next/link"
import { Book, Sparkles, ExternalLink, ListMusic } from "lucide-react"
import { Button } from "./button"
import { ProfileMenu } from "./profile-menu"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              asChild
            >
              <Link href="/songbook" className="nav-link">
                <Book className="h-4 w-4" />
                <span>Songbook</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden nav-button"
              asChild
            >
              <Link href="/songbook">
                <Book className="h-4 w-4" />
                <span className="sr-only">Songbook</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              asChild
            >
              <Link href="/playlists" className="nav-link">
                <ListMusic className="h-4 w-4" />
                <span>Playlists</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden nav-button"
              asChild
            >
              <Link href="/playlists">
                <ListMusic className="h-4 w-4" />
                <span className="sr-only">Playlists</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
              asChild
            >
              <Link 
                href="https://chatgpt.com/g/g-papOU9639-harmonyquill"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                <Sparkles className="h-4 w-4" />
                <span>HarmonyQuill</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden nav-button"
              asChild
            >
              <Link 
                href="https://chatgpt.com/g/g-papOU9639-harmonyquill"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Sparkles className="h-4 w-4" />
                <span className="sr-only">HarmonyQuill</span>
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-end">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}


"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserProfile } from "@/contexts/UserProfileContext"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/firebase"

export function ThemeToggle() {
  const { user, profile } = useUserProfile()
  const [mounted, setMounted] = React.useState(false)
  const [localIsDark, setLocalIsDark] = React.useState(profile?.isDarkMode ?? false)

  React.useEffect(() => {
    setMounted(true)
    if (profile?.isDarkMode !== undefined) {
      setLocalIsDark(profile.isDarkMode)
      document.documentElement.classList.toggle('dark', profile.isDarkMode)
    }
  }, [profile?.isDarkMode])

  const toggleTheme = React.useCallback(async () => {
    if (!user) return

    const newIsDarkMode = !localIsDark
    
    // Update local state and DOM immediately for responsive feel
    setLocalIsDark(newIsDarkMode)
    document.documentElement.classList.toggle('dark', newIsDarkMode)

    // Update Firestore
    const userRef = doc(db, 'users', user.uid)
    try {
      await updateDoc(userRef, {
        isDarkMode: newIsDarkMode
      })
    } catch (error) {
      // Revert on error
      console.error('Error updating theme preference:', error)
      setLocalIsDark(!newIsDarkMode)
      document.documentElement.classList.toggle('dark', !newIsDarkMode)
    }
  }, [user, localIsDark])

  if (!mounted || !user) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-transform ${localIsDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-transform ${localIsDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 
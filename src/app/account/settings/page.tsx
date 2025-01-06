'use client'

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { getAuth, signOut } from 'firebase/auth'
import { app } from '@/firebase/firebase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const auth = getAuth(app)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/') // Redirect to home after logout
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="border-b" />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">
              Theme
            </label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark mode.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="border-b" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-red-600">
              Sign Out
            </label>
            <p className="text-sm text-muted-foreground">
              Sign out of your account.
            </p>
          </div>
          <Button 
            variant="destructive"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
} 
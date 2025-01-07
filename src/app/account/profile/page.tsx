'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/components/ui/use-toast'
import { getUserId } from '@/lib/telegram'

function ProfilePageContent() {
  const router = useRouter()
  const { user, profile, isLoading, refreshProfile } = useUserProfile()
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    telegramUsername: '',
    phoneNumber: '',
    location: '',
    bio: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [telegramError, setTelegramError] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        telegramUsername: profile.telegramUsername || '',
        phoneNumber: profile.phoneNumber || '',
        location: profile.location || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  useEffect(() => {
    // Handle authentication check
    if (!isLoading && !user) {
      router.push('/')
      return
    }
  }, [isLoading, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear Telegram error when username is changed
    if (name === 'telegramUsername') {
      setTelegramError('')
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSaving(true)
    setTelegramError('')

    try {
      // Validate Telegram username if provided
      if (formData.telegramUsername) {
        const userId = await getUserId(formData.telegramUsername)
        if (!userId) {
          setTelegramError('Please start a chat with our bot first by clicking the link above.')
          setIsSaving(false)
          return
        }
      }

      const token = await user.getIdToken()
      const response = await fetch('/api/user-profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      await refreshProfile()
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile details...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Email</h3>
            <p>{profile.email}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">First Name</h3>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="bg-transparent"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Name</h3>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="bg-transparent"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Telegram Username</h3>
            <Input
              name="telegramUsername"
              value={formData.telegramUsername}
              onChange={handleInputChange}
              placeholder="Enter your Telegram username"
              className="bg-transparent"
            />
            {telegramError && (
              <Alert className="mt-2">
                <AlertDescription>
                  {telegramError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Phone Number</h3>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="bg-transparent"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Location</h3>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your location"
              className="bg-transparent"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              className="bg-transparent"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Member Since</h3>
            <p suppressHydrationWarning>
              {isMounted ? formatDate(profile.createdAt) : 'Loading...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(timestamp: string | { _seconds: number; _nanoseconds: number } | undefined) {
  if (!timestamp) return 'Not available'
  if (typeof timestamp === 'object' && '_seconds' in timestamp) {
    return new Date(timestamp._seconds * 1000).toLocaleDateString()
  }
  return new Date(timestamp).toLocaleDateString()
}

export default function ProfilePage() {
  return <ProfilePageContent />
}

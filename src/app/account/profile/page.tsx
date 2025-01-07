'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

function ProfilePageContent() {
  const router = useRouter()
  const { user, profile, isLoading, refreshProfile } = useUserProfile()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    telegramUsername: '',
    phoneNumber: '',
    location: '',
    bio: ''
  })
  const [isSaving, setIsSaving] = useState(false)

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
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSaving(true)

    try {
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
            <div className="flex">
              <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                @
              </div>
              <Input
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleInputChange}
                placeholder="Enter your Telegram username"
                className="bg-transparent rounded-l-none"
              />
            </div>
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
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  return <ProfilePageContent />
}

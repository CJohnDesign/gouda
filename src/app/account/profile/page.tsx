'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface ProfileFormData {
  username: string
  email: string
  phone: string
  location: string
  bio: string
  subscriptionStatus: 'active' | 'inactive' | 'trial'
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: 'johndoe',
    email: 'john@example.com', // Non-editable
    phone: '+1 (555) 123-4567',
    location: 'Miami, FL',
    bio: 'Frontend developer passionate about UI/UX',
    subscriptionStatus: 'active'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trial':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#262223]">Edit Profile</h1>
          <p className="text-sm text-[#262223]/60">Update your account information</p>
        </div>
        <Button 
          type="submit" 
          form="profile-form"
          className="bg-[#de9c0e] hover:bg-[#de9c0e]/90 text-[#262223]"
        >
          Save Changes
        </Button>
      </div>

      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-[#262223]">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-white text-[#262223]"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-[#262223]">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-[#262223]/5 text-[#262223]/60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-[#262223]">Subscription Status</Label>
              <Badge variant="secondary" className={getStatusColor(formData.subscriptionStatus)}>
                {formData.subscriptionStatus.charAt(0).toUpperCase() + formData.subscriptionStatus.slice(1)}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-[#262223]">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="bg-white text-[#262223]"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-[#262223]">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="bg-white text-[#262223]"
            />
          </div>

          <div>
            <Label htmlFor="bio" className="text-[#262223]">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself"
              className="h-32 bg-white text-[#262223]"
            />
          </div>
        </div>
      </form>
    </div>
  )
}

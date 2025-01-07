'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Suspense } from 'react'

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, isLoading } = useUserProfile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Handle authentication check
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    // Handle success message from auth redirect
    const success = searchParams.get('success')
    if (success === 'true') {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    }
  }, [isLoading, user, router, searchParams])

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
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>View and manage your profile details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="mt-1">{profile.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Display Name</h3>
            <p className="mt-1">{profile.displayName || 'Not set'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
            <p className="mt-1" suppressHydrationWarning>
              {isMounted ? new Date(profile.createdAt).toLocaleDateString() : profile.createdAt}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading your profile details...</CardDescription>
        </CardHeader>
      </Card>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}

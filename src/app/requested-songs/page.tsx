'use client'

import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { SongRequest } from '@/types/music/song'
import type { UserProfile } from '@/types/user'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Montserrat } from 'next/font/google'
import { RequestSongDialog } from '@/components/songs/request-song-dialog'

const montserrat = Montserrat({ subsets: ['latin'] })

interface RequestWithUser extends SongRequest {
  user?: UserProfile
}

export default function RequestedSongsPage() {
  const [requests, setRequests] = useState<RequestWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'songRequests'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requestsData: RequestWithUser[] = []
      
      for (const docSnap of snapshot.docs) {
        const request = { id: docSnap.id, ...docSnap.data() } as SongRequest
        
        // Fetch user profile for telegram username
        try {
          const userDocRef = doc(db, 'users', request.requestedBy)
          const userDocSnap = await getDoc(userDocRef)
          const userData = userDocSnap.data() as UserProfile | undefined
          requestsData.push({ ...request, user: userData })
        } catch (error) {
          console.error('Error fetching user data:', error)
          requestsData.push({ ...request })
        }
      }
      
      setRequests(requestsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="pt-20 z-10 max-w-6xl mx-auto px-4">
            <div className="flex flex-col space-y-2">
              <h1 className={`text-2xl font-semibold ${montserrat.className}`}>Requested Songs</h1>
              <Link 
                href="/songbook" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to songs
              </Link>
            </div>
            <div className="mt-8 text-muted-foreground">Loading...</div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="pt-20 z-10 max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-12 gap-4 mb-8">
            <div className="col-span-12 md:col-span-8">
              <div className="flex flex-col">
                <h1 className={`text-2xl font-semibold ${montserrat.className}`}>Requested Songs</h1>
                <Link 
                  href="/songbook" 
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mt-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to songs
                </Link>
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-end items-start space-x-4">
              <RequestSongDialog />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-12 gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="col-span-12 md:col-span-4 bg-card">
                <CardHeader>
                  <CardTitle>{request.title}</CardTitle>
                  <CardDescription>by {request.artist}</CardDescription>
                </CardHeader>
                <CardContent>
                  {request.notes && (
                    <p className="text-sm text-muted-foreground mb-4">{request.notes}</p>
                  )}
                  <p className="text-sm text-primary">
                    Requested by: {request.user?.telegramUsername || '@Mr.E'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
} 
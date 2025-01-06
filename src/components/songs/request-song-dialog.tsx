'use client'

import { useState } from 'react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ListMusic, PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { SongRequest } from '@/types/music/song'
import Link from 'next/link'

interface RequestSongDialogProps {
  className?: string
}

export function RequestSongDialog({ className }: RequestSongDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useUserProfile()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const songRequest: Omit<SongRequest, 'id' | 'metadata'> = {
        title,
        artist,
        notes,
        requestedBy: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: null,
      }

      await addDoc(collection(db, 'songRequests'), songRequest)
      toast({
        title: "Request Received!",
        description: "Thanks for your song request. We'll add it to the app soon!",
        duration: 5000,
      })
      setOpen(false)
      setTitle('')
      setArtist('')
      setNotes('')
    } catch (error) {
      console.error('Error requesting song:', error)
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-end space-x-3 md:space-x-4">
      <Button variant="outline" size="default" asChild>
        <Link href="/requested-songs" className="flex items-center">
          <ListMusic className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
          <span className="hidden md:inline">Requested</span>
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="default" className="flex items-center">
            <PlusCircle className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden md:inline">Request</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card border border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              Request a Song
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-muted-foreground tracking-normal">
              Submit a request for a song you&apos;d like to see added to the songbook.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="title"
                  placeholder="Song title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-input text-sm md:text-base"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id="artist"
                  placeholder="Artist name"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                  className="bg-input text-sm md:text-base"
                />
              </div>
              <div className="grid gap-2">
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-input text-sm md:text-base"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full text-sm md:text-base font-medium">
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
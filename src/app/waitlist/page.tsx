'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addDoc, collection, serverTimestamp, getFirestore } from 'firebase/firestore'
import app from '@/firebase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { PublicPageLayout } from '@/components/layout/public-page-layout'

const db = getFirestore(app)

export default function WaitlistPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    try {
      await addDoc(collection(db, 'waitlist'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp()
      })
      
      toast.success("You&apos;re on the list! Get ready to rock! 🎸")
      setName('')
      setEmail('')
      setIsSuccess(true)
    } catch (error) {
      console.error('Error adding to waitlist:', error)
      toast.error('Oops! Hit a wrong note. Try again?')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PublicPageLayout>
      <Logo />
      
      <h1 className="text-3xl font-bold text-foreground mb-4">Join Waitlist! 🎸</h1>
      <p className="text-foreground text-lg mb-8">
        First cohort starting <strong>March 2025</strong><br/> Group music lessons, training tools and a community of bandmates.
      </p>
      
      {isSuccess ? (
        <div className="space-y-4">
          <p className="text-foreground text-lg">Thanks for joining! We&apos;ll keep you posted on all the exciting updates.</p>
          <div className="space-y-2">
            <p className="text-[14px] text-muted-foreground">
              Can&apos;t wait? <Link href="/join" className="hover:text-primary hover:underline underline">Sneak Preview</Link>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Stage Name (or real one)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background text-foreground"
            required
            minLength={1}
            maxLength={100}
            autoFocus
          />
          
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background text-foreground"
            required
            pattern="[^@]+@[^@]+\.[^@]+"
          />
          
          <Button 
            type="submit"
            variant="filled"
            size="lg"
            className="w-full text-[21px] leading-[32px] font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Let&apos;s jam!
          </Button>
        </form>
      )}
    </PublicPageLayout>
  )
} 
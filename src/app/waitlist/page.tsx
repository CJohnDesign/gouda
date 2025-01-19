'use client'

import { Montserrat } from 'next/font/google'
import { Corners } from '@/components/ui/borders'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addDoc, collection, serverTimestamp, getFirestore } from 'firebase/firestore'
import app from '@/firebase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const montserrat = Montserrat({ subsets: ['latin'] })
const db = getFirestore(app)

export default function WaitlistPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      
      toast.success("You're on the list! Get ready to rock! 🎸")
      setName('')
      setEmail('')
    } catch (error) {
      console.error('Error adding to waitlist:', error)
      toast.error('Oops! Hit a wrong note. Try again?')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center pt-24 pb-12 ${montserrat.className}`}>
      <Corners />
      <div className="w-full max-w-md mx-auto text-center flex flex-col justify-center flex-1 px-4 z-[1]">
        <div className="mb-8">
          <Image
            src="/images/GOUDA_Logo.webp"
            alt="Gouda"
            width={300}
            height={300}
            className="mx-auto"
            priority
          />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">Join the Band! 🎸</h1>
        <p className="text-foreground text-lg mb-8">
          Get ready for the ultimate jam session! We're launching in March 2025 with weekly group lessons, 
          video tutorials, and a community that rocks. Be the first to know when we're live!
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your stage name (or real name)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background text-foreground"
            required
            minLength={1}
            maxLength={100}
          />
          
          <Input
            type="email"
            placeholder="Your backstage pass (email)"
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
            Get VIP Access
          </Button>
        </form>
      </div>
    </main>
  )
} 
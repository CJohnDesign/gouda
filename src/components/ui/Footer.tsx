'use client'

import { useEffect, useState } from 'react'

export function Footer() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const loveburn = new Date('2025-02-13T08:00:00')
      const now = new Date()
      const difference = loveburn.getTime() - now.getTime()

      if (difference <= 0) {
        return 'Loveburn is here! 🔥'
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      return `${days}d ${hours}h ${minutes}m ${seconds}s until Loveburn 2025 🔥`
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          {timeLeft}
        </p>
      </div>
    </footer>
  )
} 
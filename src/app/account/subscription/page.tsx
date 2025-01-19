'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { WaitlistDialog } from '@/components/subscription/waitlist-dialog'

export default function SubscriptionPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-8">
      <PageHeader title="Subscription" />
      <WaitlistDialog open={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
} 
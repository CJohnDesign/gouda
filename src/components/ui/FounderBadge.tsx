'use client'

import { useUserProfile } from '@/contexts/UserProfileContext'
import { Medal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FounderBadge() {
  const { profile } = useUserProfile()

  if (!profile?.isSubscribed) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div 
            className={cn(
              "inline-flex items-center justify-center",
              "w-6 h-6",
              "text-primary"
            )}
          >
            <Medal className="w-5 h-5" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Founding Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 
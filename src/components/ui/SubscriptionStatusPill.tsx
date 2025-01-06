import { Badge } from '@/components/ui/badge'

interface SubscriptionStatusPillProps {
  status: 'Active' | 'Unpaid'
}

export function SubscriptionStatusPill({ status }: SubscriptionStatusPillProps) {
  return (
    <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  )
} 
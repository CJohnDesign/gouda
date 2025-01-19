import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface WaitlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subscription Service Update</DialogTitle>
          <DialogDescription className="pt-3">
            Our subscription service is temporarily unavailable while we make some improvements. Join our waitlist to be notified when we're back online with an even better experience!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <Button 
            onClick={() => {
              onOpenChange(false)
              router.push('/waitlist')
            }}
            className="w-full"
          >
            Join Waitlist
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
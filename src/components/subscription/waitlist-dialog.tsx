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
          <DialogTitle>Thanks for Your Interest!</DialogTitle>
          <DialogDescription>
            We're working hard to make our subscription service even better. Join our waitlist to be the first to know when we launch!
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
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
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
          <DialogTitle>Hold That Note! 🎵</DialogTitle>
          <DialogDescription className="pt-3">
            We're still tuning up our awesome features! Want to be first in line when we drop the beat? Join our VIP waitlist and don't miss a single note of what's coming next!
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
            Get VIP Access
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
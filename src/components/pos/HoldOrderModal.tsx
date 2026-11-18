import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface HoldOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the table number or customer name the order is saved to. */
  onConfirm: (destination: string) => void
}

/**
 * Small prompt shown when the cashier holds the current order, asking where
 * the order should be parked (table number or customer name).
 */
export function HoldOrderModal({
  open,
  onOpenChange,
  onConfirm,
}: HoldOrderModalProps) {
  const [destination, setDestination] = React.useState('')

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setDestination('')
    onOpenChange(nextOpen)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const label = destination.trim()
    if (!label) return

    onConfirm(label)
    setDestination('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl bg-card">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 pt-6 pb-5">
            <DialogTitle className="text-xl font-semibold leading-snug text-foreground">
              Save to Table / Customer
            </DialogTitle>
            <DialogDescription className="sr-only">
              Enter the table number or customer name that this order is held
              for.
            </DialogDescription>
            <Input
              autoFocus
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Example: Table 12 or Mr. Ahmad"
              className="h-12 rounded-lg border-input text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-1 px-6 pb-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="font-semibold text-primary hover:bg-transparent hover:text-primary/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!destination.trim()}
              className="h-10 rounded-full px-6 text-xs font-bold uppercase tracking-wide"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

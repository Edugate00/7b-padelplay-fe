import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    if (open) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop (tanpa blur & animasi) */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Dialog Content Container */}
      <div className="relative z-50 w-full max-h-[90vh] flex flex-col items-center justify-center pointer-events-none">
        <div className="w-full flex justify-center pointer-events-none">
          {children}
        </div>
      </div>
    </div>
  )
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative z-50 flex flex-col w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl pointer-events-auto',
      className,
    )}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
))
DialogContent.displayName = 'DialogContent'

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 px-6 pt-6 pb-4 border-b border-slate-100 text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

export const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-lg font-bold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-slate-500', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

export const DialogClose = ({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950',
      className,
    )}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Close</span>
  </button>
)

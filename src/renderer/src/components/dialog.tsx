import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@renderer/lib/cn'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('bg-modal-overlay fixed inset-0 z-50', className)}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    onOverlayClick?: () => void
    isSettings?: boolean
    isAlert?: boolean
  }
>(({ className, children, isAlert, isSettings, onOverlayClick, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay
      onClick={onOverlayClick}
      className="bg-modal-overlay fixed inset-0 z-50 flex justify-center"
    />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'border-modal shadow-modal bg-modal fixed left-[50%] top-0 z-50 flex w-full translate-x-[-50%] flex-col overflow-auto outline-none md:rounded-lg md:border dark:backdrop-blur-lg',
        isSettings ? 'max-w-lg sm:max-w-[824px] lg:max-w-screen-lg' : 'max-w-xl p-4',

        isAlert
          ? 'bottom-0 top-auto md:bottom-auto md:top-1/2 md:-translate-y-1/2'
          : 'h-dvh md:top-[2rem] md:h-auto md:max-h-[calc(100dvh-4rem)]',
        className
      )}
      {...props}
    >
      {children}
      {!isAlert && (
        <DialogPrimitive.Close
          className={cn(
            'ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-3 top-2 z-[100] inline-flex h-8 w-8 items-center justify-center rounded-lg opacity-70 ring-red-200 transition-opacity hover:bg-red-500 hover:text-white hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none',
            'md:hidden'
          )}
        >
          <span className="i-tabler-x text-xl" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-5 flex shrink-0 flex-col space-y-1.5', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'shrink-0 border-t px-4 py-2 pb-[calc(env(safe-area-inset-bottom,0)+0.5rem)]',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}

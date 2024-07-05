import { cn } from '@renderer/lib/cn'
import { forwardRef, useState } from 'react'
import { tv } from 'tailwind-variants'

const inputVariants = tv({
  base: 'h-8 rounded-md px-3 flex text-sm items-center outline-none border focus:ring-1 ring-blue-500 focus:border-blue-500',
  variants: {
    isTextarea: {
      true: 'h-auto py-2 px-2 w-full resize-none'
    },
    isPassword: {
      true: 'pr-8'
    }
  }
})

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    classNames?: {
      wrapper?: string
    }
    endContent?: React.ReactNode
    startContent?: React.ReactNode
  }
>(({ className, classNames, startContent, endContent, ...props }, ref) => {
  const [revealPassword, setRevealPassword] = useState(false)

  return (
    <div className={cn('flex items-center relative', classNames?.wrapper)}>
      {startContent}
      <input
        {...props}
        type={props.type === 'password' ? (revealPassword ? 'text' : 'password') : props.type}
        ref={ref}
        className={inputVariants({ className, isPassword: props.type === 'password' })}
      />
      {props.type === 'password' && (
        <button
          onClick={() => {
            setRevealPassword((v) => !v)
          }}
          type="button"
          className="absolute right-2 h-full flex items-center justify-center"
        >
          <span className={cn(revealPassword ? 'i-tabler-eye-off' : 'i-tabler-eye')}></span>
        </button>
      )}
      {endContent}
    </div>
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <div>
    <textarea {...props} ref={ref} className={inputVariants({ className, isTextarea: true })} />
  </div>
))

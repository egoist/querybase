import { tv, VariantProps } from 'tailwind-variants'
import { forwardRef } from 'react'
import { Spinner } from './spinner'

export const buttonVariants = tv({
  base: 'inline-flex shrink-0 items-center justify-center select-none rounded-md border text-center text-sm outline-none ring-blue-500 focus:border-blue-500 focus:ring-1 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: '',
      primary:
        'h-10 border-blue-500 border-b-blue-800 bg-blue-500 px-4 text-white active:bg-blue-600',
      outline:
        'h-10 border-zinc-300 border-b-zinc-400/80 bg-white px-4 dark:border-zinc-600 dark:bg-transparent',
      ghost: 'border border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700/60',
      message_action: 'focus:ring-2'
    },
    variantColor: {
      default: '',
      red: ''
    },
    size: {
      default: 'h-8 px-3',
      sm: 'px-2 h-6'
    },
    isIcon: {
      true: ''
    }
  },
  compoundVariants: [
    {
      variant: 'default',
      variantColor: 'default',
      className:
        'border-zinc-300 border-b-zinc-400/80 bg-white active:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:active:bg-zinc-900'
    },
    {
      variant: 'default',
      variantColor: 'red',
      className:
        'border-red-500 border-b-red-600 text-red-500 focus:ring-red-300 active:bg-red-100 dark:bg-red-900/30 dark:focus:bg-red-900/20 dark:focus:ring-red-600'
    },
    {
      variant: 'primary',
      variantColor: 'red',
      className: 'border-red-500 bg-red-500 focus:bg-red-600 focus:ring-red-300 active:bg-red-600'
    },
    {
      variant: 'message_action',
      variantColor: 'default',
      className:
        'border-0 hover:bg-zinc-200 aria-expanded:bg-zinc-200 dark:hover:bg-zinc-800 dark:aria-expanded:bg-zinc-800'
    },

    {
      size: 'default',
      isIcon: true,
      class: 'px-0 w-8'
    }
  ],
  defaultVariants: {
    variant: 'default',
    variantColor: 'default',
    size: 'default'
  }
})

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean
    left?: React.ReactNode
  }

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      variant,
      disabled,
      isLoading,
      children,
      left,
      size,
      isIcon,
      variantColor,
      ...props
    },
    ref
  ) => {
    const disable = disabled || isLoading
    return (
      <button
        {...props}
        disabled={disable}
        ref={ref}
        className={buttonVariants({
          className: typeof className === 'string' ? className : undefined,
          size,
          isIcon,
          variant,
          variantColor
        })}
      >
        {!isLoading && left}
        {isLoading && <Spinner className="mr-2" />}
        {children}
      </button>
    )
  }
)

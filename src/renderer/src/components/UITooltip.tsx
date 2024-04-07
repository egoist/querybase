import { memo } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from './Tooltip'
import { PopperContentProps } from '@radix-ui/react-tooltip'

export const UITooltip = memo(
  ({
    children,
    content,
    side,
    align
  }: {
    children: React.ReactNode
    content: React.ReactNode
    side?: PopperContentProps['side']
    align?: PopperContentProps['align']
  }) => {
    if (!content) return <>{children}</>

    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} collisionPadding={5} className="max-w-md">
          {content}
        </TooltipContent>
      </Tooltip>
    )
  }
)

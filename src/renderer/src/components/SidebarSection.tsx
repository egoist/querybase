import { cn } from '@renderer/lib/cn'

export const SidebarSection = ({
  title,
  titleEndContent,
  children,
  scroll,
  className
}: {
  title?: string
  titleEndContent?: React.ReactNode
  children: React.ReactNode
  scroll?: boolean
  className?: string
}) => {
  return (
    <>
      {title && (
        <div className="text-slate-500 mb-0.5 text-xs pl-5 pr-3 shrink-0 flex items-center justify-between">
          <span className="font-medium">{title}</span>

          {titleEndContent}
        </div>
      )}
      <div className={cn('px-3 text-sm', scroll ? 'overflow-y-auto grow' : 'shrink-0', className)}>
        {children}
      </div>
    </>
  )
}

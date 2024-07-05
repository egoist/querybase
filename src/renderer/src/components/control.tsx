export const Control = ({
  label,
  desc,
  children,
  className
}: {
  label: React.ReactNode
  desc?: React.ReactNode
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={className}>
      <div className="flex mb-1 text-sm">
        <span className="font-medium">{label}</span>
      </div>
      <div>{children}</div>
      {desc && <div className="mt-1 text-xs text-zinc-500">{desc}</div>}
    </div>
  )
}

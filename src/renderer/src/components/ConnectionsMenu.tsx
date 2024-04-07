import { Link, useNavigate } from 'react-router-dom'
import { DropdownMenuContent, DropdownMenuItem } from './Dropdown'
import { Connection, ConnectionType } from '@shared/types'
import { cn } from '@renderer/lib/cn'

export const ConnectionIcon = ({
  type,
  className
}: {
  type: ConnectionType
  className?: string
}) => {
  return (
    <span
      className={cn(
        'shrink-0',
        type === 'postgresql'
          ? 'i-devicon-postgresql'
          : type === 'mysql'
            ? 'i-logos-mysql-icon'
            : 'i-devicon-sqlite',
        className
      )}
    ></span>
  )
}

export const ConnectionsMenu = ({
  connections,
  connectionId
}: {
  connections: Connection[]
  connectionId?: string
}) => {
  const navigate = useNavigate()

  return (
    <DropdownMenuContent
      matchTriggerWidth
      align="start"
      suffix={
        <div className="p-1 border-t">
          <Link
            to={`/?id=${connectionId}`}
            className="select-none gap-1 relative py-1.5 text-sm font-medium flex items-center px-2 w-full rounded-md hover:bg-slate-100"
          >
            <span className="i-tabler-database-cog"></span>
            <span>Manage Connection</span>
          </Link>
        </div>
      }
    >
      {connections.map((connection) => {
        const isSelected = connection.id === connectionId
        return (
          <DropdownMenuItem
            key={connection.id}
            className="flex items-center justify-between"
            onClick={() => {
              navigate(`/connections/${connection.id}/schema`)
            }}
          >
            <div className="flex items-center gap-1">
              <ConnectionIcon type={connection.type} />
              <span>{connection.nickname}</span>
            </div>

            {isSelected && <span className="i-tabler-check shrink-0 text-lg text-green-500"></span>}
          </DropdownMenuItem>
        )
      })}
    </DropdownMenuContent>
  )
}

import { SidebarFooter } from '@renderer/components/sidebar'
import { ConnectionIcon, ConnectionsMenu } from '@renderer/components/connections-menu'
import { DropdownMenu, DropdownMenuTrigger } from '@renderer/components/dropdown'
import { SidebarSection } from '@renderer/components/sidebar-section'
import { actionsProxy } from '@renderer/lib/actions-proxy'
import { useConnections, useSavedQueries } from '@renderer/lib/store'
import { genId } from '@renderer/lib/utils'
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { cn } from '@renderer/lib/cn'

export const Component = () => {
  const location = useLocation()
  const params = useParams<{ id: string; queryId: string }>()
  const connectionId = params.id!

  const connectionsQuery = useConnections()
  const navigate = useNavigate()

  const connection = connectionsQuery.data?.find((c) => c.id === connectionId)

  const navItems = [
    {
      label: 'Schema',
      href: `/connections/${connectionId}/schema`
    }
  ]

  const queries = useSavedQueries(connectionId)

  const createQuery = actionsProxy.createQuery.useMutation({
    onSuccess(_, variables) {
      navigate(`/connections/${connectionId}/queries/${variables.id}`)
      queries.refetch()
    }
  })

  if (!connection) return null

  return (
    <div className="h-dvh flex">
      <div className="w-64 relative bg-slate-50 shrink-0 border-r text-sm flex flex-col">
        <div aria-hidden className="drag-region h-12 shrink-0"></div>

        <div className="px-3 pb-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full outline-none text-left h-8 rounded-md border bg-white px-3 flex items-center justify-between aria-expanded:ring-1 aria-expanded:border-blue-500 ring-blue-500"
              >
                <div className="flex items-center gap-1">
                  <ConnectionIcon type={connection.type} />
                  <span>{connection.nickname}</span>
                </div>
                <span className="i-lucide-chevrons-up-down"></span>
              </button>
            </DropdownMenuTrigger>
            <ConnectionsMenu
              connections={connectionsQuery.data || []}
              connectionId={connectionId}
            />
          </DropdownMenu>
        </div>

        <SidebarSection className="mb-3">
          <div className="">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={cn(
                    'px-2 h-8 flex items-center rounded-md',
                    isActive ? 'bg-slate-200' : 'hover:bg-slate-100'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </SidebarSection>

        <SidebarSection
          title="Queries"
          scroll
          titleEndContent={
            <button
              type="button"
              className="w-5 h-5 p-0 hover:bg-slate-200 rounded-md inline-flex items-center justify-center"
              onClick={() =>
                createQuery.mutate({
                  id: genId(),
                  createdAt: new Date(),
                  title: 'New Query',
                  connectionId: connectionId,
                  query: ''
                })
              }
            >
              <span className="i-tabler-plus"></span>
            </button>
          }
        >
          <div className="space-y-[1px]">
            {queries.data?.map((query) => {
              const isActive = params.queryId === query.id
              return (
                <Link
                  key={query.id}
                  className={cn(
                    'flex px-2 h-8 rounded-md items-center text-sm',
                    isActive ? 'bg-slate-200' : 'hover:bg-slate-100'
                  )}
                  to={`/connections/${connectionId}/queries/${query.id}`}
                >
                  <span className="truncate">{query.title}</span>
                </Link>
              )
            })}
          </div>
        </SidebarSection>

        <SidebarFooter connectionId={connectionId} />
      </div>
      <div className="grow overflow-auto flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}

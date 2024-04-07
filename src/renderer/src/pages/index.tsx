import { Button } from '@renderer/components/Button'
import { ConnectionIcon } from '@renderer/components/ConnectionsMenu'
import { Control } from '@renderer/components/Control'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/Dropdown'
import { Input } from '@renderer/components/Input'
import { SidebarFooter } from '@renderer/components/Sidebar'
import { SidebarSection } from '@renderer/components/SidebarSection'
import { DesktopUpdaterButton } from '@renderer/components/UpdaterButton'
import { actionsProxy } from '@renderer/lib/actions-proxy'
import { cn } from '@renderer/lib/cn'
import {
  connectionTypes,
  formatConnectionType,
  getConnectionDefaultValues
} from '@renderer/lib/database'
import { showNativeMenu } from '@renderer/lib/native-menu'
import { useConnections } from '@renderer/lib/store'
import { genId } from '@renderer/lib/utils'
import { Connection, ConnectionType } from '@shared/types'
import { useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Url from 'url-parse'

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  const connectionsQuery = useConnections()
  const connectionId = searchParams.get('id')

  const connection = connectionsQuery.data?.find((c) => c.id === connectionId)
  const connectionsCount = connectionsQuery.data?.length || 0

  const navigate = useNavigate()

  const createConnection = actionsProxy.createConnection.useMutation({
    onSuccess(_, variables) {
      connectionsQuery.refetch()
      setSearchParams({ id: variables.id })
    }
  })

  const deleteConnection = actionsProxy.deleteConnection.useMutation({
    onSuccess() {
      connectionsQuery.refetch()
    }
  })

  return (
    <div className="h-dvh flex">
      <div className="relative w-64 bg-slate-50 border-r flex flex-col">
        <div className="h-10 drag-region shrink-0" aria-hidden></div>

        <div className="p-3 overflow-auto shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full">
                <span className="i-tabler-plus mr-1"></span>
                <span>New Connection</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent matchTriggerWidth>
              {connectionTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  className="gap-1"
                  onClick={() => {
                    createConnection.mutate({
                      id: genId(),
                      type,
                      createdAt: new Date(),
                      nickname: `Untitled Connection ${connectionsCount + 1}`,
                      ...getConnectionDefaultValues()
                    })
                  }}
                >
                  <ConnectionIcon type={type} />
                  <span>{formatConnectionType(type)}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {connectionsCount > 0 ? (
          <SidebarSection title="Connections" scroll className="pb-3">
            {connectionsQuery.data?.map((connection) => {
              const isActive = connection.id === connectionId
              return (
                <Link
                  key={connection.id}
                  to={`/?id=${connection.id}`}
                  className={cn(
                    'context-menu-trigger flex px-2 rounded-lg h-8 gap-1 items-center',
                    isActive ? 'bg-slate-200' : 'hover:bg-slate-100'
                  )}
                  onClick={(e) => {
                    if (e.detail === 2) {
                      e.preventDefault()

                      navigate(`/connections/${connection.id}/schema`)
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    e.stopPropagation()

                    showNativeMenu(
                      [
                        {
                          type: 'text' as const,
                          label: 'Delete',
                          click: async () => {
                            if (
                              await actionsProxy.showConfirmDialog.invoke({
                                title: 'Delete Connection',
                                message: `Are you sure you want to delete this connection?`
                              })
                            ) {
                              deleteConnection.mutate({ id: connection.id })
                            }
                          }
                        }
                      ],
                      e
                    )
                  }}
                >
                  <ConnectionIcon type={connection.type} />
                  <span className="truncate">{connection.nickname || 'Untitled'}</span>
                </Link>
              )
            })}
          </SidebarSection>
        ) : (
          <div className="grow"></div>
        )}

        <SidebarFooter />
      </div>

      {connection ? (
        <div className="grow flex flex-col">
          <DatabaseSettings key={connection.id} type={connection.type} connection={connection} />
        </div>
      ) : (
        <div className="grow flex items-center justify-center">
          <span className="max-w-md p-5 w-full text-slate-400 text-center text-xl">
            QueryBase is in beta, do not use it with critically important databases.
          </span>
        </div>
      )}
    </div>
  )
}

const DatabaseSettings = ({
  connection,
  type
}: {
  connection: Connection
  type: ConnectionType
}) => {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const hostInputRef = useRef<HTMLInputElement>(null)
  const portInputRef = useRef<HTMLInputElement>(null)
  const userInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const databaseInputRef = useRef<HTMLInputElement>(null)
  const nicknameInputRef = useRef<HTMLInputElement>(null)

  const updateConnection = actionsProxy.updateConnection.useMutation({
    onMutate(variables) {
      actionsProxy.getConnections.setQueryData(undefined, (prev) => {
        if (!prev) return prev

        return prev.map((c) => {
          if (c.id === variables.id) {
            return {
              ...c,
              ...variables
            }
          }
          return c
        })
      })
    }
  })

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const form = formRef.current
    if (connection.type === 'sqlite' || !form) return

    const text = e.clipboardData.getData('text/plain')
    try {
      const url = new Url(text)

      const { hostname, port, username, password, pathname, protocol, query } = url

      if (connection.type === 'mysql' && protocol !== 'mysql:') {
        return
      }

      if (connection.type === 'postgresql' && !['postgresql:', 'postgres:'].includes(protocol)) {
        return
      }

      e.preventDefault()

      const database = pathname.replace(/^\//, '')

      if (hostInputRef.current) {
        hostInputRef.current.value = hostname
        updateConnection.mutate({
          id: connection.id,
          host: hostname
        })
      }
      if (portInputRef.current) {
        portInputRef.current.value = port
        updateConnection.mutate({
          id: connection.id,
          port: port
        })
      }
      if (userInputRef.current) {
        userInputRef.current.value = username
        updateConnection.mutate({
          id: connection.id,
          user: username
        })
      }
      if (passwordInputRef.current) {
        passwordInputRef.current.value = password
        updateConnection.mutate({
          id: connection.id,
          password: password
        })
      }
      if (databaseInputRef.current) {
        databaseInputRef.current.value = database
        updateConnection.mutate({
          id: connection.id,
          database: database
        })
      }
    } catch {}
  }

  return (
    <>
      <header
        className={cn(
          'flex items-center shrink-0 justify-center',
          connection
            ? 'h-12 flex items-center px-5 border-b drag-region'
            : 'py-3 flex items-center px-5 border-b drag-region'
        )}
      >
        <h2 className="font-bold flex items-center gap-1">
          <ConnectionIcon type={type} />
          <span>{connection.nickname}</span>
        </h2>
      </header>
      <div className="grow overflow-auto">
        <div className="max-w-md mx-auto p-5">
          <form
            ref={formRef}
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/connections/${connection.id}/schema`)
            }}
          >
            <Control label="Nickname">
              <Input
                name="nickname"
                ref={nicknameInputRef}
                placeholder="Enter a memorable name"
                className="w-full"
                autoFocus
                required
                defaultValue={connection.nickname}
                onPaste={handlePaste}
                onChange={(e) => {
                  updateConnection.mutate({
                    id: connection.id,
                    nickname: e.target.value
                  })
                }}
              />
            </Control>

            {type === 'sqlite' ? (
              <Control label="Database">
                <div className="flex items-center gap-1">
                  <Input
                    name="database"
                    ref={databaseInputRef}
                    placeholder="/path/to/database.db"
                    className="grow"
                    classNames={{ wrapper: 'w-full gap-1' }}
                    required
                    defaultValue={connection.database}
                    onChange={(e) => {
                      updateConnection.mutate({
                        id: connection.id,
                        database: e.target.value
                      })
                    }}
                    endContent={
                      <Button
                        type="button"
                        onClick={async () => {
                          const [filepath] = await actionsProxy.showOpenDialog.invoke({
                            options: {
                              properties: ['openFile']
                            }
                          })

                          if (filepath) {
                            updateConnection.mutate({
                              id: connection.id,
                              database: filepath
                            })
                          }
                        }}
                      >
                        Select
                      </Button>
                    }
                  />
                </div>
              </Control>
            ) : (
              <>
                <div className="flex gap-2 w-full">
                  <Control label="Host" className="w-full">
                    <Input
                      name="host"
                      ref={hostInputRef}
                      placeholder="Enter host"
                      className="w-full"
                      defaultValue={connection.host ?? ''}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        updateConnection.mutate({
                          id: connection.id,
                          host: e.target.value
                        })
                      }}
                    />
                  </Control>

                  <Control label="Port" className="w-full">
                    <Input
                      name="port"
                      ref={portInputRef}
                      placeholder="Enter port"
                      className="w-full"
                      defaultValue={connection.port ?? ''}
                      onPaste={handlePaste}
                      onChange={(e) => {
                        updateConnection.mutate({
                          id: connection.id,
                          port: e.target.value
                        })
                      }}
                    />
                  </Control>
                </div>
                <Control label="User" className="w-full">
                  <Input
                    name="user"
                    ref={userInputRef}
                    placeholder="Enter username"
                    className="w-full"
                    defaultValue={connection.user ?? ''}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      updateConnection.mutate({
                        id: connection.id,
                        user: e.target.value
                      })
                    }}
                  />
                </Control>

                <Control label="Password" className="w-full">
                  <Input
                    name="password"
                    ref={passwordInputRef}
                    placeholder="Enter password"
                    className="w-full"
                    type="password"
                    defaultValue={connection.password ?? ''}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      updateConnection.mutate({
                        id: connection.id,
                        password: e.target.value
                      })
                    }}
                  />
                </Control>

                <Control label="Database" className="w-full">
                  <Input
                    name="database"
                    ref={databaseInputRef}
                    placeholder="Enter database name"
                    className="w-full"
                    defaultValue={connection.database}
                    onPaste={handlePaste}
                    onChange={(e) => {
                      updateConnection.mutate({
                        id: connection.id,
                        database: e.target.value
                      })
                    }}
                  />
                </Control>
              </>
            )}
            <div>
              <Button type="submit" variant="primary">
                Connect
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

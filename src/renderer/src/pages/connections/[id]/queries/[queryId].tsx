import { useCodeMirror } from '@uiw/react-codemirror'
import { sql as sqlExtension } from '@codemirror/lang-sql'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { actionsProxy } from '@renderer/lib/actions-proxy'
import { databaseSchemaToSQL } from '@renderer/lib/database'
import AutosizeInput from 'react-input-autosize'
import { useConnections, useSavedQueries, useSchema } from '@renderer/lib/store'
import { Button } from '@renderer/components/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/popover'
import { Control } from '@renderer/components/control'
import { Textarea } from '@renderer/components/input'
import { ConnectionType, QueryDatabaseResult } from '@shared/types'
import Markdown from 'react-markdown'
import { UITooltip } from '@renderer/components/ui-tooltip'
import { highlightNearestStatementExtension } from '@renderer/lib/codemirror'
import { formatError } from '@renderer/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { generateFixForError, generateSQL } from '@renderer/lib/openai'
import { useConfig } from '@renderer/lib/config'
import { cn } from '@renderer/lib/cn'
import { DataTable } from '@renderer/components/data-table'
import { ColumnDef } from '@tanstack/react-table'

const editorTheme = EditorView.theme({
  '&': {
    height: '100%'
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    fontSize: '15px'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '.cm-gutters,.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#ccc'
  },
  '.cm-gutters': {
    borderRight: '0px'
  },
  '.cm-activeLineGutter': {
    color: '#000'
  }
})

export function Component() {
  const params = useParams<{ id: string; queryId: string }>()
  const connectionId = params.id!
  const queryId = params.queryId!

  const configQuery = useConfig()
  const config = configQuery.data || {}
  const connectionsQuery = useConnections()
  const queries = useSavedQueries(connectionId)
  const query = queries.data?.find((q) => q.id === queryId)
  const [isMagicPopoverOpen, setIsMagicPopoverOpen] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [nearestQuery, setNearestQuery] = useState('')

  const connection = connectionsQuery.data?.find((c) => c.id === connectionId)

  const schemaQuery = useSchema(connectionId)

  const schema = schemaQuery.data

  const updateQuery = actionsProxy.updateQuery.useMutation({
    onMutate(variables) {
      actionsProxy.getQueries.setQueryData({ connectionId }, (prev) => {
        if (!prev) return prev
        return prev.map((item) => {
          if (item.id === queryId) {
            return {
              ...item,
              ...variables
            }
          }
          return item
        })
      })
    }
  })

  const editorElRef = useRef<HTMLDivElement>(null)
  const { setContainer, view: editorView } = useCodeMirror({
    value: query?.query ?? '',
    onChange(value) {
      updateQuery.mutate({ id: queryId, query: value })
    },
    basicSetup: {
      highlightActiveLine: false
    },
    onUpdate(viewUpdate) {
      // get selected text
      setSelectedText(
        viewUpdate.state.doc.sliceString(
          viewUpdate.state.selection.main.from,
          viewUpdate.state.selection.main.to
        )
      )
    },
    placeholder: 'Enter SQL here...',
    height: '100%',
    extensions: [
      EditorView.lineWrapping,
      editorTheme,
      highlightNearestStatementExtension({
        setNearestQuery
      }),
      sqlExtension({
        schema: schema?.tables.reduce((res, table) => {
          return {
            ...res,
            [table.name]: table.columns.map((col) => col.name)
          }
        }, {})
      })
    ]
  })

  const generateSQLMutation = useMutation({
    mutationFn: generateSQL,
    onError(error) {
      alert(error.message)
    },
    onSuccess(data) {
      if (data) {
        updateQuery.mutate({ id: queryId, query: data.content })

        if (editorView) {
          // insert the generated sql into the editor
          const { state } = editorView
          const { from } = state.selection.main

          // if active line is empty, insert the generated sql
          // otherwise, insert the generated sql in a new line
          const line = state.doc.lineAt(from)
          const isEmpty = line.text.trim() === ''
          let pos = line.from
          let content = data.content
          let selectionAnchor = pos
          let head = pos + content.length

          if (!isEmpty) {
            pos = line.to
            content = `\n${data.content}`
            selectionAnchor = pos + 1
            head = pos + content.length
          }

          setIsMagicPopoverOpen(false)

          editorView.dispatch({
            changes: {
              from: pos,
              to: pos,
              insert: content
            },
            selection: {
              anchor: selectionAnchor,
              head
            }
          })
        }
      }
    }
  })

  const [queryResponses, setQueryResponses] = useState<
    Record<string, QueryDatabaseResult[] | null>
  >({})

  const queryResponse = queryResponses[queryId]

  const clearQueryResponse = () => {
    setQueryResponses((prev) => {
      return {
        ...prev,
        [queryId]: null
      }
    })
  }

  const queryDatabase = actionsProxy.queryDatabase.useMutation({
    onSuccess(data) {
      setQueryResponses((prev) => ({
        ...prev,
        [queryId]: data
      }))
    }
  })

  useEffect(() => {
    if (editorElRef.current) {
      setContainer(editorElRef.current)
    }
  }, [])

  useEffect(() => {
    if (queryId && editorView) {
      if (import.meta.env.DEV) {
        // @ts-expect-error
        window.editorView = editorView
      }
      editorView.focus()
    }
  }, [queryId, editorView])

  const queryToRun = selectedText || nearestQuery

  if (!connection) return null

  return (
    <>
      <header className="shrink-0 h-12 flex items-center justify-between gap-2 px-3 drag-region border-b">
        <AutosizeInput
          inputClassName="outline-none max-w-[400px]"
          placeholder="Title..."
          placeholderIsMinWidth
          value={query?.title ?? ''}
          onChange={async (e) => {
            updateQuery.mutate({ id: queryId, title: e.target.value })
          }}
        />

        <div className="flex items-center gap-2">
          <Popover open={isMagicPopoverOpen} onOpenChange={setIsMagicPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="submit" variant="ghost" isIcon className="aria-expanded:bg-zinc-200">
                <span className="i-material-symbols-magic-button text-xl text-orange-500"></span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              collisionPadding={10}
              onCloseAutoFocus={(e) => {
                e.preventDefault()
                editorView?.focus()
              }}
            >
              <form
                className="grid gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!schema) return
                  const data = new FormData(e.currentTarget)

                  const input = data.get('input') as string
                  generateSQLMutation.mutate(
                    {
                      input,
                      connecttionType: connection.type,
                      schema: databaseSchemaToSQL(connection.type, schema),
                      config
                    },
                    {}
                  )
                }}
              >
                <Control label="Question">
                  <Textarea
                    autoFocus
                    required
                    name="input"
                    placeholder="What are out top 3 users by posts count?"
                    rows={5}
                  />
                </Control>

                {generateSQLMutation.error && (
                  <div className="text-red-500 text-sm break-all select-text">
                    {generateSQLMutation.error.message}
                  </div>
                )}

                <div>
                  <Button type="submit" isLoading={generateSQLMutation.isPending}>
                    Generate
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
          <Button
            type="submit"
            disabled={!queryToRun || !schema}
            isLoading={queryDatabase.isPending}
            onClick={() => {
              queryDatabase.mutate({
                connectionId: connection.id,
                query: queryToRun
              })
            }}
          >
            Run {selectedText ? 'selection' : nearestQuery ? 'statement' : ''}
          </Button>
        </div>
      </header>
      <div
        className={cn(
          'overflow-auto',
          queryResponse && queryResponse.length > 0 ? 'shrink-0 h-editor-wrapper' : 'grow'
        )}
      >
        <div className="h-full" ref={editorElRef}></div>
      </div>

      {queryResponse && queryResponse.length > 0 && (
        <RenderQueryResponse
          results={queryResponse}
          type={connection.type}
          clearQueryResponse={clearQueryResponse}
        />
      )}
    </>
  )
}

const RenderQueryResponse = ({
  type,
  results,
  clearQueryResponse
}: {
  type: ConnectionType
  results: QueryDatabaseResult[]
  clearQueryResponse: () => void
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const configQuery = useConfig()

  const result = results[activeIndex]

  const generateFixForErrorMutation = useMutation({
    mutationFn: generateFixForError,
    onError(error) {
      alert(error.message)
    }
  })

  if (!result) return null

  return (
    <div className="grow flex flex-col border-t">
      <header className="flex shrink-0 items-center justify-between pr-2 text-zinc-500 border-b">
        <div className="flex">
          {results.map((result, index) => {
            const isActive = index === activeIndex
            return (
              <UITooltip content={result.statement.text} key={index}>
                <button
                  onClick={() => {
                    setActiveIndex(index)
                  }}
                  type="button"
                  className={cn(
                    'h-8 border-r flex items-center px-3 text-sm font-medium',
                    isActive && 'text-black bg-zinc-50'
                  )}
                >
                  {result.statement.type}
                </button>
              </UITooltip>
            )
          })}
        </div>

        <button
          type="button"
          className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded-md"
          onClick={clearQueryResponse}
        >
          <span className="i-tabler-x"></span>
        </button>
      </header>
      {result.error ? (
        <div className="grow h-0 py-5 text-center overflow-auto select-text">
          <div className="flex flex-col gap-1">
            <span className="text-red-500">{formatError(result.error)}</span>
            <div>
              <Button
                type="button"
                size="sm"
                isLoading={generateFixForErrorMutation.isPending}
                onClick={() => {
                  if (!configQuery.data) return
                  generateFixForErrorMutation.mutate({
                    config: configQuery.data,
                    type,
                    error: result.error!,
                    query: result.statement.text
                  })
                }}
              >
                {generateFixForErrorMutation.data ? 'Retry' : 'Fix this'}
              </Button>
            </div>
            {generateFixForErrorMutation.data && (
              <div className="w-full max-w-md mx-auto text-left bg-slate-50 border rounded-md p-3 text-sm">
                <Markdown className="prose">{generateFixForErrorMutation.data.content}</Markdown>
              </div>
            )}
          </div>
        </div>
      ) : result.aborted ? (
        <div className="grow h-0 flex items-center justify-center text-red-500">Aborted</div>
      ) : result.rows && result.rows.length > 0 ? (
        <div className="overflow-auto grow h-0 flex flex-col select-text">
          <RenderRows rows={result.rows} />
        </div>
      ) : typeof result.rowsAffected === 'number' ? (
        <div className="overflow-auto grow h-0 flex items-center justify-center">
          <div>
            {result.rowsAffected} rows{' '}
            {result.statement.executionType === 'LISTING' ? 'returned' : 'affected'}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const RenderRows = ({ rows }: { rows: Record<string, unknown>[] }) => {
  const columns: ColumnDef<Record<string, unknown>>[] = Object.keys(rows[0]).map((name) => {
    return {
      accessorKey: name,
      header: name,
      cell: ({ row }) => {
        const value = row.getValue(name)
        const valueStr =
          typeof value === 'string'
            ? value
            : value instanceof Date
              ? value.toISOString()
              : JSON.stringify(value)
        let copyTimeout: number | undefined

        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="h-full w-full text-xs text-left p-2 select-none max-w-[120px] truncate aria-expanded:bg-slate-100"
              >
                <span className="">{valueStr}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="text-sm select-text">
              <div className="text-base">
                <button
                  type="button"
                  className="group"
                  onClick={(e) => {
                    if (typeof copyTimeout === 'number') {
                      window.clearTimeout(copyTimeout)
                    }

                    const el = e.currentTarget
                    el.setAttribute('aria-pressed', 'true')
                    navigator.clipboard.writeText(valueStr)
                    copyTimeout = window.setTimeout(() => {
                      el.removeAttribute('aria-pressed')
                    }, 1000)
                  }}
                >
                  <span
                    className={cn(
                      'i-tabler-clipboard',
                      'group-aria-pressed:i-tabler-clipboard-check group-aria-pressed:text-green-500'
                    )}
                  ></span>
                </button>
              </div>
              <pre className="bg-zinc-100 p-3 rounded-md whitespace-pre-wrap break-all overflow-auto max-h-[200px]">
                {valueStr}
              </pre>
            </PopoverContent>
          </Popover>
        )
      }
    }
  })

  return <DataTable columns={columns} data={rows} />
}

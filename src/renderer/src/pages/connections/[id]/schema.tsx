import { DatabaseFlow } from '@renderer/components/DatabaseFlow'
import { useSchema } from '@renderer/lib/store'
import { formatError } from '@renderer/lib/utils'
import { useParams } from 'react-router-dom'

export function Component() {
  const params = useParams<{ id: string }>()
  const connectionId = params.id!
  const schemaQuery = useSchema(connectionId)

  return (
    <>
      <header className="h-12 flex items-center px-5 border-b drag-region shrink-0">
        <h2 className="">Schema</h2>
      </header>
      {schemaQuery.data ? (
        <DatabaseFlow schema={schemaQuery.data} />
      ) : schemaQuery.error ? (
        <div className="grow flex items-center justify-center text-center">
          <div className="max-w-md w-full mx-auto">
            <span className="text-red-500 select-text">{formatError(schemaQuery.error)}</span>
          </div>
        </div>
      ) : null}
    </>
  )
}

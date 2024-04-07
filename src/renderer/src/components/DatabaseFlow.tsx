import { DatabaseSchema } from '@shared/types'
import { UITooltip } from './UITooltip'

export const DatabaseFlow = ({ schema }: { schema: DatabaseSchema }) => {
  return (
    <div className="grow overflow-auto p-5">
      {schema.tables.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {schema.tables.map((table) => {
            return (
              <div key={table.name} className="rounded-md border overflow-hidden select-text">
                <div className="h-8 font-medium bg-slate-100 flex items-center px-3 border-b">
                  {table.name}
                </div>
                <div className="p-3 overflow-auto">
                  {table.columns.map((column) => {
                    return (
                      <div key={column.name} className="flex gap-3 items-center">
                        <span className="font-medium">{column.name}</span>
                        <span className="text-slate-500 whitespace-nowrap">{column.type}</span>
                        {!column.nullable && (
                          <UITooltip content="NOT NULL">
                            <span className="i-tabler-square-rounded-letter-n-filled text-blue-500 shrink-0 w-4 h-4"></span>
                          </UITooltip>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-center flex-col gap-1 justify-center">
            <span className="i-tabler-database text-2xl"></span>
            <span className="text-sm">No tables found</span>
          </div>
        </div>
      )}
    </div>
  )
}

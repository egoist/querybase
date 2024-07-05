import { cn } from '@renderer/lib/cn'
import { useSchema } from '@renderer/lib/store'
import { UITooltip } from './ui-tooltip'
import { formatError } from '@renderer/lib/utils'
import { models } from '@shared/constants'
import { DesktopUpdaterButton } from './updater-button'
import { tv } from 'tailwind-variants'
import { useConfig } from '@renderer/lib/config'
import { SettingsDialog } from './settings-dialog'

export const footerButtonVariants = tv({
  base: 'inline-flex items-center justify-center px-1 h-6 rounded-md hover:bg-slate-200'
})

export const SidebarFooter = ({ connectionId }: { connectionId?: string }) => {
  const schemaQuery = useSchema(connectionId)

  const configQuery = useConfig()

  const modelId = configQuery.data?.model ?? 'gpt-3.5-turbo'
  const model = models.find((m) => m.value === modelId)

  return (
    <footer className="h-12 flex shrink-0 items-center justify-between px-3 text-sm">
      <div className="flex items-center gap-0.5">
        {connectionId ? (
          <UITooltip content={schemaQuery.error && formatError(schemaQuery.error)}>
            <button
              type="button"
              className={cn(
                'flex items-center gap-1.5 -ml-1.5 h-6 pl-1.5 pr-2 rounded-full',
                schemaQuery.error && 'hover:bg-slate-200'
              )}
              onClick={() => {
                schemaQuery.refetch()
              }}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full inline-flex',
                  schemaQuery.error
                    ? 'bg-red-500'
                    : schemaQuery.data
                      ? 'bg-green-500'
                      : 'bg-slate-200'
                )}
              ></span>
              <span className="text-xs text-slate-500">
                {schemaQuery.error ? 'Error' : schemaQuery.data ? 'Connected' : 'Connecting...'}
              </span>
            </button>
          </UITooltip>
        ) : (
          <span className="text-slate-500 font-medium text-xs">v{APP_VERSION}</span>
        )}

        <DesktopUpdaterButton />
      </div>

      <div className="flex items-center gap-1">
        <SettingsDialog>
          <button type="button" className={footerButtonVariants()}>
            <span className="i-mingcute-settings-1-line"></span>
          </button>
        </SettingsDialog>
      </div>
    </footer>
  )
}

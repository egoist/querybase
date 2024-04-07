import { cn } from '@renderer/lib/cn'
import { useSchema } from '@renderer/lib/store'
import { UITooltip } from './UITooltip'
import { formatError } from '@renderer/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'
import { saveConfig, useConfig } from '@renderer/lib/config'
import { Control } from './Control'
import { Input } from './Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './Dropdown'
import { models } from '@shared/constants'
import { DesktopUpdaterButton } from './UpdaterButton'
import { tv } from 'tailwind-variants'

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

const SettingsDialog = ({ children }: { children: React.ReactNode }) => {
  const configQuery = useConfig()

  const modelId = configQuery.data?.model ?? 'gpt-3.5-turbo'
  const model = models.find((m) => m.value === modelId)

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Control label="Model">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-between border gap-2 h-8 rounded-md px-2 text-sm aria-expanded:ring-1 ring-blue-500 aria-expanded:border-blue-500"
                >
                  <span>{model?.label}</span>
                  <span className="i-lucide-chevrons-up-down"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent matchTriggerWidth="min" align="start">
                {models.map((model) => {
                  const isSelected = model.value === modelId
                  return (
                    <DropdownMenuItem
                      key={model.value}
                      className="flex items-center gap-2"
                      onClick={() => {
                        saveConfig({ model: model.value })
                      }}
                    >
                      <span>{model.label}</span>

                      {isSelected && (
                        <span className="i-tabler-check shrink-0 text-green-500 text-lg"></span>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </Control>

          {modelId.startsWith('gpt-') ? (
            <>
              <Control label="OpenAI API Key">
                <Input
                  className="w-full"
                  type="password"
                  value={configQuery.data?.openaiApiKey ?? ''}
                  onChange={(e) => {
                    saveConfig({ openaiApiKey: e.currentTarget.value })
                  }}
                />
              </Control>
              <Control label="OpenAI API Endpoint">
                <Input
                  className="w-full"
                  value={configQuery.data?.openaiApiEndpoint ?? ''}
                  onChange={(e) => {
                    saveConfig({ openaiApiEndpoint: e.currentTarget.value })
                  }}
                  placeholder="https://api.openai.com/v1"
                />
              </Control>
            </>
          ) : (
            <>
              <Control label="Anthropic API Key">
                <Input
                  className="w-full"
                  type="password"
                  value={configQuery.data?.anthropicApiKey ?? ''}
                  onChange={(e) => {
                    saveConfig({ anthropicApiKey: e.currentTarget.value })
                  }}
                />
              </Control>
              <Control label="Anthropic API Endpoint">
                <Input
                  className="w-full"
                  value={configQuery.data?.anthropicApiEndpoint ?? ''}
                  onChange={(e) => {
                    saveConfig({ anthropicApiEndpoint: e.currentTarget.value })
                  }}
                  placeholder="https://api.anthropic.com/v1"
                />
              </Control>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

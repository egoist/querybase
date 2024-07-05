import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { saveConfig, useConfig } from '@renderer/lib/config'
import { Control } from './control'
import { Input } from './input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './dropdown'
import { models } from '@shared/constants'

export const SettingsDialog = ({ children }: { children: React.ReactNode }) => {
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

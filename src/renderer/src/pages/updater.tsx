import { ProgressInfo } from 'electron-updater'
import { useEffect, useState } from 'react'
import prettyBytes from 'pretty-bytes'
import { Button } from '@renderer/components/button'
import { actionsProxy } from '@renderer/lib/actions-proxy'

export function Component() {
  const updateInfoQuery = actionsProxy.getUpdateInfo.useQuery()

  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null)
  const [status, setStatus] = useState<null | 'downloading' | 'downloaded'>(null)

  const updateInfo = updateInfoQuery.data

  useEffect(() => {
    const unlisten = window.electron.ipcRenderer.on(
      'download-progress',
      (_, info: ProgressInfo) => {
        setProgressInfo(info)
      }
    )

    return unlisten
  }, [])

  useEffect(() => {
    const unlisten = window.electron.ipcRenderer.on('update-downloaded', () => {
      setStatus('downloaded')
    })

    return unlisten
  }, [])

  if (!updateInfo) return null

  return (
    <>
      <div className="flex h-screen flex-grow flex-col">
        <div className="shrink-0 drag-region">
          <div className="flex h-9 items-center justify-center text-center text-sm font-medium">
            App Update
          </div>
          <div className="border-b px-3 py-3 pb-5">
            {status ? (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span>
                    {status === 'downloaded'
                      ? `New version of ${APP_NAME} is ready to install`
                      : `Downloading ${APP_NAME}...`}
                  </span>

                  {progressInfo && status === 'downloading' && (
                    <span>{prettyBytes(progressInfo.bytesPerSecond)}/s</span>
                  )}
                </div>
                <div className="relative h-5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${status === 'downloaded' ? 100 : progressInfo?.percent || 0}%`
                    }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <p className="font-bold">New version of {APP_NAME} is available</p>
                <p className="mt-1">
                  {APP_NAME} {updateInfo?.version} is now available — you have {APP_VERSION}. Would
                  you like to update now?
                </p>
              </>
            )}
            <div className="mt-3 flex items-center gap-1">
              {status === 'downloaded' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    actionsProxy.quitAndInstall.invoke()
                  }}
                >
                  Install Update
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={status === 'downloading'}
                  onClick={() => {
                    setStatus('downloading')
                    actionsProxy.downloadUpdate.invoke()
                  }}
                >
                  Download Update
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  actionsProxy.closeWindow.invoke({ id: 'updater' })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-grow divide-y overflow-auto">
          {Array.isArray(updateInfo?.releaseNotes) && (
            <div>
              {updateInfo.releaseNotes.map((note: any) => {
                return (
                  <div key={note.version} className="p-3">
                    <h2 className="mb-3 text-xl font-bold">v{note.version}</h2>
                    <div
                      className="prose prose-invert"
                      dangerouslySetInnerHTML={{ __html: note.note }}
                    ></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

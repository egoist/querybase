import { actionsProxy } from '@renderer/lib/actions-proxy'
import { footerButtonVariants } from './sidebar'

export const DesktopUpdaterButton = () => {
  const checkUpdatesQuery = actionsProxy.checkForUpdates.useQuery(undefined, {
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000
  })

  if (!checkUpdatesQuery.data) {
    return null
  }

  return (
    <button
      onClick={async () => {
        await actionsProxy.showUpdaterWindow.invoke()
      }}
      className={footerButtonVariants()}
    >
      <span className="i-mingcute-arrow-up-circle-fill mr-1 text-orange-500"></span>
      <span className="text-xs text-slate-500">Update</span>
    </button>
  )
}

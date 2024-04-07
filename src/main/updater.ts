import electronUpdater, { UpdateInfo } from 'electron-updater'
import { showUpdaterWindow, windows } from './windows'
import { MenuItem, dialog } from 'electron'

electronUpdater.autoUpdater.fullChangelog = true
electronUpdater.autoUpdater.autoDownload = false

// electronUpdater.autoUpdater.forceDevUpdateConfig = import.meta.env.DEV

if (import.meta.env.PROD) {
  electronUpdater.autoUpdater.setFeedURL({
    provider: 'github',
    host: 'electron-releases.umida.co',
    owner: 'egoist',
    repo: 'querybase'
  })
}

let updateInfo: UpdateInfo | null = null
let menuItem: MenuItem | null = null

function enableMenuItem() {
  if (menuItem) {
    menuItem.enabled = true
    menuItem = null
  }
}

export function init() {
  electronUpdater.autoUpdater.addListener('update-downloaded', () => {
    const window = windows.get('updater')
    if (window) {
      window.webContents.send('update-downloaded')
    }
  })

  electronUpdater.autoUpdater.addListener('update-not-available', () => {
    updateInfo = null
    enableMenuItem()
    const window = windows.get('updater')
    window?.close()
  })

  electronUpdater.autoUpdater.addListener('download-progress', (info) => {
    const window = windows.get('updater')
    if (window) {
      window.webContents.send('download-progress', info)
    }
  })
}

export function getUpdateInfo() {
  return updateInfo
}

export async function checkForUpdatesMenuItem(_menuItem: MenuItem) {
  menuItem = _menuItem
  menuItem.enabled = false

  const updates = await electronUpdater.autoUpdater.checkForUpdates()

  enableMenuItem()

  if (
    updates &&
    electronUpdater.autoUpdater.currentVersion.compare(updates.updateInfo.version) === -1
  ) {
    updateInfo = updates.updateInfo
    showUpdaterWindow()
  } else {
    updateInfo = null
    await dialog.showMessageBox({
      title: 'No updates available',
      message: `You are already using the latest version of ${APP_NAME}.`
    })
  }
}

export async function checkForUpdates() {
  const updates = await electronUpdater.autoUpdater.checkForUpdates()

  if (
    updates &&
    electronUpdater.autoUpdater.currentVersion.compare(updates.updateInfo.version) === -1
  ) {
    updateInfo = updates.updateInfo
    return updateInfo
  }

  updateInfo = null
  return null
}

export function quitAndInstall() {
  electronUpdater.autoUpdater.quitAndInstall()
}

export function downloadUpdate() {
  return electronUpdater.autoUpdater.downloadUpdate()
}

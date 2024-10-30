import { app, BrowserWindow, ipcMain, protocol } from 'electron'
import { optimizer } from '@electron-toolkit/utils'
import { actions } from './actions'
import { createMainWindow } from './windows'
import { runMigrations } from './app-db'
import { registerAssetsProtocol } from './serve'
import path from 'path'

for (const name of Object.keys(actions)) {
  const action = actions[name]
  ipcMain.handle(name, action)
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'assets', privileges: { secure: true, standard: true, supportFetchAPI: true } }
])

async function main() {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  await app.whenReady()

  registerAssetsProtocol()

  if (import.meta.env.DEV) {
    app.dock.setIcon(path.join(__dirname, '../../resources/icon.png'))
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await runMigrations()

  createMainWindow()

  import('./updater').then((updater) => updater.init()).catch(console.error)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

main()

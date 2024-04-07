import { BrowserWindow, BrowserWindowConstructorOptions, shell } from 'electron'
import icon from '../../resources/icon.png?asset'
import path from 'path'
import { disableCors } from './cors'

export type WindowId = 'main' | 'updater'

export const windows = new Map<WindowId, BrowserWindow>()

const createWindow = ({
  id,
  path: urlPath,
  windowOptions
}: {
  id: WindowId
  path?: string
  windowOptions?: BrowserWindowConstructorOptions
}) => {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    ...(process.platform === 'linux' ? { icon } : {}),
    ...windowOptions,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      spellcheck: false
    }
  })

  windows.set(id, window)

  disableCors(window)

  window.on('ready-to-show', () => {
    window.show()
  })

  window.on('close', () => {
    windows.delete(id)
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const url = import.meta.env.DEV ? 'http://localhost:5173' : 'assets://app'
  window.loadURL(url + (urlPath || ''))

  return window
}

export const createMainWindow = () => {
  const window = windows.get('main')

  if (window) {
    window.show()
    return window
  }

  return createWindow({
    id: 'main',
    windowOptions: {
      minWidth: 800,
      minHeight: 600,
      trafficLightPosition: { x: 12, y: 16 }
    }
  })
}

export function showUpdaterWindow() {
  let window = windows.get('updater')

  if (!window) {
    window = createWindow({
      id: 'updater',
      path: '/updater',
      windowOptions: {
        width: 700,
        height: 500,
        resizable: false
        // vibrancy: "sidebar",
        // visualEffectState: "active",
      }
    })
  } else {
    window.show()
  }

  return window
}

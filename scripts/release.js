// @ts-check
import { execSync } from 'child_process'

/**
 *
 * @param {string} command
 * @param {{cwd?: string}} options
 * @returns
 */
const run = (command, { cwd } = {}) => {
  return execSync(command, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...(process.platform === 'darwin'
        ? {
            CSC_LINK: process.env.CSC_LINK,
            CSC_KEY_PASSWORD: process.env.CSC_KEY_PASSWORD,
            APPLE_ID: process.env.APPLE_ID,
            APPLE_APP_SPECIFIC_PASSWORD: process.env.APPLE_PASSWORD
          }
        : {})
    }
  })
}

const desktopDir = process.cwd()

if (process.platform === 'darwin') {
  run(`pnpm build:mac --arm64 --x64 --publish always`, {
    cwd: desktopDir
  })
} else {
  run(`pnpm build:win --publish always`, {
    cwd: desktopDir
  })
}

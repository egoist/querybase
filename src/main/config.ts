import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { Config } from '@shared/types'

const configPath = path.join(app.getPath('userData'), 'config.json')

export const loadConfig = async (): Promise<Config> => {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

export const saveConfig = async (config: Config) => {
  fs.mkdirSync(path.dirname(configPath), { recursive: true })
  fs.writeFileSync(configPath, JSON.stringify(config))
}

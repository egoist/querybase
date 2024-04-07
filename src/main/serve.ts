import path from 'path'
import fs from 'fs/promises'
import { ProtocolRequest, ProtocolResponse, protocol } from 'electron'

const rendererDir = path.join(__dirname, '../renderer')

// See https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6

const getPath = async (path_: string): Promise<string | null> => {
  try {
    const result = await fs.stat(path_)

    if (result.isFile()) {
      return path_
    }

    if (result.isDirectory()) {
      return getPath(path.join(path_, 'index.html'))
    }
  } catch (_) {}

  return null
}

const handleApp = async (
  request: ProtocolRequest,
  callback: (response: string | ProtocolResponse) => void
) => {
  const indexPath = path.join(rendererDir, 'index.html')
  const filePath = path.join(rendererDir, decodeURIComponent(new URL(request.url).pathname))
  const resolvedPath = (await getPath(filePath)) || (await getPath(filePath + '.html'))
  const fileExtension = path.extname(filePath)

  if (resolvedPath || !fileExtension || fileExtension === '.html' || fileExtension === '.asar') {
    callback({
      path: resolvedPath || indexPath
    })
  } else {
    callback({ error: FILE_NOT_FOUND })
  }
}

export const registerAssetsProtocol = () => {
  protocol.registerFileProtocol('assets', (request, callback) => {
    const { host, searchParams } = new URL(request.url)

    if (host === 'file') {
      const filepath = searchParams.get('path')
      if (filepath) {
        return callback({ path: filepath })
      }
    }
    if (host === 'app') {
      return handleApp(request, callback)
    }

    callback({ error: FILE_NOT_FOUND })
  })
}

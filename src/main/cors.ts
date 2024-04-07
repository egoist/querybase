import { BrowserWindow } from 'electron'

export function disableCors(window: BrowserWindow) {
  function upsertKeyValue(
    obj: Record<string, string | string[]>,
    keyToChange: string,
    value: string[]
  ) {
    const keyToChangeLower = keyToChange.toLowerCase()
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase() === keyToChangeLower) {
        // Reassign old key
        obj[key] = value
        // Done
        return
      }
    }
    // Insert at end instead
    obj[keyToChange] = value
  }

  window.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders, url } = details
    upsertKeyValue(requestHeaders, 'Access-Control-Allow-Origin', ['*'])

    const { protocol, host } = new URL(url)
    upsertKeyValue(requestHeaders, 'Origin', [`${protocol}//${host}`])

    callback({ requestHeaders })
  })

  window.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders || {}
    upsertKeyValue(responseHeaders, 'Access-Control-Allow-Origin', ['*'])
    upsertKeyValue(responseHeaders, 'Access-Control-Allow-Headers', ['*'])

    if (details.method === 'OPTIONS') {
      details.statusCode = 200
      details.statusLine = 'HTTP/1.1 200 OK'
      details.responseHeaders = responseHeaders
      return callback(details)
    }

    callback({
      responseHeaders
    })
  })
}

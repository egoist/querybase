export function notEmpty<T>(value: T | null | undefined | '' | false): value is T {
  return value !== null && value !== undefined && value !== '' && value !== false
}

export function stringifyUrl(url: {
  protocol: string
  host: string
  port?: string | null
  pathname?: string | null
  query?: string | null
  user?: string | null
  password?: string | null
}) {
  return `${url.protocol}//${url.user ? `${url.user}:${url.password ? `${url.password}@` : ''}` : ''}${url.host}${url.port ? `:${url.port}` : ''}${url.pathname ? `${url.pathname}${url.query ? `?${url.query}` : ''}` : ''}`
}

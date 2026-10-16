const DEFAULT_AUTH_REDIRECT = '/todo'

// Only the routes used after login are accepted. Reject encoded path segments,
// browser-normalized separators and dot segments rather than interpreting them.
const AUTH_PATH = /^(?:\/note|\/todo(?:\/[A-Za-z0-9_-]+(?:\/done)?)?)\/?$/

export function normalizeAuthRedirect(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value)) {
    return DEFAULT_AUTH_REDIRECT
  }

  const pathname = value.split(/[?#]/, 1)[0]
  return AUTH_PATH.test(pathname) ? value : DEFAULT_AUTH_REDIRECT
}

export function buildAuthCallbackUrl(origin: string, redirectPath: unknown): string {
  const callback = new URL('/auth/callback', origin)
  callback.searchParams.set('redirect', normalizeAuthRedirect(redirectPath))
  return callback.toString()
}

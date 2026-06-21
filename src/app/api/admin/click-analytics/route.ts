import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'
import {
  deleteClickAnalytics,
  deleteProductClickById,
  readClickAnalyticsSnapshot,
} from '@/server/infra/clickAnalyticsStore'
import { hasUpstashRedisConfig } from '@/server/infra/upstashRedis'

const AUTH_COOKIE_NAME = 'specsy_analytics_session'

function configuredPassword(): string {
  return process.env.SPECSY_ANALYTICS_PASSWORD ?? process.env.ANALYTICS_ADMIN_PASSWORD ?? ''
}

function canUseLocalFallback(): boolean {
  return process.env.NODE_ENV !== 'production'
}

function isPasswordValid(password: string): boolean {
  const expected = configuredPassword()
  if (!expected && canUseLocalFallback()) {
    return password === 'specsy-local'
  }

  return Boolean(expected) && password === expected
}

function authSecret(): string {
  return configuredPassword() || (canUseLocalFallback() ? 'specsy-local' : '')
}

function currentJstDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function secondsUntilNextJstDay(date = new Date()): number {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const [year, month, day] = formatter.format(date).split('-').map(Number)
  const nextJstMidnightUtcMs = Date.UTC(year, month - 1, day + 1, -9, 0, 0, 0)
  return Math.max(60, Math.floor((nextJstMidnightUtcMs - date.getTime()) / 1000))
}

function signDateKey(dateKey: string): string {
  const secret = authSecret()
  return createHmac('sha256', secret).update(`specsy-analytics:${dateKey}`).digest('hex')
}

function createSessionToken(dateKey = currentJstDateKey()): string {
  return `${dateKey}.${signDateKey(dateKey)}`
}

function isSessionTokenValid(token: string | undefined): boolean {
  if (!token || !authSecret()) {
    return false
  }

  const [dateKey, signature] = token.split('.')
  if (!dateKey || !signature || dateKey !== currentJstDateKey()) {
    return false
  }

  const expected = signDateKey(dateKey)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer)
}

function sessionCookieHeader(): string {
  const attributes = [
    `${AUTH_COOKIE_NAME}=${createSessionToken()}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/api/admin',
    `Max-Age=${secondsUntilNextJstDay()}`,
  ]

  if (process.env.NODE_ENV === 'production') {
    attributes.push('Secure')
  }

  return attributes.join('; ')
}

function withSessionCookie(headers: HeadersInit = {}): Headers {
  const nextHeaders = new Headers(headers)
  nextHeaders.set('Set-Cookie', sessionCookieHeader())
  return nextHeaders
}

function authErrorResponse(request: NextRequest, password: string): Response | null {
  if (!configuredPassword() && !canUseLocalFallback()) {
    return Response.json(
      { error: 'analytics password is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!isSessionTokenValid(request.cookies.get(AUTH_COOKIE_NAME)?.value) && !isPasswordValid(password)) {
    return Response.json(
      { error: 'unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!hasUpstashRedisConfig()) {
    return Response.json(
      { error: 'Upstash Redis is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { password?: string }
    const password = typeof body.password === 'string' ? body.password : ''
    const authError = authErrorResponse(request, password)
    if (authError) {
      return authError
    }

    const snapshot = await readClickAnalyticsSnapshot()
    return Response.json(snapshot, {
      headers: withSessionCookie({
        'Cache-Control': 'no-store',
      }),
    })
  } catch (error) {
    console.error('Click analytics admin error:', error)

    return Response.json(
      { error: 'failed to load analytics' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json() as {
      password?: string
      action?: 'delete_all' | 'delete_click'
      click_id?: string
    }
    const password = typeof body.password === 'string' ? body.password : ''
    const authError = authErrorResponse(request, password)
    if (authError) {
      return authError
    }

    if (body.action === 'delete_all') {
      await deleteClickAnalytics()
    } else if (body.action === 'delete_click' && typeof body.click_id === 'string') {
      const deleted = await deleteProductClickById(body.click_id)
      if (!deleted) {
        return Response.json(
          { error: 'click not found' },
          { status: 404, headers: { 'Cache-Control': 'no-store' } }
        )
      }
    } else {
      return Response.json(
        { error: 'invalid delete action' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    const snapshot = await readClickAnalyticsSnapshot()
    return Response.json(snapshot, {
      headers: withSessionCookie({
        'Cache-Control': 'no-store',
      }),
    })
  } catch (error) {
    console.error('Click analytics delete error:', error)

    return Response.json(
      { error: 'failed to delete analytics' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

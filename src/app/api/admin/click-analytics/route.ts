import { NextRequest } from 'next/server'
import {
  deleteClickAnalytics,
  deleteProductClickById,
  readClickAnalyticsSnapshot,
} from '@/server/infra/clickAnalyticsStore'
import { hasUpstashRedisConfig } from '@/server/infra/upstashRedis'

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

function authErrorResponse(password: string): Response | null {
  if (!configuredPassword() && !canUseLocalFallback()) {
    return Response.json(
      { error: 'analytics password is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!isPasswordValid(password)) {
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
    const body = await request.json() as { password?: string }
    const password = typeof body.password === 'string' ? body.password : ''
    const authError = authErrorResponse(password)
    if (authError) {
      return authError
    }

    const snapshot = await readClickAnalyticsSnapshot()
    return Response.json(snapshot, {
      headers: {
        'Cache-Control': 'no-store',
      },
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
    const authError = authErrorResponse(password)
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
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Click analytics delete error:', error)

    return Response.json(
      { error: 'failed to delete analytics' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

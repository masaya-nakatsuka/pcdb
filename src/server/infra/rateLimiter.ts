import { NextRequest } from 'next/server'
import { upstashRedis } from './upstashRedis'

/**
 * レート制限設定
 */
const CONFIG = {
  MAX_REQUESTS: 100,
  WINDOW_SECONDS: 60,
  KEY_PREFIX: 'rl:',
} as const

/**
 * レート制限結果の型
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * リクエストからIPアドレスを抽出
 */
function extractIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for') ||
    forwardedFor

  return realIp || '127.0.0.1'
}

/**
 * IP単位でのレート制限チェック
 */
export async function checkRateLimit(request: NextRequest): Promise<RateLimitResult> {
  const ip = extractIP(request)
  const key = `${CONFIG.KEY_PREFIX}${ip}`
  const now = Date.now()

  try {
    // Redis操作: カウンター増加とTTL取得
    const [count, ttl] = await upstashRedis.pipeline([
      ['INCR', key],
      ['TTL', key]
    ])

    // 新規キーの場合はTTL設定
    if (ttl === -1) {
      await upstashRedis.expire(key, CONFIG.WINDOW_SECONDS)
    }

    const resetTime = now + ((ttl > 0 ? ttl : CONFIG.WINDOW_SECONDS) * 1000)
    const remaining = Math.max(0, CONFIG.MAX_REQUESTS - count)
    const success = count <= CONFIG.MAX_REQUESTS

    const result: RateLimitResult = {
      success,
      limit: CONFIG.MAX_REQUESTS,
      remaining,
      resetTime,
    }

    if (!success) {
      result.retryAfter = Math.ceil((resetTime - now) / 1000)
    }

    return result

  } catch (error) {
    console.error('Rate limit check failed:', error)
    
    // エラー時はフェイルオープン（制限を無効化）
    return {
      success: true,
      limit: CONFIG.MAX_REQUESTS,
      remaining: CONFIG.MAX_REQUESTS,
      resetTime: now + (CONFIG.WINDOW_SECONDS * 1000),
    }
  }
}

/**
 * 429レスポンスを生成
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'レート制限に達しました',
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.floor(result.resetTime / 1000).toString(),
        'Retry-After': (result.retryAfter || 60).toString(),
      },
    }
  )
}

/**
 * レスポンスにレート制限ヘッダーを追加
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', result.limit.toString())
  headers.set('X-RateLimit-Remaining', result.remaining.toString())
  headers.set('X-RateLimit-Reset', Math.floor(result.resetTime / 1000).toString())

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

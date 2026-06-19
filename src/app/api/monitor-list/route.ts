import { NextRequest } from 'next/server'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../../server/infra/rateLimiter'
import { fetchMonitorList } from '../../../server/usecase/fetchMonitorList'

export async function GET(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request)

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const monitors = await fetchMonitorList()

    const response = Response.json(monitors, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error('Monitor list API error:', error)

    const errorResponse = Response.json(
      { error: 'モニター一覧の取得に失敗しました' },
      { status: 500 }
    )

    return addRateLimitHeaders(errorResponse, rateLimitResult)
  }
}

import { NextRequest } from 'next/server'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../../server/infra/rateLimiter'
import { fetchTabletList } from '../../../server/usecase/fetchTabletList'

export async function GET(request: NextRequest) {
  const rateLimitResult = await checkRateLimit(request)

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const tablets = await fetchTabletList()

    const response = Response.json(tablets, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error('Tablet list API error:', error)

    const errorResponse = Response.json(
      { error: 'タブレット一覧の取得に失敗しました' },
      { status: 500 }
    )

    return addRateLimitHeaders(errorResponse, rateLimitResult)
  }
}

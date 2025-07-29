import { NextRequest } from 'next/server'
import { checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '../../../server/infra/rateLimiter'
import { fetchPcList } from '../../../server/usecase/fetchPcList'
import { ServerUsageCategory } from '../../../server/types'

export async function GET(request: NextRequest) {
  // レート制限チェック
  const rateLimitResult = await checkRateLimit(request)
  
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult)
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = (searchParams.get('category') as ServerUsageCategory) || 'cafe'
    
    const pcs = await fetchPcList(category)
    
    const response = Response.json(pcs, {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5分キャッシュ
      }
    })

    return addRateLimitHeaders(response, rateLimitResult)
    
  } catch (error) {
    console.error('PC list API error:', error)
    
    const errorResponse = Response.json(
      { error: 'PC一覧の取得に失敗しました' },
      { status: 500 }
    )

    return addRateLimitHeaders(errorResponse, rateLimitResult)
  }
}
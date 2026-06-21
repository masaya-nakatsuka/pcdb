import { NextRequest } from 'next/server'
import { recordProductClick, type ProductClickInput } from '@/server/infra/clickAnalyticsStore'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as ProductClickInput
    await recordProductClick(payload, request.headers.get('referer') ?? '')

    return Response.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Product click analytics error:', error)

    return Response.json(
      { ok: false },
      {
        status: 202,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}

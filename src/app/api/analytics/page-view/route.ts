import { NextRequest } from 'next/server'
import { recordPageView, type PageViewInput } from '@/server/infra/clickAnalyticsStore'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as PageViewInput
    await recordPageView(payload)

    return Response.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Page view analytics error:', error)

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

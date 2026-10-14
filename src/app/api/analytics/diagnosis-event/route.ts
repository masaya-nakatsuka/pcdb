import { NextRequest } from 'next/server'
import { recordDiagnosisEvent, type DiagnosisEventInput } from '@/server/infra/diagnosisAnalyticsStore'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as DiagnosisEventInput
    await recordDiagnosisEvent(payload, request.headers.get('referer') ?? '')

    return Response.json(
      { ok: true },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Diagnosis analytics error:', error)

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

import { NextRequest } from 'next/server'
import { fetchCpuList } from '../../../server/usecase/fetchCpuList'

export async function GET(request: NextRequest) {
  try {
    const cpuList = await fetchCpuList()
    
    return Response.json(cpuList, {
      headers: {
        'Cache-Control': 'public, max-age=3600' // 1時間キャッシュ
      }
    })
    
  } catch (error) {
    console.error('CPU list API error:', error)
    
    return Response.json(
      { error: 'CPU一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}
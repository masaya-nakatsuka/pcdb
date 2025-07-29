import { ClientUsageCategory } from '../../components/types'

/**
 * API Route経由でPC一覧取得（レート制限付き）
 */
export async function fetchPcList(usageCategory: ClientUsageCategory = 'cafe') {
  try {
    const response = await fetch(`/api/pc-list?category=${usageCategory}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'レート制限に達しました')
      }
      throw new Error('PC一覧の取得に失敗しました')
    }

    return await response.json()
  } catch (error) {
    console.error('PC fetch error:', error)
    throw error
  }
}
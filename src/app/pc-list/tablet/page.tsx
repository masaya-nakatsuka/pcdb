import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createPageMetadata } from '@/lib/seoMetadata'

export const metadata: Metadata = createPageMetadata({
  title: 'タブレット比較 - スペクシーハブ',
  description: 'AndroidタブレットとiPadを、OS、SoC、RAM、ROM、画面サイズ、駆動時間、価格のバランスで比較できます。',
  path: '/pc-list/tablet',
})

export default function TabletPcListPage() {
  redirect('/tablet-list')
}

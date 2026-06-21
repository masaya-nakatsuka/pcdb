import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seoMetadata'
import TabletListView from './TabletListView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: 'タブレット比較 - スペクシーハブ',
  description: 'AndroidタブレットとiPadを、OS、SoC、RAM、ROM、画面サイズ、駆動時間、価格のバランスで比較する画面です。',
  path: '/tablet-list',
})

export default function TabletListPage() {
  return <TabletListView />
}

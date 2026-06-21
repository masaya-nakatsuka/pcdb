import type { Metadata } from 'next'
import TabletListView from './TabletListView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'タブレット比較 - スペクシーハブ',
  description: 'AndroidタブレットとiPadを、OS、SoC、RAM、ROM、画面、駆動時間、価格で比較する画面です。',
}

export default function TabletListPage() {
  return <TabletListView />
}

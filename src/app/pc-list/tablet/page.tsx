import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'タブレット比較 - スペクシーハブ',
  description: 'AndroidタブレットとiPadを、OS、SoC、RAM、ROM、画面、駆動時間、価格で比較できます。',
}

export default function TabletPcListPage() {
  redirect('/tablet-list')
}

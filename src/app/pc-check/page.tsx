import { createPageMetadata } from '@/lib/seoMetadata'
import PcCheckClient from './PcCheckClient'

export const metadata = createPageMetadata({
  title: 'PC購入前チェック診断 - Specsy Hub',
  description: '用途、予算、持ち運び、Office、Web会議、ゲーム、動画編集の条件から、買ってよいPCの目安と避けたい条件を整理します。',
  path: '/pc-check',
})

export default function PcCheckPage() {
  return <PcCheckClient />
}

import { createPageMetadata } from '@/lib/seoMetadata'
import PcListPageClient from './PcListPageClient'

export const metadata = createPageMetadata({
  title: 'Amazon PC一覧スコア比較 - スペクシーハブ',
  description: 'AmazonのPCを用途別に比較。ノートPC、ゲーミングPC、軽量モバイルPCを、CPU、GPU、メモリ、SSD、価格、バッテリーのバランスでランキング化。',
  path: '/pc-list',
})

export default function PcListPage() {
  return <PcListPageClient />
}

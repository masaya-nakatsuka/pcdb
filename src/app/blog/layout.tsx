import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Specsy PC-DBブログ｜Amazon PC比較・ランキング記事',
  description: 'Amazon内のPCをSpecsyのPC-DBで比較する記事一覧。価格、CPU型番、GPU、メモリ、SSD、推定駆動時間を使ってPC選びを整理します。',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Specsy PC-DBブログ',
    description: 'Amazon内のPCをPC-DBで比較する記事一覧。',
    url: 'https://specsy-hub.com/blog',
    siteName: 'Specsy',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function BlogSegmentLayout({ children }: { children: React.ReactNode }) {
  return children
}

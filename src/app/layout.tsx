import './global.css'

export const metadata = {
  title: 'Specsy（スペクシー)',
  description: '自分のスペックを引き上げる総合プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-charcoal-deep font-sans antialiased text-frost-soft">{children}</body>
    </html>
  )
}

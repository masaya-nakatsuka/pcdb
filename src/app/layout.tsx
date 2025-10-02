import './global.css'

export const metadata = {
  title: 'Specsy（スペクシー） - パソコン比較サイト',
  description: 'PCの性能を比較して最適なパソコンを見つけよう！用途別にスペック評価・価格・バッテリー性能を比較できるサイト。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' }}>{children}</body>
    </html>
  )
}

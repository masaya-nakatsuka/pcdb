import type { Metadata } from 'next'
import Script from 'next/script'
import { createPageMetadata } from '@/lib/seoMetadata'
import './global.css'

export const metadata: Metadata = createPageMetadata({
  title: 'Specsy（スペクシー）',
  description: 'AmazonのPC、ミニPC、タブレット、モニターを価格、CPU、GPU、メモリ、SSD、用途別スコアで比較できるスペック比較サイトです。',
  path: '/',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* <!-- Google tag (gtag.js) --> */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YKHYG1RSPZ"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YKHYG1RSPZ', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="bg-charcoal-deep font-sans antialiased text-frost-soft">{children}</body>
    </html>
  )
}

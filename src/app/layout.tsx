import Script from 'next/script'
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

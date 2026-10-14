import type { Metadata } from 'next'
import { createPageMetadata, SITE_URL } from '@/lib/seoMetadata'
import { aiCodingPcTheme } from '@/lib/diagnosis'
import AiCodingPcDiagnosisClient from './AiCodingPcDiagnosisClient'

const title = 'AIコーディングPC診断 - Specsy'
const description = 'Cursor、Claude Code、Codex、Docker、動画編集、ローカルLLMの条件から、AIコーディング用PCの構成目安と避けたい条件を整理します。'
const canonicalUrl = `${SITE_URL}${aiCodingPcTheme.path}`
const ogImage = `${SITE_URL}/lp/specsy-laptop-new.webp`

export const metadata: Metadata = {
  ...createPageMetadata({
    title,
    description,
    path: aiCodingPcTheme.path,
  }),
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: 'Specsy',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: 'AIコーディングPC診断',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
}

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'ホーム',
      item: `${SITE_URL}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: '診断',
      item: `${SITE_URL}/pc-check`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: aiCodingPcTheme.title,
      item: canonicalUrl,
    },
  ],
}

const faqItems = [
  {
    question: 'AIコーディング用PCは16GBメモリで足りますか？',
    answer: '軽いWeb制作やAPI中心なら16GBから見られます。Docker、複数リポジトリ、AI補助ツール、ブラウザを同時に使うなら32GBを目安にします。',
  },
  {
    question: 'ローカルLLMも動かしたい場合は同じ診断で選べますか？',
    answer: '小型モデルを試す程度なら補助条件として扱えます。本格的にローカルLLMや画像生成を動かす場合はGPUやVRAMの条件が強くなるため、通常のAIコーディングPCとは分けて考えます。',
  },
  {
    question: 'MacとWindowsはどちらが向きますか？',
    answer: 'iOS開発やApple環境が必要ならMacを優先します。Windows専用ソフト、CUDA、ゲーム、会社や学校の指定がある場合はWindowsを優先します。',
  },
  {
    question: '動画編集もする場合、何を優先しますか？',
    answer: '短い動画なら標準的なAIコーディングPCに近い構成で見られます。4Kや長尺を扱うなら32GBメモリ、SSD 1TB、GPUまたは動画処理に強いSoCを重視します。',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

const webPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: canonicalUrl,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Specsy',
    url: SITE_URL,
  },
}

export default function AiCodingPcDiagnosisPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <AiCodingPcDiagnosisClient faqItems={faqItems} />
    </>
  )
}

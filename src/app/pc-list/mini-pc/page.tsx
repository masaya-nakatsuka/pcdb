import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage, parsePcListUsage, pcListUsageLabels } from '../usageConfig'

export const metadata: Metadata = createPageMetadata({
  title: 'Mini PCランキング - スペクシーハブ',
  description: 'Mini PCを価格、CPU、メモリ、SSD、GPU、用途別スコアで比較し、作業用やゲーム用の小型PC候補を確認できます。',
  path: '/pc-list/mini-pc',
})

interface MiniPcListPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MiniPcListPage({ searchParams }: MiniPcListPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const usage = parsePcListUsage(resolvedSearchParams.usage)
  const usagePage = getPcListUsagePage(usage)
  const usageLabel = pcListUsageLabels[usage]

  return (
    <UsagePcListPageClient
      usage={usage}
      device="mini_pc"
      heading={`Mini PCランキング（${usageLabel}）`}
      description={`Mini PCだけを対象に、${usageLabel}の見方で価格・性能・メモリ・SSD・GPUを比較します。${usagePage.description}`}
    />
  )
}

import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage, parsePcListUsage, pcListUsageLabels } from '../usageConfig'

export const metadata: Metadata = createPageMetadata({
  title: 'デスクトップPCランキング - スペクシーハブ',
  description: 'デスクトップPCを価格、CPU、メモリ、SSD、GPU、用途別スコアで比較し、作業用やゲーム用の候補を確認できます。',
  path: '/pc-list/desktop',
})

interface DesktopPcListPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function DesktopPcListPage({ searchParams }: DesktopPcListPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const usage = parsePcListUsage(resolvedSearchParams.usage)
  const usagePage = getPcListUsagePage(usage)
  const usageLabel = pcListUsageLabels[usage]

  return (
    <UsagePcListPageClient
      usage={usage}
      device="desktop_pc"
      heading={`デスクトップPCランキング（${usageLabel}）`}
      description={`デスクトップPCだけを対象に、${usageLabel}の見方で価格・性能・メモリ・SSD・GPUを比較します。${usagePage.description}`}
    />
  )
}

import type { Metadata } from 'next'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage, parsePcListUsage, pcListUsageLabels } from '../usageConfig'

export const metadata: Metadata = {
  title: 'デスクトップPCランキング - スペクシーハブ',
  description: 'デスクトップPCだけを分けて、価格、CPU、メモリ、SSD、GPUなどの条件で比較できます。',
}

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

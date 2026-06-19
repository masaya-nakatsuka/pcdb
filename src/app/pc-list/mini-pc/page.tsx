import type { Metadata } from 'next'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage, parsePcListUsage, pcListUsageLabels } from '../usageConfig'

export const metadata: Metadata = {
  title: 'Mini PCランキング - スペクシーハブ',
  description: 'Mini PCだけを分けて、価格、CPU、メモリ、SSD、GPUなどの条件で比較できます。',
}

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

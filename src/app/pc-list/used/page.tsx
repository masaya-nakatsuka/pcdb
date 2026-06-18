import type { Metadata } from 'next'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage, parsePcListUsage, pcListUsageLabels } from '../usageConfig'

export const metadata: Metadata = {
  title: '中古PCランキング - スペクシーハブ',
  description: '中古・整備済みPCだけを分けて、価格、CPU、メモリ、SSD、重量などの条件で比較できます。',
}

interface UsedPcListPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsedPcListPage({ searchParams }: UsedPcListPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const usage = parsePcListUsage(resolvedSearchParams.usage)
  const usagePage = getPcListUsagePage(usage)
  const usageLabel = pcListUsageLabels[usage]

  return (
    <UsagePcListPageClient
      usage={usage}
      listing="used"
      heading={`中古PCランキング（${usageLabel}）`}
      description={`中古・整備済みPCだけを対象に、${usageLabel}の見方で価格・性能・メモリ・SSD・重量を比較します。${usagePage.description}`}
    />
  )
}

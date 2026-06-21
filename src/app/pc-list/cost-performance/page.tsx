import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('cost_performance')

export const metadata = createPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
})

export default function CostPerformancePcListPage() {
  return (
    <UsagePcListPageClient
      usage="cost_performance"
      heading={page.heading}
      description={page.description}
    />
  )
}

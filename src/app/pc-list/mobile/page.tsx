import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('mobile')

export const metadata = createPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
})

export default function MobilePcListPage() {
  return (
    <UsagePcListPageClient
      usage="mobile"
      heading={page.heading}
      description={page.description}
      decisionPoints={page.decisionPoints}
      relatedLinks={page.relatedLinks}
    />
  )
}

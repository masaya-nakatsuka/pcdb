import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('cafe')

export const metadata = createPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
})

export default function CafePcListPage() {
  return (
    <UsagePcListPageClient
      usage="cafe"
      heading={page.heading}
      description={page.description}
    />
  )
}

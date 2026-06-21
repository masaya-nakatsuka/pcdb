import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('home')

export const metadata = createPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
})

export default function HomePcListPage() {
  return (
    <UsagePcListPageClient
      usage="home"
      heading={page.heading}
      description={page.description}
    />
  )
}

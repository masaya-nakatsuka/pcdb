import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('mobile')

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function MobilePcListPage() {
  return (
    <UsagePcListPageClient
      usage="mobile"
      heading={page.heading}
      description={page.description}
    />
  )
}

import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('gaming')

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function GamingPcListPage() {
  return (
    <UsagePcListPageClient
      usage="gaming"
      heading={page.heading}
      description={page.description}
    />
  )
}

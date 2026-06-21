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
      device="all"
      heading={page.heading}
      description={page.description}
      decisionPoints={page.decisionPoints}
      relatedLinks={page.relatedLinks}
    />
  )
}

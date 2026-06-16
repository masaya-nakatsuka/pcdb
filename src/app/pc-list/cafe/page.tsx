import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('cafe')

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function CafePcListPage() {
  return (
    <UsagePcListPageClient
      usage="cafe"
      heading={page.heading}
      description={page.description}
    />
  )
}

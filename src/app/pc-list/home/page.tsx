import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('home')

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function HomePcListPage() {
  return (
    <UsagePcListPageClient
      usage="home"
      heading={page.heading}
      description={page.description}
    />
  )
}

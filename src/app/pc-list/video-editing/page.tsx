import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('video_editing')

export const metadata = {
  title: page.title,
  description: page.description,
}

export default function VideoEditingPcListPage() {
  return (
    <UsagePcListPageClient
      usage="video_editing"
      heading={page.heading}
      description={page.description}
    />
  )
}

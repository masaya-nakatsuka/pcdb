import { createPageMetadata } from '@/lib/seoMetadata'
import UsagePcListPageClient from '../UsagePcListPageClient'
import { getPcListUsagePage } from '../usageConfig'

const page = getPcListUsagePage('video_editing')

export const metadata = createPageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
})

export default function VideoEditingPcListPage() {
  return (
    <UsagePcListPageClient
      usage="video_editing"
      heading={page.heading}
      description={page.description}
    />
  )
}

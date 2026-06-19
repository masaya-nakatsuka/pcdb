import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getMonitorUsageOption,
  monitorUsageOptions,
  parseMonitorUsageSlug,
} from '../../../lib/monitorRecommendation'
import MonitorListView from '../MonitorListView'

export const dynamic = 'force-dynamic'

interface MonitorUsagePageProps {
  params: Promise<{
    usage: string
  }>
}

export function generateStaticParams() {
  return monitorUsageOptions.map((option) => ({
    usage: option.slug,
  }))
}

export async function generateMetadata({ params }: MonitorUsagePageProps): Promise<Metadata> {
  const { usage: usageSlug } = await params
  const usage = parseMonitorUsageSlug(usageSlug)

  if (!usage) {
    return {
      title: 'モニター比較 - スペクシーハブ',
    }
  }

  const usageOption = getMonitorUsageOption(usage)

  return {
    title: `${usageOption.label}モニター比較 - スペクシーハブ`,
    description: usageOption.description,
  }
}

export default async function MonitorUsagePage({ params }: MonitorUsagePageProps) {
  const { usage: usageSlug } = await params
  const usage = parseMonitorUsageSlug(usageSlug)

  if (!usage) {
    notFound()
  }

  return <MonitorListView usage={usage} />
}

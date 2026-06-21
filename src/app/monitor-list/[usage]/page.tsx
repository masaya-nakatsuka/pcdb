import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPageMetadata } from '@/lib/seoMetadata'
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
    return createPageMetadata({
      title: 'モニター比較 - スペクシーハブ',
      description: 'PCモニターをサイズ、解像度、リフレッシュレート、パネル、端子、価格、用途別の見やすさで比較する画面です。',
      path: '/monitor-list',
    })
  }

  const usageOption = getMonitorUsageOption(usage)

  return createPageMetadata({
    title: `${usageOption.label}モニター比較 - スペクシーハブ`,
    description: usageOption.description,
    path: `/monitor-list/${usageOption.slug}`,
  })
}

export default async function MonitorUsagePage({ params }: MonitorUsagePageProps) {
  const { usage: usageSlug } = await params
  const usage = parseMonitorUsageSlug(usageSlug)

  if (!usage) {
    notFound()
  }

  return <MonitorListView usage={usage} />
}

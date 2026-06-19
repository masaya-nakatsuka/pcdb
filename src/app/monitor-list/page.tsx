import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  getMonitorUsagePath,
  parseMonitorUsage,
} from '../../lib/monitorRecommendation'
import MonitorListView from './MonitorListView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'モニター比較 - スペクシーハブ',
  description: 'PCモニターをサイズ、解像度、リフレッシュレート、パネル、端子、価格で比較する画面です。',
}

interface MonitorListPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function MonitorListPage({ searchParams }: MonitorListPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}

  if (resolvedSearchParams.usage) {
    redirect(getMonitorUsagePath(parseMonitorUsage(resolvedSearchParams.usage)))
  }

  return <MonitorListView usage="work" />
}

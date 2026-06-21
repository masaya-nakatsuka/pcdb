import type { Metadata } from 'next'
import ClickAnalyticsClient from './ClickAnalyticsClient'

export const metadata: Metadata = {
  title: 'Click Analytics',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClickAnalyticsPage() {
  return <ClickAnalyticsClient />
}

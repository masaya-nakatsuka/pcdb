import type { Metadata } from 'next'

export const SITE_URL = 'https://specsy-hub.com'

interface PageMetadataInput {
  title: string
  description: string
  path: string
}

export function createPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Specsy',
      type: 'website',
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

import type { MetadataRoute } from 'next'
import { listedBlogArticles, SITE_URL } from '@/lib/blogMetadata'

const pcListRoutes = [
  '/pc-list',
  '/pc-list/mobile',
  '/pc-list/cafe',
  '/pc-list/home',
  '/pc-list/cost-performance',
  '/pc-list/mini-pc',
  '/pc-list/desktop',
  '/pc-list/used',
  '/pc-list/gaming',
  '/pc-list/video-editing',
]

const monitorRoutes = [
  '/monitor-list',
  '/monitor-list/work',
  '/monitor-list/gaming',
  '/monitor-list/creative',
  '/monitor-list/usb-c',
]

const tabletRoutes = [
  '/tablet-list',
]

const staticRoutes = [
  '/',
  '/about',
  '/blog',
  '/pc-check',
  '/privacy',
  ...pcListRoutes,
  ...monitorRoutes,
  ...tabletRoutes,
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date('2026-06-17'),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : path.startsWith('/pc-list') ? 0.9 : 0.7,
  }))

  const blogEntries = listedBlogArticles.map((article) => ({
    url: `${SITE_URL}/blog/article${article.id}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...blogEntries]
}

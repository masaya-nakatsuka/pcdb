import { getUpstashRedis } from './upstashRedis'

const KEY_PREFIX = 'specsy:click_analytics'
const RECENT_CLICK_LIMIT = 10000
const ADMIN_RECENT_LIMIT = 250

export interface ProductClickInput {
  product_id: string
  product_name?: string
  product_type: string
  source_page?: string
  page_url?: string
  usage?: string
  device?: string
  listing?: string
  outbound_domain?: string
  price?: number
  rank?: number
  link_position?: string
  is_affiliate?: boolean
  destination_url?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export interface StoredProductClick extends ProductClickInput {
  id: string
  clicked_at: string
  clicked_day: string
  clicked_minute: string
  referrer: string
}

export interface ProductClickStats {
  product_key: string
  product_id: string
  product_name: string
  product_type: string
  count: number
  price?: number
  destination_url?: string
  outbound_domain?: string
  last_seen_at?: string
}

export interface ClickAnalyticsSnapshot {
  total_clicks: number
  last_updated_at: string
  recent_clicks: StoredProductClick[]
  product_stats: ProductClickStats[]
  minute_series: Array<{ minute: string; count: number }>
  day_series: Array<{ day: string; count: number }>
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : value.toString()
}

function asJstDate(date: Date): Date {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
}

function formatJstDay(date: Date): string {
  const jst = asJstDate(date)
  return `${jst.getUTCFullYear()}-${twoDigits(jst.getUTCMonth() + 1)}-${twoDigits(jst.getUTCDate())}`
}

function formatJstMinute(date: Date): string {
  const jst = asJstDate(date)
  return `${formatJstDay(date)}T${twoDigits(jst.getUTCHours())}:${twoDigits(jst.getUTCMinutes())}`
}

function safeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim().slice(0, maxLength)
}

function safeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined
  }

  return value
}

function parseRedisHash(input: unknown): Record<string, string> {
  if (Array.isArray(input)) {
    const result: Record<string, string> = {}
    for (let index = 0; index < input.length; index += 2) {
      const key = String(input[index] ?? '')
      if (key) {
        result[key] = String(input[index + 1] ?? '')
      }
    }
    return result
  }

  if (input && typeof input === 'object') {
    const result: Record<string, string> = {}
    for (const key of Object.keys(input)) {
      const value = (input as Record<string, unknown>)[key]
      result[key] = String(value ?? '')
    }
    return result
  }

  return {}
}

function parseStoredClick(value: unknown): StoredProductClick | null {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(value) as StoredProductClick
    return parsed.id && parsed.clicked_at && parsed.product_id ? parsed : null
  } catch {
    return null
  }
}

function productKey(click: Pick<ProductClickInput, 'product_type' | 'product_id'>): string {
  return `${click.product_type || 'unknown'}:${click.product_id}`
}

function normalizeClick(input: ProductClickInput, referrer: string): StoredProductClick {
  const now = new Date()

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`,
    clicked_at: now.toISOString(),
    clicked_day: formatJstDay(now),
    clicked_minute: formatJstMinute(now),
    product_id: safeText(input.product_id, 120),
    product_name: safeText(input.product_name, 300),
    product_type: safeText(input.product_type, 40) || 'unknown',
    source_page: safeText(input.source_page, 200),
    page_url: safeText(input.page_url, 700),
    usage: safeText(input.usage, 80),
    device: safeText(input.device, 80),
    listing: safeText(input.listing, 80),
    outbound_domain: safeText(input.outbound_domain, 120),
    price: safeNumber(input.price),
    rank: safeNumber(input.rank),
    link_position: safeText(input.link_position, 120),
    is_affiliate: Boolean(input.is_affiliate),
    destination_url: safeText(input.destination_url, 700),
    utm_source: safeText(input.utm_source, 120),
    utm_medium: safeText(input.utm_medium, 120),
    utm_campaign: safeText(input.utm_campaign, 160),
    utm_content: safeText(input.utm_content, 180),
    utm_term: safeText(input.utm_term, 180),
    referrer: safeText(referrer, 700),
  }
}

export async function recordProductClick(input: ProductClickInput, referrer: string): Promise<void> {
  const click = normalizeClick(input, referrer)
  if (!click.product_id) {
    throw new Error('product_id is required')
  }

  const key = productKey(click)
  const meta = {
    product_id: click.product_id,
    product_name: click.product_name ?? '',
    product_type: click.product_type,
    price: click.price,
    destination_url: click.destination_url ?? '',
    outbound_domain: click.outbound_domain ?? '',
    last_seen_at: click.clicked_at,
  }

  await getUpstashRedis().pipeline([
    ['LPUSH', `${KEY_PREFIX}:recent`, JSON.stringify(click)],
    ['LTRIM', `${KEY_PREFIX}:recent`, '0', (RECENT_CLICK_LIMIT - 1).toString()],
    ['INCR', `${KEY_PREFIX}:total`],
    ['HINCRBY', `${KEY_PREFIX}:product_counts`, key, '1'],
    ['HSET', `${KEY_PREFIX}:product_meta`, key, JSON.stringify(meta)],
    ['HINCRBY', `${KEY_PREFIX}:day_counts`, click.clicked_day, '1'],
    ['HINCRBY', `${KEY_PREFIX}:minute_counts`, click.clicked_minute, '1'],
  ])
}

function recentMinuteKeys(): string[] {
  const now = Date.now()
  return Array.from({ length: 60 }, (_value, index) =>
    formatJstMinute(new Date(now - (59 - index) * 60 * 1000))
  )
}

function recentDayKeys(): string[] {
  const now = Date.now()
  return Array.from({ length: 30 }, (_value, index) =>
    formatJstDay(new Date(now - (29 - index) * 24 * 60 * 60 * 1000))
  )
}

export async function readClickAnalyticsSnapshot(): Promise<ClickAnalyticsSnapshot> {
  const [
    totalResult,
    recentResult,
    productCountsResult,
    productMetaResult,
    dayCountsResult,
    minuteCountsResult,
  ] = await getUpstashRedis().pipeline([
    ['GET', `${KEY_PREFIX}:total`],
    ['LRANGE', `${KEY_PREFIX}:recent`, '0', (ADMIN_RECENT_LIMIT - 1).toString()],
    ['HGETALL', `${KEY_PREFIX}:product_counts`],
    ['HGETALL', `${KEY_PREFIX}:product_meta`],
    ['HGETALL', `${KEY_PREFIX}:day_counts`],
    ['HGETALL', `${KEY_PREFIX}:minute_counts`],
  ])

  const productCounts = parseRedisHash(productCountsResult)
  const productMeta = parseRedisHash(productMetaResult)
  const dayCounts = parseRedisHash(dayCountsResult)
  const minuteCounts = parseRedisHash(minuteCountsResult)

  const recent_clicks = Array.isArray(recentResult)
    ? recentResult.map(parseStoredClick).filter((click): click is StoredProductClick => Boolean(click))
    : []

  const product_stats = Object.keys(productCounts)
    .map((key) => {
      const countValue = productCounts[key]
      let meta: Partial<ProductClickStats> = {}
      try {
        meta = productMeta[key] ? JSON.parse(productMeta[key]) as Partial<ProductClickStats> : {}
      } catch {
        meta = {}
      }

      return {
        product_key: key,
        product_id: meta.product_id ?? key.split(':').slice(1).join(':'),
        product_name: meta.product_name ?? '',
        product_type: meta.product_type ?? key.split(':')[0] ?? '',
        count: Number(countValue) || 0,
        price: meta.price,
        destination_url: meta.destination_url,
        outbound_domain: meta.outbound_domain,
        last_seen_at: meta.last_seen_at,
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 80)

  return {
    total_clicks: Number(totalResult ?? 0),
    last_updated_at: new Date().toISOString(),
    recent_clicks,
    product_stats,
    minute_series: recentMinuteKeys().map((minute) => ({
      minute,
      count: Number(minuteCounts[minute] ?? 0),
    })),
    day_series: recentDayKeys().map((day) => ({
      day,
      count: Number(dayCounts[day] ?? 0),
    })),
  }
}

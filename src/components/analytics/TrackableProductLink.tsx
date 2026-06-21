'use client'

import { useEffect } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type ProductType = 'pc' | 'monitor' | 'tablet'

interface TrackableProductLinkProps {
  href: string
  productId: number | string
  productName: string | null
  productType: ProductType
  children: ReactNode
  className?: string
  style?: CSSProperties
  rank?: number
  price?: number | null
  usage?: string | null
  device?: string | null
  listing?: string | null
  linkPosition?: string
  isAffiliate?: boolean
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
  }
}

const ATTRIBUTION_STORAGE_KEY = 'specsy_campaign_attribution_v1'
const CAMPAIGN_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

type CampaignParamKey = typeof CAMPAIGN_PARAM_KEYS[number]

interface StoredAttribution {
  entry_page_url: string
  entry_referrer: string
  first_seen_at: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

function getOutboundDomain(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function getCurrentCampaignParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }

  const params = new URLSearchParams(window.location.search)
  const campaignParams: Record<string, string> = {}

  for (const key of CAMPAIGN_PARAM_KEYS) {
    const value = params.get(key)
    if (value) {
      campaignParams[key] = value
    }
  }

  return campaignParams
}

function readStoredAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as StoredAttribution
    return parsed.entry_page_url ? parsed : null
  } catch {
    return null
  }
}

function captureAttribution() {
  if (typeof window === 'undefined') {
    return
  }

  const currentParams = getCurrentCampaignParams()
  const existing = readStoredAttribution()
  if (existing && !Object.keys(currentParams).length) {
    return
  }

  const nextAttribution: StoredAttribution = {
    ...(existing ?? {}),
    ...currentParams,
    entry_page_url: existing?.entry_page_url ?? window.location.href,
    entry_referrer: existing?.entry_referrer ?? document.referrer,
    first_seen_at: existing?.first_seen_at ?? new Date().toISOString(),
  }

  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(nextAttribution))
  } catch {
    // Attribution is helpful but must not affect product navigation.
  }
}

function getCampaignAttribution(): Record<string, string> {
  const stored = readStoredAttribution()
  const currentParams = getCurrentCampaignParams()
  const attribution: Record<string, string> = {}

  if (stored) {
    attribution.entry_page_url = stored.entry_page_url
    attribution.entry_referrer = stored.entry_referrer
    attribution.first_seen_at = stored.first_seen_at

    for (const key of CAMPAIGN_PARAM_KEYS) {
      const storedValue = stored[key as CampaignParamKey]
      if (storedValue) {
        attribution[key] = storedValue
      }
    }
  }

  return {
    ...attribution,
    ...currentParams,
  }
}

function isAffiliateOutbound(href: string, isAffiliate?: boolean): boolean {
  if (isAffiliate) {
    return true
  }

  const domain = getOutboundDomain(href)
  return domain.includes('amazon.') || domain === 'amzn.to'
}

function inferUsageFromPath(pathname: string): string {
  const match = pathname.match(/^\/(?:pc-list|monitor-list)\/([^/?#]+)/)
  return match?.[1] ?? ''
}

function recordClickLocally(eventParams: Record<string, unknown>) {
  const body = JSON.stringify(eventParams)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon('/api/analytics/product-click', blob)) {
      return
    }
  }

  fetch('/api/analytics/product-click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Local analytics must never block the outbound click.
  })
}

export default function TrackableProductLink({
  href,
  productId,
  productName,
  productType,
  children,
  className,
  style,
  rank,
  price,
  usage,
  device,
  listing,
  linkPosition,
  isAffiliate,
}: TrackableProductLinkProps) {
  useEffect(() => {
    captureAttribution()
  }, [])

  const handleClick = () => {
    if (typeof window === 'undefined') {
      return
    }

    const sourcePage = window.location.pathname
    const eventParams = {
      product_id: String(productId),
      product_name: productName ?? '',
      product_type: productType,
      source_page: sourcePage,
      page_url: window.location.href,
      usage: usage ?? inferUsageFromPath(sourcePage),
      device: device ?? '',
      listing: listing ?? '',
      outbound_domain: getOutboundDomain(href),
      price: price ?? undefined,
      rank: rank ?? undefined,
      link_position: linkPosition ?? '',
      is_affiliate: isAffiliateOutbound(href, isAffiliate),
      destination_url: href,
      transport_type: 'beacon',
      ...getCampaignAttribution(),
    }

    window.gtag?.('event', 'specsy_product_click', eventParams)
    window.dataLayer?.push?.({
      event: 'specsy_product_click',
      ...eventParams,
    })
    recordClickLocally(eventParams)

    if (eventParams.is_affiliate) {
      window.gtag?.('event', 'affiliate_outbound_click', eventParams)
      window.dataLayer?.push?.({
        event: 'affiliate_outbound_click',
        ...eventParams,
      })
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

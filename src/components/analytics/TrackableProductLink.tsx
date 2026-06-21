'use client'

import type { CSSProperties, MouseEvent, ReactNode } from 'react'

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

  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)
    if (value) {
      campaignParams[key] = value
    }
  }

  return campaignParams
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
  const handleClick = (_event: MouseEvent<HTMLAnchorElement>) => {
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
      ...getCurrentCampaignParams(),
    }

    window.gtag?.('event', 'specsy_product_click', eventParams)
    window.dataLayer?.push?.({
      event: 'specsy_product_click',
      ...eventParams,
    })

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

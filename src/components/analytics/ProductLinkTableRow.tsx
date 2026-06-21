'use client'

import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { trackProductClick, type ProductClickTrackingParams } from './TrackableProductLink'

interface ProductLinkTableRowProps extends Omit<ProductClickTrackingParams, 'href'> {
  href?: string | null
  children: ReactNode
  className?: string
  style?: CSSProperties
}

function shouldIgnoreRowLink(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest('a, button, input, select, textarea, summary, [role="button"], [data-row-link-ignore="true"]')
  )
}

function openProductLink(href: string) {
  const openedWindow = window.open(href, '_blank', 'noopener,noreferrer')
  if (openedWindow) {
    openedWindow.opener = null
  }
}

export default function ProductLinkTableRow({
  href,
  productId,
  productName,
  productType,
  rank,
  price,
  usage,
  device,
  listing,
  linkPosition,
  isAffiliate,
  children,
  className,
  style,
}: ProductLinkTableRowProps) {
  if (!href) {
    return (
      <tr className={className} style={style}>
        {children}
      </tr>
    )
  }

  const trackingParams = {
    href,
    productId,
    productName,
    productType,
    rank,
    price,
    usage,
    device,
    listing,
    linkPosition,
    isAffiliate,
  }

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (shouldIgnoreRowLink(event.target)) {
      return
    }

    trackProductClick(trackingParams)
    openProductLink(href)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    if (shouldIgnoreRowLink(event.target)) {
      return
    }

    event.preventDefault()
    trackProductClick(trackingParams)
    openProductLink(href)
  }

  return (
    <tr
      className={['product-link-table-row', className].filter(Boolean).join(' ')}
      style={style}
      role="link"
      tabIndex={0}
      aria-label={`${productName ?? '商品'}を開く`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </tr>
  )
}

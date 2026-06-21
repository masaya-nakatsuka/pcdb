'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const ATTRIBUTION_STORAGE_KEY = 'specsy_campaign_attribution_v1'
const CAMPAIGN_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
let lastTrackedUrl = ''

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

function getCurrentCampaignParams(): Record<string, string> {
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
  const currentParams = getCurrentCampaignParams()
  const existing = readStoredAttribution()
  if (existing && !Object.keys(currentParams).length) {
    return existing
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
    // Attribution is useful for analysis but must not affect page rendering.
  }

  return nextAttribution
}

function buildPageViewPayload(pathname: string): Record<string, string> {
  const stored = captureAttribution()
  const currentParams = getCurrentCampaignParams()
  const payload: Record<string, string> = {
    page_path: pathname,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
  }

  if (stored) {
    payload.entry_page_url = stored.entry_page_url
    payload.entry_referrer = stored.entry_referrer
    payload.first_seen_at = stored.first_seen_at

    for (const key of CAMPAIGN_PARAM_KEYS) {
      const storedValue = stored[key as CampaignParamKey]
      if (storedValue) {
        payload[key] = storedValue
      }
    }
  }

  return {
    ...payload,
    ...currentParams,
  }
}

function recordPageView(payload: Record<string, string>) {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon('/api/analytics/page-view', blob)) {
      return
    }
  }

  fetch('/api/analytics/page-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Local analytics must never affect page navigation.
  })
}

function shouldSkipPageView(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || shouldSkipPageView(pathname)) {
      return
    }

    if (lastTrackedUrl === window.location.href) {
      return
    }

    lastTrackedUrl = window.location.href
    recordPageView(buildPageViewPayload(pathname))
  }, [pathname])

  return null
}

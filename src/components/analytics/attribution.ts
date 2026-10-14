export const ATTRIBUTION_STORAGE_KEY = 'specsy_campaign_attribution_v1'
export const CAMPAIGN_PARAM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'] as const

type CampaignParamKey = typeof CAMPAIGN_PARAM_KEYS[number]

export interface StoredAttribution {
  entry_page_url: string
  entry_referrer: string
  first_seen_at: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  utm_id?: string
}

export function getCurrentCampaignParams(): Record<string, string> {
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

export function readStoredAttribution(): StoredAttribution | null {
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

export function captureAttribution(): StoredAttribution | null {
  if (typeof window === 'undefined') {
    return null
  }

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
    // Attribution must never affect rendering or navigation.
  }

  return nextAttribution
}

export function getCampaignAttribution(): Record<string, string> {
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

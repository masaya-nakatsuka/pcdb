'use client'

import { captureAttribution, getCampaignAttribution } from './attribution'
import type { BudgetFit, DiagnosisCtaKind, DiagnosisThemeId } from '@/lib/diagnosis'

export type DiagnosisEventName =
  | 'diagnosis_start'
  | 'diagnosis_answer'
  | 'diagnosis_result'
  | 'diagnosis_cta_click'
  | 'diagnosis_share'
  | 'diagnosis_reset'

export interface DiagnosisEventParams {
  eventName: DiagnosisEventName
  theme: DiagnosisThemeId
  themeVersion: string
  resolverVersion: string
  step?: number
  questionId?: string
  answerId?: string
  resultKey?: string
  resultType?: string
  budgetFit?: BudgetFit
  modifierIds?: string[]
  ctaId?: string
  ctaKind?: DiagnosisCtaKind
  ctaLabel?: string
}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
  }
}

function recordDiagnosisEventLocally(eventParams: Record<string, unknown>) {
  const body = JSON.stringify(eventParams)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    if (navigator.sendBeacon('/api/analytics/diagnosis-event', blob)) {
      return
    }
  }

  fetch('/api/analytics/diagnosis-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Diagnosis analytics must never block user interaction.
  })
}

export function trackDiagnosisEvent(params: DiagnosisEventParams) {
  if (typeof window === 'undefined') {
    return
  }

  captureAttribution()

  const eventParams = {
    event_name: params.eventName,
    theme: params.theme,
    theme_version: params.themeVersion,
    resolver_version: params.resolverVersion,
    source_page: window.location.pathname,
    page_url: window.location.href,
    step: params.step,
    question_id: params.questionId ?? '',
    answer_id: params.answerId ?? '',
    result_key: params.resultKey ?? '',
    result_type: params.resultType ?? '',
    budget_fit: params.budgetFit ?? '',
    modifier_ids: params.modifierIds?.join(',') ?? '',
    cta_id: params.ctaId ?? '',
    cta_kind: params.ctaKind ?? '',
    cta_label: params.ctaLabel ?? '',
    transport_type: 'beacon',
    ...getCampaignAttribution(),
  }

  window.gtag?.('event', `specsy_${params.eventName}`, eventParams)
  window.dataLayer?.push?.({
    event: `specsy_${params.eventName}`,
    ...eventParams,
  })
  recordDiagnosisEventLocally(eventParams)
}

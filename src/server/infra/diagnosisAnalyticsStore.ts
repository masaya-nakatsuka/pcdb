import { getUpstashRedis } from './upstashRedis'
import type { BudgetFit, DiagnosisCtaKind, DiagnosisThemeId } from '@/lib/diagnosis'

const KEY_PREFIX = 'specsy:diagnosis_analytics'
const RECENT_EVENT_LIMIT = 10000
const RECENT_KEY = `${KEY_PREFIX}:recent`
const TOTAL_KEY = `${KEY_PREFIX}:total`
const EVENT_COUNTS_KEY = `${KEY_PREFIX}:event_counts`
const THEME_COUNTS_KEY = `${KEY_PREFIX}:theme_counts`
const RESULT_COUNTS_KEY = `${KEY_PREFIX}:result_counts`
const CTA_COUNTS_KEY = `${KEY_PREFIX}:cta_counts`
const DAY_COUNTS_KEY = `${KEY_PREFIX}:day_counts`

export interface DiagnosisEventInput {
  event_name: string
  theme: DiagnosisThemeId | string
  theme_version?: string
  resolver_version?: string
  source_page?: string
  page_url?: string
  step?: number
  question_id?: string
  answer_id?: string
  result_key?: string
  result_type?: string
  budget_fit?: BudgetFit | string
  modifier_ids?: string
  cta_id?: string
  cta_kind?: DiagnosisCtaKind | string
  cta_label?: string
  entry_page_url?: string
  entry_referrer?: string
  first_seen_at?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  utm_id?: string
}

export interface StoredDiagnosisEvent extends DiagnosisEventInput {
  id: string
  occurred_at: string
  occurred_day: string
  referrer: string
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

function normalizeDiagnosisEvent(input: DiagnosisEventInput, referrer: string): StoredDiagnosisEvent {
  const now = new Date()

  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`,
    occurred_at: now.toISOString(),
    occurred_day: formatJstDay(now),
    event_name: safeText(input.event_name, 80),
    theme: safeText(input.theme, 80) || 'unknown',
    theme_version: safeText(input.theme_version, 80),
    resolver_version: safeText(input.resolver_version, 120),
    source_page: safeText(input.source_page, 200),
    page_url: safeText(input.page_url, 700),
    step: safeNumber(input.step),
    question_id: safeText(input.question_id, 120),
    answer_id: safeText(input.answer_id, 120),
    result_key: safeText(input.result_key, 120),
    result_type: safeText(input.result_type, 120),
    budget_fit: safeText(input.budget_fit, 40),
    modifier_ids: safeText(input.modifier_ids, 400),
    cta_id: safeText(input.cta_id, 120),
    cta_kind: safeText(input.cta_kind, 80),
    cta_label: safeText(input.cta_label, 200),
    entry_page_url: safeText(input.entry_page_url, 700),
    entry_referrer: safeText(input.entry_referrer, 700),
    first_seen_at: safeText(input.first_seen_at, 80),
    utm_source: safeText(input.utm_source, 120),
    utm_medium: safeText(input.utm_medium, 120),
    utm_campaign: safeText(input.utm_campaign, 160),
    utm_content: safeText(input.utm_content, 180),
    utm_term: safeText(input.utm_term, 180),
    utm_id: safeText(input.utm_id, 180),
    referrer: safeText(referrer, 700),
  }
}

export async function recordDiagnosisEvent(input: DiagnosisEventInput, referrer: string): Promise<void> {
  const event = normalizeDiagnosisEvent(input, referrer)
  if (!event.event_name) {
    throw new Error('event_name is required')
  }

  const resultKey = event.result_key ? `${event.theme}:${event.result_key}:${event.budget_fit ?? ''}` : ''
  const ctaKey = event.cta_id ? `${event.theme}:${event.cta_kind ?? ''}:${event.cta_id}` : ''

  const commands: string[][] = [
    ['LPUSH', RECENT_KEY, JSON.stringify(event)],
    ['LTRIM', RECENT_KEY, '0', (RECENT_EVENT_LIMIT - 1).toString()],
    ['INCR', TOTAL_KEY],
    ['HINCRBY', EVENT_COUNTS_KEY, event.event_name, '1'],
    ['HINCRBY', THEME_COUNTS_KEY, event.theme, '1'],
    ['HINCRBY', DAY_COUNTS_KEY, event.occurred_day, '1'],
  ]

  if (resultKey) {
    commands.push(['HINCRBY', RESULT_COUNTS_KEY, resultKey, '1'])
  }

  if (ctaKey) {
    commands.push(['HINCRBY', CTA_COUNTS_KEY, ctaKey, '1'])
  }

  await getUpstashRedis().pipeline(commands)
}

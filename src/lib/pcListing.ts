export type PcListingType = 'new' | 'used' | 'all'

export interface PcListingLike {
  name?: string | null
  brand?: string | null
  condition?: string | null
  item_condition?: string | null
  product_condition?: string | null
  condition_label?: string | null
  availability?: string | null
  is_used?: boolean | null
  is_refurbished?: boolean | null
}

const usedKeywords = [
  '中古',
  '整備済',
  '整備品',
  '再生品',
  '再整備',
  'リファービッシュ',
  'リファビッシュ',
  'アウトレット',
  '展示品',
  '開封済',
  '訳あり',
  'used',
  'pre-owned',
  'preowned',
  'second hand',
  'open box',
  'open-box',
  'refurbished',
  'renewed',
  'amazon renewed',
]

const newConditionKeywords = ['new', '新品']
const usedConditionKeywords = [...usedKeywords, 'like new', 'very good', 'good', 'acceptable', '良い']

function includesAnyKeyword(value: string, keywords: string[]): boolean {
  const normalizedValue = value.toLowerCase()
  return keywords.some((keyword) => normalizedValue.includes(keyword.toLowerCase()))
}

function conditionTextOf(pc: PcListingLike): string {
  return [
    pc.condition,
    pc.item_condition,
    pc.product_condition,
    pc.condition_label,
    pc.availability,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
}

export function isUsedPc(pc: PcListingLike): boolean {
  if (pc.is_used || pc.is_refurbished) {
    return true
  }

  const conditionText = conditionTextOf(pc)
  if (conditionText) {
    if (includesAnyKeyword(conditionText, usedConditionKeywords)) {
      return true
    }

    if (includesAnyKeyword(conditionText, newConditionKeywords)) {
      return false
    }
  }

  return includesAnyKeyword([pc.brand, pc.name].filter(Boolean).join(' '), usedKeywords)
}

export function filterPcsByListing<T extends PcListingLike>(
  pcs: T[],
  listing: PcListingType = 'new'
): T[] {
  if (listing === 'all') {
    return pcs
  }

  return pcs.filter((pc) => (listing === 'used' ? isUsedPc(pc) : !isUsedPc(pc)))
}

export function parsePcListingType(value: string | null | undefined): PcListingType {
  if (value === 'used' || value === '中古') {
    return 'used'
  }

  if (value === 'all') {
    return 'all'
  }

  return 'new'
}

export type PcDeviceCategory = 'notebook_pc' | 'all' | 'mini_pc' | 'desktop_pc'

export interface PcDeviceLike {
  form_factor?: string | null
  brand?: string | null
  name?: string | null
  display_size?: number | null
}

const miniPcKeywords = [
  'ミニpc',
  'mini pc',
  'minipc',
  '小型pc',
  '小型パソコン',
  'nuc',
  'beelink',
  'gmktec',
  'minisforum',
  'geekom',
  'acemagic',
  'bosgame',
  'nipogi',
  'trigkey',
]

const desktopKeywords = [
  'デスクトップpc',
  'デスクトップパソコン',
  'タワーpc',
  'タワー型',
  'desktop pc',
  'tower pc',
]

function normalizedText(value: string | null | undefined): string {
  return (value ?? '').toLowerCase()
}

function includesAnyKeyword(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword.toLowerCase()))
}

function productTextOf(pc: PcDeviceLike): string {
  return [pc.brand, pc.name].filter(Boolean).join(' ').toLowerCase()
}

export function isMiniPc(pc: PcDeviceLike): boolean {
  const formFactor = normalizedText(pc.form_factor).replace(/[\s_-]/g, '')
  if (formFactor === 'minipc') {
    return true
  }

  return includesAnyKeyword(productTextOf(pc), miniPcKeywords)
}

export function isDesktopPc(pc: PcDeviceLike): boolean {
  if (isMiniPc(pc)) {
    return false
  }

  const formFactor = normalizedText(pc.form_factor)
  if (formFactor.includes('desktop')) {
    return true
  }

  if (pc.display_size) {
    return false
  }

  return includesAnyKeyword(productTextOf(pc), desktopKeywords)
}

export function isNotebookPc(pc: PcDeviceLike): boolean {
  return !isMiniPc(pc) && !isDesktopPc(pc)
}

export function filterPcsByDeviceCategory<T extends PcDeviceLike>(
  pcs: T[],
  device: PcDeviceCategory = 'all'
): T[] {
  if (device === 'all') {
    return pcs
  }

  if (device === 'notebook_pc') {
    return pcs.filter(isNotebookPc)
  }

  return pcs.filter((pc) => (device === 'mini_pc' ? isMiniPc(pc) : isDesktopPc(pc)))
}

export function parsePcDeviceCategory(
  value: string | null | undefined,
  fallback: PcDeviceCategory = 'notebook_pc'
): PcDeviceCategory {
  const normalized = normalizedText(value)

  if (!normalized) {
    return fallback
  }

  if (normalized === 'notebook_pc' || normalized === 'notebook-pc' || normalized === 'notebook' || normalized === 'laptop') {
    return 'notebook_pc'
  }

  if (normalized === 'all') {
    return 'all'
  }

  if (normalized === 'mini_pc' || normalized === 'mini-pc' || normalized === 'minipc') {
    return 'mini_pc'
  }

  if (normalized === 'desktop_pc' || normalized === 'desktop-pc' || normalized === 'desktop') {
    return 'desktop_pc'
  }

  return fallback
}

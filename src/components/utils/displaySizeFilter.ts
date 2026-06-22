import type { ClientPcWithCpuSpec } from '../types'

export interface DisplaySizeFilterOption {
  value: string
  label: string
}

const DISPLAY_SIZE_RANGE_OPTIONS: DisplaySizeFilterOption[] = [
  { value: 'range:0:12.99', label: '12インチ台以下' },
  { value: 'range:13:14.99', label: '13〜14インチ台' },
  { value: 'range:15:16.99', label: '15〜16インチ台' },
  { value: 'range:17:99', label: '17インチ以上' },
]

export function getInitialDisplaySizeFilter(defaultMaxDisplaySize?: number): string {
  return defaultMaxDisplaySize ? `max:${defaultMaxDisplaySize}` : 'all'
}

export function matchesDisplaySizeFilter(
  pc: ClientPcWithCpuSpec,
  displaySizeFilter: string
): boolean {
  if (displaySizeFilter === 'all') {
    return true
  }

  if (typeof pc.display_size !== 'number') {
    return false
  }

  if (displaySizeFilter.startsWith('max:')) {
    const limit = Number(displaySizeFilter.replace('max:', ''))
    return pc.display_size <= limit
  }

  if (displaySizeFilter.startsWith('range:')) {
    const [, minValue, maxValue] = displaySizeFilter.split(':')
    const min = Number(minValue)
    const max = Number(maxValue)
    return pc.display_size >= min && pc.display_size <= max
  }

  const exactSize = Number(displaySizeFilter)
  return pc.display_size === exactSize
}

export function getDisplaySizeFilterOptions(
  pcs: ClientPcWithCpuSpec[],
  defaultMaxDisplaySize?: number
): DisplaySizeFilterOption[] {
  const options = DISPLAY_SIZE_RANGE_OPTIONS.filter((option) =>
    pcs.some((pc) => matchesDisplaySizeFilter(pc, option.value))
  )

  if (!defaultMaxDisplaySize) {
    return options
  }

  const defaultMaxOption = {
    value: `max:${defaultMaxDisplaySize}`,
    label: `${defaultMaxDisplaySize}インチ以下`,
  }

  return [defaultMaxOption, ...options.filter((option) => option.value !== defaultMaxOption.value)]
}

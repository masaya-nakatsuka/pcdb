import type { ClientPcWithCpuSpec } from '../types'

interface SearchParamLike {
  get(name: string): string | null
}

export function normalizePcSearchQuery(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getPcSearchQueryFromSearchParams(searchParams: SearchParamLike): string {
  return (searchParams.get('q') ?? '').trim().slice(0, 80)
}

export function matchesPcSearchQuery(pc: ClientPcWithCpuSpec, query: string): boolean {
  const normalizedQuery = normalizePcSearchQuery(query)

  if (!normalizedQuery) {
    return true
  }

  const haystack = [
    pc.brand,
    pc.name,
    pc.cpu,
    pc.gpu,
    pc.gpu_class,
    pc.form_factor,
    typeof pc.display_size === 'number' ? `${pc.display_size}インチ ${pc.display_size}` : '',
    typeof pc.ram === 'number' ? `${pc.ram}gb ${pc.ram}g メモリ` : '',
    typeof pc.rom === 'number' ? `${pc.rom}gb ${pc.rom}g ssd` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return normalizedQuery.split(' ').every((term) => haystack.includes(term))
}

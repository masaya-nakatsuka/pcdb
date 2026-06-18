export interface PcSearchUrlParams {
  path: string
  query?: string
  preset?: string
}

export function buildPcSearchUrl({ path, query = '', preset = '' }: PcSearchUrlParams): string {
  const params = new URLSearchParams()
  const normalizedQuery = query.trim().replace(/\s+/g, ' ').slice(0, 80)
  const normalizedPreset = preset.trim()

  if (normalizedQuery) {
    params.set('q', normalizedQuery)
  }

  if (normalizedPreset) {
    params.set('preset', normalizedPreset)
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

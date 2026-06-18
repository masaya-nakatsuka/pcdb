import type { ClientPcWithCpuSpec } from '../types'
import { getComparablePrice } from './pcInsights'

export type PcQuickFilterKey =
  | 'budget70'
  | 'practical'
  | 'lightweight'
  | 'workSize'
  | 'battery4h'
  | 'dedicatedGpu'

export interface PcQuickFilterDefinition {
  key: PcQuickFilterKey
  label: string
  description: string
}

export interface PcQuickFilterPreset {
  key: string
  label: string
  description: string
  filters: PcQuickFilterKey[]
}

export const pcQuickFilterDefinitions: PcQuickFilterDefinition[] = [
  {
    key: 'budget70',
    label: '7万円以下',
    description: '低価格でも候補に残しやすい価格帯',
  },
  {
    key: 'practical',
    label: '16GB/512GB',
    description: 'メインPCとして見やすい実用構成',
  },
  {
    key: 'lightweight',
    label: '1.3kg以下',
    description: '毎日持ち運びやすい重さ',
  },
  {
    key: 'workSize',
    label: '14型前後',
    description: '小さすぎず作業しやすい画面',
  },
  {
    key: 'battery4h',
    label: 'Excel 4h以上',
    description: '軽作業の駆動時間を確保',
  },
  {
    key: 'dedicatedGpu',
    label: 'GPU強め',
    description: 'ゲームや編集で見たいGPU性能',
  },
]

export const pcQuickFilterPresets: PcQuickFilterPreset[] = [
  {
    key: 'budgetMain',
    label: '低価格メイン',
    description: '7万円以下で実用構成を満たす候補',
    filters: ['budget70', 'practical'],
  },
  {
    key: 'mobileMain',
    label: '持ち運びメイン',
    description: '軽さ、実用構成、軽作業時間をまとめて確認',
    filters: ['practical', 'lightweight', 'battery4h'],
  },
  {
    key: 'cafeWork',
    label: 'カフェ作業',
    description: '14型前後、軽さ、実用構成を重視',
    filters: ['practical', 'lightweight', 'workSize'],
  },
  {
    key: 'creativeGpu',
    label: 'GPU重視',
    description: 'ゲームや編集向けにGPU性能と実用構成を見る',
    filters: ['practical', 'dedicatedGpu'],
  },
]

export function getPcQuickFilterLabel(key: PcQuickFilterKey): string {
  return pcQuickFilterDefinitions.find((definition) => definition.key === key)?.label ?? key
}

export function isPcQuickFilterKey(value: string): value is PcQuickFilterKey {
  return pcQuickFilterDefinitions.some((definition) => definition.key === value)
}

interface SearchParamLike {
  get(name: string): string | null
}

export function getPcQuickFiltersFromSearchParams(searchParams: SearchParamLike): PcQuickFilterKey[] {
  const presetKey = searchParams.get('preset')
  const preset = pcQuickFilterPresets.find((item) => item.key === presetKey)

  if (preset) {
    return [...preset.filters]
  }

  const rawFilters = searchParams.get('filters')
  if (!rawFilters) {
    return []
  }

  const seen = new Set<PcQuickFilterKey>()
  rawFilters.split(',').forEach((value) => {
    const normalizedValue = value.trim()
    if (isPcQuickFilterKey(normalizedValue)) {
      seen.add(normalizedValue)
    }
  })

  return Array.from(seen)
}

export function matchesPcQuickFilter(pc: ClientPcWithCpuSpec, key: PcQuickFilterKey): boolean {
  const price = getComparablePrice(pc)

  switch (key) {
    case 'budget70':
      return typeof price === 'number' && price <= 70000
    case 'practical':
      return (pc.ram ?? 0) >= 16 && (pc.rom ?? 0) >= 512
    case 'lightweight':
      return typeof pc.weight === 'number' && pc.weight <= 1300
    case 'workSize':
      return typeof pc.display_size === 'number' && pc.display_size >= 13.8 && pc.display_size <= 14.5
    case 'battery4h':
      return typeof pc.estimatedBatteryLifeHours === 'number' && pc.estimatedBatteryLifeHours >= 4
    case 'dedicatedGpu':
      return Boolean(pc.has_dgpu) || (pc.gpu_score ?? 0) >= 5
    default:
      return true
  }
}

export function applyPcQuickFilters(
  pcs: ClientPcWithCpuSpec[],
  activeFilters: PcQuickFilterKey[]
): ClientPcWithCpuSpec[] {
  if (activeFilters.length === 0) {
    return pcs
  }

  return pcs.filter((pc) => activeFilters.every((filter) => matchesPcQuickFilter(pc, filter)))
}

import { CpuSpec } from '@/server/domain/models/cpu'

export const cpuPowerMap: Record<string, CpuSpec> = {
  'Celeron J3455': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 1.5,
    boostClockGHz: 2.3,
    tdpW: 10,
    passmarkScore: 2246,
  },
  'Celeron N4020': {  // OK
    cores: 2,
    threads: 2,
    baseClockGHz: 1.1,
    boostClockGHz: 2.8,
    tdpW: 6,
    passmarkScore: 1543,
  },
  'Celeron N5095': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 2.0,
    boostClockGHz: 2.9,
    tdpW: 15,
    passmarkScore: 4042,
  },
  'Celeron N5105': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 2.0,
    boostClockGHz: 2.9,
    tdpW: 10,
    passmarkScore: 4018,
  },
  'Core m3-8100Y': {  // OK
    cores: 2,
    threads: 4,
    baseClockGHz: 1.1,
    boostClockGHz: 3.4,
    tdpW: 5,
    passmarkScore: 2752,
  },
  'N100': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 0.7,
    boostClockGHz: 3.4,
    tdpW: 6,
    passmarkScore: 5390,
  },
  'N150': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 0.8,
    boostClockGHz: 3.6,
    tdpW: 6,
    passmarkScore: 5482,
  },
  'N95': {  // OK
    cores: 4,
    threads: 4,
    baseClockGHz: 1.7,
    boostClockGHz: 3.4,
    tdpW: 15,
    passmarkScore: 5344,
  },
  'N97': {
    cores: 4,
    threads: 4,
    baseClockGHz: 2.0,
    boostClockGHz: 3.6,
    tdpW: 12,
    passmarkScore: 5900,
  },
  'N200': {
    cores: 4,
    threads: 4,
    baseClockGHz: 1.0,
    boostClockGHz: 3.7,
    tdpW: 6,
    passmarkScore: 5700,
  },
  'Core i3-6100U': {
    cores: 2,
    threads: 4,
    baseClockGHz: 2.3,
    boostClockGHz: 2.3,
    tdpW: 15,
    passmarkScore: 2621,
  },
  'Core i5-8210Y': {
    cores: 2,
    threads: 4,
    baseClockGHz: 1.6,
    boostClockGHz: 3.6,
    tdpW: 7,
    passmarkScore: 2720,
  },
  'Core i7-5500U': {
    cores: 2,
    threads: 4,
    baseClockGHz: 2.4,
    boostClockGHz: 3.0,
    tdpW: 15,
    passmarkScore: 2804,
  },
  'Core i5-1334U': {
    cores: 10,
    threads: 12,
    baseClockGHz: 1.3,
    boostClockGHz: 4.6,
    tdpW: 15,
    passmarkScore: 13083,
  },
  'Core Ultra 5 125H': {
    cores: 14,
    threads: 18,
    baseClockGHz: 3.3,
    boostClockGHz: 4.5,
    tdpW: 28,
    passmarkScore: 20259,
  },
  'Ryzen 5 3500U': {
    cores: 4,
    threads: 8,
    baseClockGHz: 2.1,
    boostClockGHz: 3.7,
    tdpW: 15,
    passmarkScore: 6801,
  },
  'Ryzen 5 7520U': {
    cores: 4,
    threads: 8,
    baseClockGHz: 2.8,
    boostClockGHz: 4.3,
    tdpW: 15,
    passmarkScore: 8947,
  },
  'Ryzen 5 40': {
    cores: 4,
    threads: 8,
    baseClockGHz: 2.8,
    boostClockGHz: 4.3,
    tdpW: 15,
    passmarkScore: 8947,
  },
  'Ryzen 5 7530U': {
    cores: 6,
    threads: 12,
    baseClockGHz: 2.0,
    boostClockGHz: 4.5,
    tdpW: 15,
    passmarkScore: 15075,
  },
  'Ryzen 7 7730U': {
    cores: 8,
    threads: 16,
    baseClockGHz: 2.0,
    boostClockGHz: 4.5,
    tdpW: 15,
    passmarkScore: 17283,
  },
  'Ryzen 7 7735HS': {
    cores: 8,
    threads: 16,
    baseClockGHz: 3.2,
    boostClockGHz: 4.8,
    tdpW: 35,
    passmarkScore: 22349,
  },
  'Ryzen 7 170': {
    cores: 8,
    threads: 16,
    baseClockGHz: 3.2,
    boostClockGHz: 4.75,
    tdpW: 35,
    passmarkScore: 21485,
  },
  'Ryzen 7 8840HS': {
    cores: 8,
    threads: 16,
    baseClockGHz: 3.3,
    boostClockGHz: 5.1,
    tdpW: 28,
    passmarkScore: 24807,
  },
  'Ryzen 7 8845HS': {
    cores: 8,
    threads: 16,
    baseClockGHz: 3.8,
    boostClockGHz: 5.1,
    tdpW: 45,
    passmarkScore: 28366,
  },
  // Amazonの検索結果から詳細型番を抽出できない場合の代表値。
  // 1件の未知CPUで一覧API全体が落ちないよう、保守的なカテゴリ値を持つ。
  'Core i3': {
    cores: 4,
    threads: 8,
    baseClockGHz: 1.2,
    boostClockGHz: 4.0,
    tdpW: 15,
    passmarkScore: 6000,
  },
  'Core i5': {
    cores: 8,
    threads: 12,
    baseClockGHz: 1.3,
    boostClockGHz: 4.4,
    tdpW: 15,
    passmarkScore: 10000,
  },
  'Core i7': {
    cores: 10,
    threads: 12,
    baseClockGHz: 1.5,
    boostClockGHz: 4.7,
    tdpW: 15,
    passmarkScore: 12000,
  },
  'Core Ultra 5': {
    cores: 14,
    threads: 18,
    baseClockGHz: 1.2,
    boostClockGHz: 4.5,
    tdpW: 28,
    passmarkScore: 18000,
  },
  'Core Ultra 7': {
    cores: 16,
    threads: 22,
    baseClockGHz: 1.4,
    boostClockGHz: 4.8,
    tdpW: 28,
    passmarkScore: 22000,
  },
  'Core Ultra 9': {
    cores: 16,
    threads: 22,
    baseClockGHz: 1.6,
    boostClockGHz: 5.1,
    tdpW: 45,
    passmarkScore: 26000,
  },
  'Ryzen 5': {
    cores: 6,
    threads: 12,
    baseClockGHz: 2.0,
    boostClockGHz: 4.3,
    tdpW: 15,
    passmarkScore: 11000,
  },
  'Ryzen 7': {
    cores: 8,
    threads: 16,
    baseClockGHz: 2.0,
    boostClockGHz: 4.7,
    tdpW: 15,
    passmarkScore: 15000,
  },
}

const cpuFallbackKeys: Array<[RegExp, string]> = [
  [/Core\s*Ultra\s*9/i, 'Core Ultra 9'],
  [/Core\s*Ultra\s*7/i, 'Core Ultra 7'],
  [/Core\s*Ultra\s*5/i, 'Core Ultra 5'],
  [/(?:Core\s*)?i9/i, 'Core i7'],
  [/(?:Core\s*)?i7/i, 'Core i7'],
  [/(?:Core\s*)?i5/i, 'Core i5'],
  [/(?:Core\s*)?i3/i, 'Core i3'],
  [/Ryzen\s*9/i, 'Ryzen 7'],
  [/Ryzen\s*7/i, 'Ryzen 7'],
  [/Ryzen\s*5/i, 'Ryzen 5'],
]

export function resolveCpuSpec(cpuName: string | null | undefined): CpuSpec | null {
  if (!cpuName) {
    return null
  }

  const normalizedCpuName = cpuName
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/\bCore\s+i([3579])\s+(\d)/i, 'Core i$1-$2')
    .replace(/\bIntel\s+N(\d{2,3})\b/i, 'N$1')
    .trim()

  const exactSpec = cpuPowerMap[normalizedCpuName]
  if (exactSpec) {
    return exactSpec
  }

  const fallback = cpuFallbackKeys.find(([pattern]) => pattern.test(normalizedCpuName))
  return fallback ? cpuPowerMap[fallback[1]] ?? null : null
}

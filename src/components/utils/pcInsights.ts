import { ClientPcWithCpuSpec } from '../types'

export function getComparablePrice(pc: ClientPcWithCpuSpec): number | null {
  return pc.price ?? pc.real_price ?? null
}

export function getProductLink(pc: ClientPcWithCpuSpec): string | null {
  return pc.af_url || pc.url || null
}

export function formatCurrency(price: number | null | undefined): string {
  return typeof price === 'number' ? `¥${price.toLocaleString('ja-JP')}` : '-'
}

export function formatWeight(weight: number | null | undefined): string {
  return typeof weight === 'number' ? `${weight.toLocaleString('ja-JP')}g` : '-'
}

export function formatDisplaySize(displaySize: number | null | undefined): string {
  return typeof displaySize === 'number' ? `${displaySize}インチ` : '-'
}

export function formatStorageSize(sizeGb: number | null | undefined): string {
  return typeof sizeGb === 'number' ? `${sizeGb.toLocaleString('ja-JP')}GB` : '-'
}

export function getPcHighlights(pc: ClientPcWithCpuSpec, limit = 4): string[] {
  const highlights: string[] = []
  const price = getComparablePrice(pc)

  if (typeof price === 'number') {
    if (price <= 50000) {
      highlights.push('5万円以下')
    } else if (price <= 70000) {
      highlights.push('7万円以下')
    } else if (price <= 100000) {
      highlights.push('10万円以下')
    }
  }

  if ((pc.ram ?? 0) >= 16 && (pc.rom ?? 0) >= 512) {
    highlights.push('16GB/512GB')
  } else if ((pc.ram ?? 0) >= 16) {
    highlights.push('メモリ16GB')
  } else if ((pc.rom ?? 0) >= 512) {
    highlights.push('SSD512GB')
  }

  if (typeof pc.weight === 'number') {
    if (pc.weight <= 1000) {
      highlights.push('1kg以下')
    } else if (pc.weight <= 1300) {
      highlights.push('1.3kg以下')
    }
  }

  if (typeof pc.display_size === 'number') {
    if (pc.display_size <= 11) {
      highlights.push('11インチ以下')
    } else if (pc.display_size >= 13.8 && pc.display_size <= 14.5) {
      highlights.push('14インチ前後')
    } else if (pc.display_size >= 15 && pc.display_size <= 16.5) {
      highlights.push('大画面')
    }
  }

  if (typeof pc.estimatedBatteryLifeHours === 'number') {
    if (pc.estimatedBatteryLifeHours >= 6) {
      highlights.push('Excel 6h目安')
    } else if (pc.estimatedBatteryLifeHours >= 4) {
      highlights.push('Excel 4h目安')
    }
  }

  if (pc.has_dgpu) {
    highlights.push('専用GPU')
  } else if ((pc.gpu_score ?? 0) >= 5) {
    highlights.push('GPU強め')
  }

  if (highlights.length === 0 && typeof pc.pcScore === 'number') {
    highlights.push(`スコア${pc.pcScore}点`)
  }

  return highlights.slice(0, limit)
}

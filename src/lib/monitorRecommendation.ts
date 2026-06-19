import type { Monitor } from '../server/domain/models/monitor'

export type MonitorUsage = 'work' | 'gaming' | 'creative' | 'usb_c'

export const monitorUsageOptions: Array<{
  value: MonitorUsage
  label: string
  description: string
}> = [
  {
    value: 'work',
    label: '仕事用',
    description: '27インチ前後、WQHD以上、価格、USB-Cのバランスで比較します。',
  },
  {
    value: 'gaming',
    label: 'ゲーム用',
    description: '高リフレッシュレート、見やすさ、価格のバランスで比較します。',
  },
  {
    value: 'creative',
    label: '制作向け',
    description: '解像度、パネル、画面サイズを重視して比較します。',
  },
  {
    value: 'usb_c',
    label: 'USB-C重視',
    description: 'USB-C給電、解像度、価格のバランスで比較します。',
  },
]

export interface MonitorRecommendation {
  monitor: Monitor
  score: number
  highlights: string[]
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function weightedScore(parts: Array<[number, number]>): number {
  const totalWeight = parts.reduce((sum, [, weight]) => sum + weight, 0)
  const total = parts.reduce((sum, [score, weight]) => sum + score * weight, 0)
  return Math.round(total / totalWeight)
}

function getPrice(monitor: Monitor): number | null {
  return monitor.real_price ?? monitor.price ?? null
}

function scorePrice(price: number | null): number {
  if (price == null) return 55
  if (price <= 20000) return 100
  if (price <= 30000) return 88
  if (price <= 45000) return 74
  if (price <= 65000) return 58
  if (price <= 90000) return 42
  return 28
}

function scoreSize(size: number | null, ideal: number): number {
  if (size == null) return 50
  return clampScore(100 - Math.abs(size - ideal) * 12)
}

function scoreRefreshRate(refreshRate: number | null, usage: MonitorUsage): number {
  if (refreshRate == null) return 45

  if (usage === 'gaming') {
    if (refreshRate >= 240) return 100
    if (refreshRate >= 165) return 92
    if (refreshRate >= 144) return 84
    if (refreshRate >= 100) return 62
    return 38
  }

  if (refreshRate >= 100) return 88
  if (refreshRate >= 75) return 76
  if (refreshRate >= 60) return 66
  return 45
}

function scoreResolution(resolution: string | null, usage: MonitorUsage): number {
  if (!resolution) return 48

  const normalized = resolution.toLowerCase()
  const is4k = normalized.includes('4k') || normalized.includes('3840') || normalized.includes('2160')
  const isWqhd = normalized.includes('wqhd') || normalized.includes('qhd') || normalized.includes('2560') || normalized.includes('1440')
  const isFhd = normalized.includes('fhd') || normalized.includes('full hd') || normalized.includes('1920') || normalized.includes('1080')

  if (is4k) return usage === 'gaming' ? 82 : 100
  if (isWqhd) return usage === 'creative' ? 84 : 92
  if (isFhd) return usage === 'gaming' ? 70 : 58

  return 55
}

function scorePanel(panelType: string | null, usage: MonitorUsage): number {
  if (!panelType) return 55

  const normalized = panelType.toLowerCase()
  if (normalized.includes('oled')) return 100
  if (normalized.includes('ips')) return usage === 'gaming' ? 86 : 94
  if (normalized.includes('va')) return usage === 'creative' ? 68 : 78
  if (normalized.includes('tn')) return usage === 'gaming' ? 66 : 42

  return 58
}

function scoreUsbC(hasUsbC: boolean | null, powerDelivery: number | null): number {
  if (!hasUsbC) return 20
  if ((powerDelivery ?? 0) >= 90) return 100
  if ((powerDelivery ?? 0) >= 65) return 88
  if ((powerDelivery ?? 0) >= 45) return 72
  return 62
}

function scoreMonitor(monitor: Monitor, usage: MonitorUsage): number {
  const priceScore = scorePrice(getPrice(monitor))
  const usbCScore = scoreUsbC(monitor.has_usb_c, monitor.usb_c_power_delivery_w)

  if (usage === 'gaming') {
    return weightedScore([
      [scoreRefreshRate(monitor.refresh_rate_hz, usage), 0.35],
      [scoreResolution(monitor.resolution, usage), 0.16],
      [scorePanel(monitor.panel_type, usage), 0.14],
      [scoreSize(monitor.size_inch, 27), 0.1],
      [priceScore, 0.25],
    ])
  }

  if (usage === 'creative') {
    return weightedScore([
      [scoreResolution(monitor.resolution, usage), 0.35],
      [scorePanel(monitor.panel_type, usage), 0.24],
      [scoreSize(monitor.size_inch, 27), 0.16],
      [usbCScore, 0.1],
      [priceScore, 0.15],
    ])
  }

  if (usage === 'usb_c') {
    return weightedScore([
      [usbCScore, 0.4],
      [scoreResolution(monitor.resolution, usage), 0.2],
      [scoreSize(monitor.size_inch, 27), 0.14],
      [scorePanel(monitor.panel_type, usage), 0.1],
      [priceScore, 0.16],
    ])
  }

  return weightedScore([
    [scoreSize(monitor.size_inch, 27), 0.2],
    [scoreResolution(monitor.resolution, usage), 0.24],
    [usbCScore, 0.18],
    [scorePanel(monitor.panel_type, usage), 0.14],
    [priceScore, 0.24],
  ])
}

function buildHighlights(monitor: Monitor): string[] {
  const highlights: string[] = []

  if (monitor.resolution) {
    highlights.push(monitor.resolution)
  }
  if ((monitor.refresh_rate_hz ?? 0) >= 144) {
    highlights.push(`${monitor.refresh_rate_hz}Hz`)
  }
  if (monitor.panel_type) {
    highlights.push(monitor.panel_type)
  }
  if (monitor.has_usb_c) {
    highlights.push(monitor.usb_c_power_delivery_w ? `USB-C ${monitor.usb_c_power_delivery_w}W` : 'USB-C')
  }

  return highlights.slice(0, 3)
}

export function parseMonitorUsage(value: string | string[] | undefined): MonitorUsage {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (
    rawValue === 'work' ||
    rawValue === 'gaming' ||
    rawValue === 'creative' ||
    rawValue === 'usb_c'
  ) {
    return rawValue
  }

  return 'work'
}

export function getMonitorUsageOption(usage: MonitorUsage) {
  return monitorUsageOptions.find((option) => option.value === usage) ?? monitorUsageOptions[0]
}

export function rankMonitors(monitors: Monitor[], usage: MonitorUsage): MonitorRecommendation[] {
  return monitors
    .map((monitor) => ({
      monitor,
      score: scoreMonitor(monitor, usage),
      highlights: buildHighlights(monitor),
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score

      const aPrice = getPrice(a.monitor) ?? Number.MAX_SAFE_INTEGER
      const bPrice = getPrice(b.monitor) ?? Number.MAX_SAFE_INTEGER
      if (aPrice !== bPrice) return aPrice - bPrice

      return a.monitor.id - b.monitor.id
    })
}

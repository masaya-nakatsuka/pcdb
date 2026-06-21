import type { Tablet } from '../server/domain/models/tablet'

export interface TabletRecommendation {
  tablet: Tablet
  score: number
  highlights: string[]
}

function priceValueScore(price: number | null): number {
  if (price == null) {
    return 6
  }

  if (price <= 25000) return 15
  if (price <= 40000) return 13
  if (price <= 65000) return 10
  if (price <= 95000) return 7
  if (price <= 140000) return 4
  return 2
}

function ramScore(ramGb: number | null): number {
  if (ramGb == null) return 4
  if (ramGb >= 12) return 16
  if (ramGb >= 8) return 14
  if (ramGb >= 6) return 11
  if (ramGb >= 4) return 8
  return 4
}

function romScore(romGb: number | null): number {
  if (romGb == null) return 3
  if (romGb >= 512) return 14
  if (romGb >= 256) return 12
  if (romGb >= 128) return 9
  if (romGb >= 64) return 6
  return 3
}

function displayScore(tablet: Tablet): number {
  const refresh = tablet.refresh_rate_hz ?? 60
  const size = tablet.display_size_inch ?? 0
  let score = 4

  if (size >= 10 && size <= 13.5) {
    score += 4
  } else if (size >= 8) {
    score += 2
  }

  if (refresh >= 120) {
    score += 5
  } else if (refresh >= 90) {
    score += 3
  }

  if (tablet.resolution && /2k|2560|2732|2800|2880|3000/i.test(tablet.resolution)) {
    score += 3
  }

  return Math.min(score, 12)
}

function batteryScore(hours: number | null): number {
  if (hours == null) return 4
  if (hours >= 14) return 12
  if (hours >= 11) return 10
  if (hours >= 9) return 8
  if (hours >= 7) return 5
  return 3
}

function buildHighlights(tablet: Tablet): string[] {
  const highlights: string[] = []

  if (tablet.soc) {
    highlights.push(tablet.soc)
  }

  if (tablet.ram_gb && tablet.rom_gb) {
    highlights.push(`${tablet.ram_gb}GB RAM / ${tablet.rom_gb}GB ROM`)
  } else if (tablet.rom_gb) {
    highlights.push(`${tablet.rom_gb}GB ROM`)
  }

  if (tablet.battery_life_hours) {
    highlights.push(`最大${tablet.battery_life_hours}時間`)
  }

  if (tablet.refresh_rate_hz && tablet.refresh_rate_hz >= 90) {
    highlights.push(`${tablet.refresh_rate_hz}Hz`)
  }

  return highlights.slice(0, 3)
}

export function rankTablets(tablets: Tablet[]): TabletRecommendation[] {
  return tablets
    .map((tablet) => {
      const price = tablet.real_price ?? tablet.price
      const socScore = Math.min(Math.max(tablet.soc_score ?? 0, 0), 35)
      const score = Math.round(
        socScore +
        ramScore(tablet.ram_gb) +
        romScore(tablet.rom_gb) +
        displayScore(tablet) +
        batteryScore(tablet.battery_life_hours) +
        priceValueScore(price)
      )

      return {
        tablet,
        score,
        highlights: buildHighlights(tablet),
      }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      const aPrice = a.tablet.real_price ?? a.tablet.price ?? Number.MAX_SAFE_INTEGER
      const bPrice = b.tablet.real_price ?? b.tablet.price ?? Number.MAX_SAFE_INTEGER
      return aPrice - bPrice
    })
}

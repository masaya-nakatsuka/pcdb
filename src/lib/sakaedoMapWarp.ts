export type SakaedoMapPoint = {
  x: number
  y: number
}

type WarpField = SakaedoMapPoint & {
  radius: number
  strength: number
}

const sakaedoWarpFields: WarpField[] = [
  { x: 535, y: 421, radius: 82, strength: 1.1 },
  { x: 527.2, y: 437.6, radius: 58, strength: 0.6 },
  { x: 375.4, y: 463.9, radius: 72, strength: 1.45 },
  { x: 379.9, y: 435, radius: 52, strength: 0.55 },
  { x: 360.3, y: 455.4, radius: 52, strength: 0.55 },
  { x: 415.9, y: 445.6, radius: 66, strength: 1.1 },
  { x: 191.1, y: 498.3, radius: 62, strength: 0.65 },
  { x: 560.9, y: 168.5, radius: 66, strength: 0.45 },
  { x: 586.9, y: 230.7, radius: 56, strength: 0.45 },
  { x: 230.3, y: 458.6, radius: 54, strength: 0.38 },
]

function formatCoordinate(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function warpSakaedoPoint(point: SakaedoMapPoint): SakaedoMapPoint {
  let x = point.x
  let y = point.y

  for (const field of sakaedoWarpFields) {
    const dx = x - field.x
    const dy = y - field.y
    const distanceSquared = dx * dx + dy * dy
    const influence = Math.exp(-distanceSquared / (2 * field.radius * field.radius)) * field.strength

    x += dx * influence
    y += dy * influence
  }

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  }
}

export function warpSakaedoPath(path: string): string {
  return path.replace(/([ML])(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_match, command: string, rawX: string, rawY: string) => {
    const point = warpSakaedoPoint({ x: Number(rawX), y: Number(rawY) })
    return `${command}${formatCoordinate(point.x)} ${formatCoordinate(point.y)}`
  })
}

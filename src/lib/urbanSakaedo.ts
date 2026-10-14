import { japanCityCartogramPaths } from './japanCityCartogramPaths'
import { japanMunicipalitySakaedoPaths } from './japanMunicipalitySakaedoPaths'

export type SakaedoCity = {
  code: string
  name: string
  shortName: string
  prefecture: string
  region: string
  didPopulationDepth: number
  commercialLandValue: number
  urbanConcentration: number
  score: number
  rank: number
  color: string
  path: string
  labelX: number
  labelY: number
  labelAnchor: 'start' | 'middle' | 'end'
}

export type SakaedoMapArea = {
  code: string
  scoreCode: string
  score: number
  color: string
  path: string
  labelX: number
  labelY: number
  area: number
  isScoredCity: boolean
  title: string
}

export const sakaedoWeights = {
  didPopulationDepth: 0.5,
  commercialLandValue: 0.4,
  urbanConcentration: 0.1,
} as const

export const sakaedoFormula =
  '体感の栄え度 = DID人口の厚み 50% + 中心商業地価 40% + 市街地集中率 10%'

export const cartogramNote =
  '通常の日本地図形状を保ったまま、全自治体の面へ体感さかえ度の色だけを載せた模式図です。市・政令市・東京23区はスコアで色を付け、町村は低彩度の面として残しています。市別の公式統計を厳密に反映したGIS解析ではなく、主要都市の暫定スコアと周辺補間による表現です。'

function calculateSakaedoScore(city: Pick<SakaedoCity, 'didPopulationDepth' | 'commercialLandValue' | 'urbanConcentration'>): number {
  const rawScore =
    city.didPopulationDepth * sakaedoWeights.didPopulationDepth +
    city.commercialLandValue * sakaedoWeights.commercialLandValue +
    city.urbanConcentration * sakaedoWeights.urbanConcentration

  return Math.round(rawScore * 10) / 10
}

function getColor(score: number): string {
  if (score >= 80) return '#a61f22'
  if (score >= 68) return '#d5503a'
  if (score >= 58) return '#e58a3d'
  if (score >= 52) return '#e8bd59'
  if (score >= 40) return '#b7d3b5'
  return '#e6efe2'
}

const scoredCities = japanCityCartogramPaths
  .map((city) => ({
    ...city,
    score: calculateSakaedoScore(city),
  }))
  .map((city) => ({
    ...city,
    color: getColor(city.score),
  }))

const rankedCodes = [...scoredCities]
  .sort((a, b) => b.score - a.score)
  .map((city) => city.code)

const scoredCityByCode = new Map(scoredCities.map((city) => [city.code, city]))

const weightedDisplayPointByScoreCode = new Map<string, { x: number; y: number; weight: number }>()

for (const path of japanMunicipalitySakaedoPaths) {
  if (!scoredCityByCode.has(path.scoreCode)) continue

  const current = weightedDisplayPointByScoreCode.get(path.scoreCode) ?? { x: 0, y: 0, weight: 0 }
  const weight = Math.max(path.area, 1)

  weightedDisplayPointByScoreCode.set(path.scoreCode, {
    x: current.x + path.labelX * weight,
    y: current.y + path.labelY * weight,
    weight: current.weight + weight,
  })
}

const displayPointByScoreCode = new Map<string, { x: number; y: number }>()

weightedDisplayPointByScoreCode.forEach((weightedPoint, code) => {
  displayPointByScoreCode.set(code, {
    x: Math.round((weightedPoint.x / weightedPoint.weight) * 10) / 10,
    y: Math.round((weightedPoint.y / weightedPoint.weight) * 10) / 10,
  })
})

export const cartogramAreas: SakaedoMapArea[] = japanMunicipalitySakaedoPaths.map((path) => {
  const scoredCity = scoredCityByCode.get(path.scoreCode)
  const score = scoredCity?.score ?? 24

  return {
    ...path,
    score,
    color: scoredCity ? getColor(score) : '#eef2e8',
    isScoredCity: Boolean(scoredCity),
    title: scoredCity ? scoredCity.name : '町村部',
  }
}).sort((a, b) => {
  if (a.isScoredCity !== b.isScoredCity) return Number(a.isScoredCity) - Number(b.isScoredCity)
  return a.score - b.score
})

export const cartogramCities: SakaedoCity[] = scoredCities.map((city) => {
  const labelPoint = displayPointByScoreCode.get(city.code) ?? { x: city.labelX, y: city.labelY }

  return {
    ...city,
    rank: rankedCodes.indexOf(city.code) + 1,
    labelX: labelPoint.x,
    labelY: labelPoint.y,
    labelAnchor: 'middle' as const,
  }
}).sort((a, b) => a.score - b.score)

export const rankedSakaedoCities = [...cartogramCities].sort((a, b) => b.score - a.score)

const alwaysLabelCodes = new Set(['13100', '27100', '23100', '14100', '40130', '01100', '04100', '34100', '47201'])

export const labeledSakaedoCities = cartogramCities.filter((city) => {
  return city.rank <= 16 || alwaysLabelCodes.has(city.code)
})

import { ServerUsageCategory as UsageCategory, ServerScoreWeights as ScoreWeights } from '../../types'

interface PcSpec {
  cpuPassmark: number
  ramGB: number
  romGB: number
  batteryLifeHours: number
  screenSizeInch: number
  deviceWeight: number
}

interface RelativeScoreWeights {
  cpuScoreWeight: number
  ramScoreWeight: number
  romScoreWeight: number
  batteryScoreWeight: number
  screenScoreWeight: number
  deviceWeightScoreWeight: number
}

/**
 * 全PCデータの相対評価に基づいてスコアを計算する
 * @param allPcSpecs 全てのPCスペックデータ
 * @param targetPcSpec 評価対象のPCスペック
 * @param category 用途カテゴリ（評価方法に影響）
 * @param scoreWeights 各項目の重み（オプショナル）
 * @returns 相対評価スコア
 */
export function calculateRelativePcScore(
  allPcSpecs: PcSpec[],
  targetPcSpec: PcSpec,
  category: UsageCategory = 'cafe',
  scoreWeights?: RelativeScoreWeights
): number {
  const defaultWeights: RelativeScoreWeights = {
    cpuScoreWeight: 1,
    ramScoreWeight: 1,
    romScoreWeight: 1,
    batteryScoreWeight: 1,
    screenScoreWeight: 1,
    deviceWeightScoreWeight: 1
  }

  const weights = scoreWeights ?? defaultWeights

  // 各項目の最小値・最大値を取得
  const cpuValues = allPcSpecs.map(pc => pc.cpuPassmark).filter(v => v > 0)
  const ramValues = allPcSpecs.map(pc => pc.ramGB).filter(v => v > 0)
  const romValues = allPcSpecs.map(pc => pc.romGB).filter(v => v > 0)
  const batteryValues = allPcSpecs.map(pc => pc.batteryLifeHours).filter(v => v > 0)
  const screenValues = allPcSpecs.map(pc => pc.screenSizeInch).filter(v => v > 0)
  const weightValues = allPcSpecs.map(pc => pc.deviceWeight).filter(v => v > 0)

  const minMax = {
    cpu: { min: Math.min(...cpuValues), max: Math.max(...cpuValues) },
    ram: { min: Math.min(...ramValues), max: Math.max(...ramValues) },
    rom: { min: Math.min(...romValues), max: Math.max(...romValues) },
    battery: { min: Math.min(...batteryValues), max: Math.max(...batteryValues) },
    screen: { min: Math.min(...screenValues), max: Math.max(...screenValues) },
    weight: { min: Math.min(...weightValues), max: Math.max(...weightValues) }
  }

  // 基本の正規化関数
  const normalizeScore = (value: number, min: number, max: number, reverse: boolean = false): number => {
    if (max === min) return 5 // 全て同じ値の場合は中央値
    const normalized = (value - min) / (max - min) * 10
    return reverse ? 10 - normalized : normalized
  }

  // 中間値を最高点とする正規化（カフェ用画面サイズ）
  const normalizeMiddleOptimal = (value: number, min: number, max: number): number => {
    if (max === min) return 5
    const mid = (min + max) / 2
    const distance = Math.abs(value - mid)
    const maxDistance = Math.max(mid - min, max - mid)
    return 10 - (distance / maxDistance) * 10
  }

  const cpuScore = normalizeScore(targetPcSpec.cpuPassmark, minMax.cpu.min, minMax.cpu.max) * weights.cpuScoreWeight
  const ramScore = normalizeScore(targetPcSpec.ramGB, minMax.ram.min, minMax.ram.max) * weights.ramScoreWeight
  const romScore = normalizeScore(targetPcSpec.romGB, minMax.rom.min, minMax.rom.max) * weights.romScoreWeight
  const batteryScore = normalizeScore(targetPcSpec.batteryLifeHours, minMax.battery.min, minMax.battery.max) * weights.batteryScoreWeight

  // 画面サイズのカテゴリ別評価
  let screenScore: number
  switch (category) {
    case 'mobile':
      // 小さいほど高スコア
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max, true) * weights.screenScoreWeight
      break
    case 'cafe':
      // 中間寄りが高スコア
      screenScore = normalizeMiddleOptimal(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max) * weights.screenScoreWeight
      break
    case 'home':
      // 大きいほど高スコア
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max) * weights.screenScoreWeight
      break
    default:
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max) * weights.screenScoreWeight
  }

  // 重量のカテゴリ別評価
  let deviceWeightScore: number
  switch (category) {
    case 'mobile':
      // 軽い方が高スコア
      deviceWeightScore = normalizeScore(targetPcSpec.deviceWeight, minMax.weight.min, minMax.weight.max, true) * weights.deviceWeightScoreWeight
      break
    case 'cafe':
      // 軽い方が少し高スコア（mobile程ではない）
      deviceWeightScore = normalizeScore(targetPcSpec.deviceWeight, minMax.weight.min, minMax.weight.max, true) * weights.deviceWeightScoreWeight * 0.7
      break
    case 'home':
      // 重量はあまり関係ない（中央値固定）
      deviceWeightScore = 5 * weights.deviceWeightScoreWeight
      break
    default:
      deviceWeightScore = normalizeScore(targetPcSpec.deviceWeight, minMax.weight.min, minMax.weight.max, true) * weights.deviceWeightScoreWeight
  }

  const totalScore = cpuScore + ramScore + romScore + batteryScore + screenScore + deviceWeightScore
  const maxPossibleScore = (weights.cpuScoreWeight + weights.ramScoreWeight + weights.romScoreWeight + weights.batteryScoreWeight + weights.screenScoreWeight + weights.deviceWeightScoreWeight) * 10

  // 0-100の範囲にスケール
  return Math.round((totalScore / maxPossibleScore) * 100)
}

/**
 * 用途別の重み設定を取得（実験用 - 全て1）
 */
export function getRelativeUsageScoreWeights(category: UsageCategory): RelativeScoreWeights {
  const defaultWeights: RelativeScoreWeights = {
    cpuScoreWeight: 1,
    ramScoreWeight: 1,
    romScoreWeight: 1,
    batteryScoreWeight: 1,
    screenScoreWeight: 1,
    deviceWeightScoreWeight: 1
  }

  switch (category) {
    case 'mobile':
    case 'cafe':
    case 'home':
    default:
      return defaultWeights
  }
}

/**
 * PCスペック配列から相対評価ランキングを生成
 * @param allPcSpecs 全てのPCスペックデータ
 * @param category 用途カテゴリ
 * @returns スコア付きPCスペック配列（降順ソート済み）
 */
export function calculateRelativeRanking(
  allPcSpecs: Array<PcSpec & { id: number }>,
  category: UsageCategory = 'cafe'
): Array<PcSpec & { id: number, relativeScore: number }> {
  const weights = getRelativeUsageScoreWeights(category)
  
  const scoredPcs = allPcSpecs.map(pc => ({
    ...pc,
    relativeScore: calculateRelativePcScore(allPcSpecs, pc, category, weights)
  }))

  return scoredPcs.sort((a, b) => b.relativeScore - a.relativeScore)
}
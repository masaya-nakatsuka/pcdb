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
  scoreWeights: RelativeScoreWeights
): number {
  // 各項目の最小値・最大値を取得
  const cpuValues: number[] = allPcSpecs.map(pc => pc.cpuPassmark).filter(v => v > 0)
  const ramValues: number[] = allPcSpecs.map(pc => pc.ramGB).filter(v => v > 0)
  const romValues: number[] = allPcSpecs.map(pc => pc.romGB).filter(v => v > 0)
  const batteryValues: number[] = allPcSpecs.map(pc => pc.batteryLifeHours).filter(v => v > 0)
  const screenValues: number[] = allPcSpecs.map(pc => pc.screenSizeInch).filter(v => v > 0)
  const weightValues: number[] = allPcSpecs.map(pc => pc.deviceWeight).filter(v => v > 0)

  const minMax = {
    cpu: { min: Math.min(...cpuValues), max: Math.max(...cpuValues) },
    ram: { min: Math.min(...ramValues), max: Math.max(...ramValues) },
    rom: { min: Math.min(...romValues), max: Math.max(...romValues) },
    battery: { min: Math.min(...batteryValues), max: Math.max(...batteryValues) },
    screen: { min: Math.min(...screenValues), max: Math.max(...screenValues) },
    weight: { min: Math.min(...weightValues), max: Math.max(...weightValues) }
  }

  // 正規化関数
  const normalizeScore = (value: number, min: number, max: number, direction: 'higher_is_better' | 'lower_is_better' | 'middle_is_better'): number => {
    if (max === min) return 5 // 全て同じ値の場合は中央値

    if (direction === 'middle_is_better') {
      // 中間値を最高点とする正規化
      const mid = (min + max) / 2
      const distance = Math.abs(value - mid)
      const maxDistance = Math.max(mid - min, max - mid)
      return 10 - (distance / maxDistance) * 10
    }
    
    // 基本の正規化
    const normalized = (value - min) / (max - min) * 10
    return direction === 'lower_is_better' ? 10 - normalized : normalized
  }

  /**
   * CPUスコア
   */
  const cpuScore = normalizeScore(targetPcSpec.cpuPassmark, minMax.cpu.min, minMax.cpu.max, 'higher_is_better') * scoreWeights.cpuScoreWeight
  
  /**
   * RAMスコア
   */
  const ramScore = normalizeScore(targetPcSpec.ramGB, minMax.ram.min, minMax.ram.max, 'higher_is_better') * scoreWeights.ramScoreWeight

  /**
   * ROMスコア
   */
  const romScore = normalizeScore(targetPcSpec.romGB, minMax.rom.min, minMax.rom.max, 'higher_is_better') * scoreWeights.romScoreWeight
  
  /**
   * 駆動時間スコア　　駆動時間情報がない場合は３固定
   */
  const batteryScore = (targetPcSpec.batteryLifeHours != null && targetPcSpec.batteryLifeHours > 0)
    ? normalizeScore(targetPcSpec.batteryLifeHours, minMax.battery.min, minMax.battery.max, 'higher_is_better') * scoreWeights.batteryScoreWeight
    : 3 * scoreWeights.batteryScoreWeight

  /**
   * デバイス重量スコア　　重量情報がない場合は３固定
   */
  const deviceWeightScore = (targetPcSpec.deviceWeight != null && targetPcSpec.deviceWeight > 0)
    ? normalizeScore(targetPcSpec.deviceWeight, minMax.weight.min, minMax.weight.max, 'lower_is_better') * scoreWeights.deviceWeightScoreWeight
    : 3 * scoreWeights.deviceWeightScoreWeight

  /**
   * 画面サイズスコア
   */
  let screenScore: number
  switch (category) {
    case 'mobile':
      // 小さいほど高スコア
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max, 'lower_is_better') * scoreWeights.screenScoreWeight
      break
    case 'cafe':
      // 中間寄りが高スコア
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max, 'middle_is_better') * scoreWeights.screenScoreWeight
      break
    case 'home':
      // 大きいほど高スコア
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max, 'higher_is_better') * scoreWeights.screenScoreWeight
      break
  }

  /**
   * 総合スコア
   */
  const totalScore = cpuScore + ramScore + romScore + batteryScore + screenScore + deviceWeightScore
    
  /**
   * 最大可能スコア
   */
  const maxPossibleScore = (scoreWeights.cpuScoreWeight + scoreWeights.ramScoreWeight + scoreWeights.romScoreWeight + scoreWeights.batteryScoreWeight + scoreWeights.screenScoreWeight + scoreWeights.deviceWeightScoreWeight) * 10

  /**
   * 0~100の範囲にスケール
   */
  return Math.round((totalScore / maxPossibleScore) * 100)
}

/**
 * 用途別の重み設定を取得
 */
export function getRelativeUsageScoreWeights(category: UsageCategory): RelativeScoreWeights {
  switch (category) {
    case 'mobile':
      return {
        cpuScoreWeight: 10,
        ramScoreWeight: 10,
        romScoreWeight: 5,
        batteryScoreWeight: 14,
        screenScoreWeight: 10,
        deviceWeightScoreWeight: 12
      }
    case 'cafe':
      return {
        cpuScoreWeight: 10,
        ramScoreWeight: 10,
        romScoreWeight: 8,
        batteryScoreWeight: 12,
        screenScoreWeight: 10,
        deviceWeightScoreWeight: 10
      }
    case 'home':
      return {
        cpuScoreWeight: 15,
        ramScoreWeight: 15,
        romScoreWeight: 10,
        batteryScoreWeight: 2,
        screenScoreWeight: 10,
        deviceWeightScoreWeight: 5
      }
    default:
      throw new Error(`Invalid category: ${category}`)
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
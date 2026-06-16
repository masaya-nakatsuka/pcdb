import { ServerUsageCategory as UsageCategory } from '../../types'

interface PcSpec {
  cpuPassmark: number
  gpuScore: number
  ramGB: number
  romGB: number
  batteryLifeHours: number
  screenSizeInch: number
  deviceWeight: number
  price: number
}

interface RelativeScoreWeights {
  cpuScoreWeight: number
  gpuScoreWeight: number
  ramScoreWeight: number
  romScoreWeight: number
  batteryScoreWeight: number
  screenScoreWeight: number
  deviceWeightScoreWeight: number
  priceScoreWeight: number
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
  const gpuValues: number[] = allPcSpecs.map(pc => pc.gpuScore).filter(v => v > 0)
  const ramValues: number[] = allPcSpecs.map(pc => pc.ramGB).filter(v => v > 0)
  const romValues: number[] = allPcSpecs.map(pc => pc.romGB).filter(v => v > 0)
  const batteryValues: number[] = allPcSpecs.map(pc => pc.batteryLifeHours).filter(v => v > 0)
  const screenValues: number[] = allPcSpecs.map(pc => pc.screenSizeInch).filter(v => v > 0)
  const weightValues: number[] = allPcSpecs.map(pc => pc.deviceWeight).filter(v => v > 0)
  const priceValues: number[] = allPcSpecs.map(pc => pc.price).filter(v => v > 0)

  const getMinMax = (values: number[]) => {
    if (values.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...values), max: Math.max(...values) }
  }

  const minMax = {
    cpu: getMinMax(cpuValues),
    gpu: getMinMax(gpuValues),
    ram: getMinMax(ramValues),
    rom: getMinMax(romValues),
    battery: getMinMax(batteryValues),
    screen: getMinMax(screenValues),
    weight: getMinMax(weightValues),
    price: getMinMax(priceValues)
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
   * GPUスコア
   */
  const gpuScore = normalizeScore(targetPcSpec.gpuScore, minMax.gpu.min, minMax.gpu.max, 'higher_is_better') * scoreWeights.gpuScoreWeight
  
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
   * 価格スコア
   */
  const priceScore = (targetPcSpec.price != null && targetPcSpec.price > 0)
    ? normalizeScore(targetPcSpec.price, minMax.price.min, minMax.price.max, 'lower_is_better') * scoreWeights.priceScoreWeight
    : 3 * scoreWeights.priceScoreWeight

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
    case 'cost_performance':
      // コスパ評価では画面サイズを評価に入れない
      screenScore = 0
      break
    case 'gaming':
    case 'video_editing':
      // ゲーム/動画編集は作業領域を重視
      screenScore = normalizeScore(targetPcSpec.screenSizeInch, minMax.screen.min, minMax.screen.max, 'higher_is_better') * scoreWeights.screenScoreWeight
      break
  }

  /**
   * 総合スコア
   */
  const totalScore = cpuScore + gpuScore + ramScore + romScore + batteryScore + screenScore + deviceWeightScore + priceScore
    
  /**
   * 最大可能スコア
   */
  const maxPossibleScore = (scoreWeights.cpuScoreWeight + scoreWeights.gpuScoreWeight + scoreWeights.ramScoreWeight + scoreWeights.romScoreWeight + scoreWeights.batteryScoreWeight + scoreWeights.screenScoreWeight + scoreWeights.deviceWeightScoreWeight + scoreWeights.priceScoreWeight) * 10

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
        cpuScoreWeight: 9,
        gpuScoreWeight: 1,
        ramScoreWeight: 8,
        romScoreWeight: 5,
        batteryScoreWeight: 14,
        screenScoreWeight: 9,
        deviceWeightScoreWeight: 13,
        priceScoreWeight: 0
      }
    case 'cafe':
      return {
        cpuScoreWeight: 10,
        gpuScoreWeight: 1,
        ramScoreWeight: 10,
        romScoreWeight: 8,
        batteryScoreWeight: 12,
        screenScoreWeight: 10,
        deviceWeightScoreWeight: 10,
        priceScoreWeight: 0
      }
    case 'home':
      return {
        cpuScoreWeight: 15,
        gpuScoreWeight: 3,
        ramScoreWeight: 15,
        romScoreWeight: 10,
        batteryScoreWeight: 2,
        screenScoreWeight: 10,
        deviceWeightScoreWeight: 5,
        priceScoreWeight: 0
      }
    case 'cost_performance':
      return {
        cpuScoreWeight: 18,
        gpuScoreWeight: 6,
        ramScoreWeight: 12,
        romScoreWeight: 10,
        batteryScoreWeight: 2,
        screenScoreWeight: 0,
        deviceWeightScoreWeight: 0,
        priceScoreWeight: 20
      }
    case 'gaming':
      return {
        cpuScoreWeight: 14,
        gpuScoreWeight: 20,
        ramScoreWeight: 12,
        romScoreWeight: 8,
        batteryScoreWeight: 1,
        screenScoreWeight: 8,
        deviceWeightScoreWeight: 2,
        priceScoreWeight: 0
      }
    case 'video_editing':
      return {
        cpuScoreWeight: 16,
        gpuScoreWeight: 14,
        ramScoreWeight: 14,
        romScoreWeight: 10,
        batteryScoreWeight: 1,
        screenScoreWeight: 8,
        deviceWeightScoreWeight: 2,
        priceScoreWeight: 0
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

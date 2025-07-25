'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { cpuPowerMap } from '../infra/data/cpuSpecMap'
import { PcWithCpuSpec } from '../domain/models/pc'
import { ServerUsageCategory as UsageCategory } from '../types'
import { calculateSystemPowerConsumption, calculateBatteryLifeHours } from '../utils/powerCalculations'
import { calculateRelativeRanking } from '../domain/services/relativePcScore'

export async function fetchPcList(usageCategory: UsageCategory = 'cafe'): Promise<PcWithCpuSpec[]> {
  const supabasePcs = await fetchAllPcs()
  
  const pcsWithCalculations = supabasePcs.map((pc) => {
    // pcの型がnull許容しまくりだから面倒になってる
    if (!cpuPowerMap[pc.cpu ?? '']) {
      throw new Error(`CPU ${pc.cpu} のスペックデータが見つかりません`)
    }

    const cpuSpec = cpuPowerMap[pc.cpu ?? '']
    
    let estimatedBatteryLifeHours: number | null = null

    // 駆動時間(推定)の計算
    if (cpuSpec.tdpW && pc.display_size && pc.battery_wh_normalized) {
      const cpuTdpW = cpuSpec.tdpW
      const powerConsumption = calculateSystemPowerConsumption(
        cpuTdpW,
        pc.display_size
      )
      estimatedBatteryLifeHours = Math.round(calculateBatteryLifeHours(
        pc.battery_wh_normalized,
        powerConsumption.totalPowerW
      ) * 10) / 10
    }

    return {
      ...pc,
      estimatedBatteryLifeHours,
      cpuSpec,
    }
  })

  // 相対ランキング用のデータ変換
  const pcSpecsForRanking = pcsWithCalculations
    .filter(pc => pc.cpuSpec.passmarkScore && pc.ram && pc.rom && pc.display_size)
    .map(pc => ({
      id: pc.id,
      cpuPassmark: pc.cpuSpec.passmarkScore || 0,
      ramGB: pc.ram || 0,
      romGB: pc.rom || 0,
      batteryLifeHours: pc.estimatedBatteryLifeHours || 0,
      screenSizeInch: pc.display_size || 0,
      deviceWeight: pc.weight || 0,
    }))

  // 相対ランキングを計算
  const rankedSpecs = calculateRelativeRanking(pcSpecsForRanking, usageCategory)
  
  // ランキング結果をマージしてソート
  const pcsWithRelativeScore = pcsWithCalculations.map(pc => {
    const ranking = rankedSpecs.find(ranked => ranked.id === pc.id)
    return {
      ...pc,
      pcScore: ranking?.relativeScore ?? null,
    }
  })
  
  // スコア降順に並び替え
  return pcsWithRelativeScore.sort((a, b) => {
    if (a.pcScore === null) return 1
    if (b.pcScore === null) return -1
    return b.pcScore - a.pcScore
  })
}
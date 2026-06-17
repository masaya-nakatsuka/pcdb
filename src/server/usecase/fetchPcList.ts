'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { resolveCpuSpec } from '../infra/data/cpuSpecMap'
import { PcWithCpuSpec } from '../domain/models/pc'
import { ServerUsageCategory as UsageCategory } from '../types'
import { calculateBatteryLifeProfiles } from '../utils/powerCalculations'
import { calculateRelativeRanking } from '../domain/services/relativePcScore'

export async function fetchPcList(usageCategory: UsageCategory = 'cafe'): Promise<PcWithCpuSpec[]> {
  const supabasePcs = await fetchAllPcs()
  
  const pcsWithCalculations = supabasePcs.map((pc) => {
    const cpuSpec = resolveCpuSpec(pc.cpu)
    
    const batteryLifeProfiles = (cpuSpec?.tdpW && pc.display_size && pc.battery_wh_normalized)
      ? calculateBatteryLifeProfiles({
          batteryCapacityWh: pc.battery_wh_normalized,
          cpuTdpW: cpuSpec.tdpW,
          displaySizeInches: pc.display_size,
          gpuScore: pc.gpu_score,
          hasDgpu: pc.has_dgpu,
        })
      : null

    // 既存ソート・スコア互換の代表値はExcel作業時間にする。
    const estimatedBatteryLifeHours = batteryLifeProfiles?.excelWorkHours ?? null

    return {
      ...pc,
      estimatedBatteryLifeHours,
      batteryLifeProfiles,
      cpuSpec,
    }
  })

  // 相対ランキング用のデータ変換
  const pcSpecsForRanking = pcsWithCalculations
    .filter(pc =>
      pc.cpuSpec?.passmarkScore &&
      pc.ram &&
      pc.rom &&
      (usageCategory === 'cost_performance' || pc.display_size) &&
      (usageCategory !== 'cost_performance' || pc.price || pc.real_price)
    )
    .map(pc => ({
      id: pc.id,
      cpuPassmark: pc.cpuSpec?.passmarkScore || 0,
      gpuScore: pc.gpu_score ?? 2,
      ramGB: pc.ram || 0,
      romGB: pc.rom || 0,
      batteryLifeHours: pc.estimatedBatteryLifeHours || 0,
      screenSizeInch: pc.display_size || 0,
      deviceWeight: pc.weight || 0,
      price: pc.price || pc.real_price || 0,
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

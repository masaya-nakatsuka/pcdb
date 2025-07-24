'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { cpuPowerMap } from '../infra/data/cpuSpecMap'
import { PcWithCpuSpec } from '../domain/models/pc'
import { ServerUsageCategory as UsageCategory } from '../types'
import { calculateSystemPowerConsumption, calculateBatteryLifeHours } from '../utils/powerCalculations'
import { calculatePcScore, getUsageWeights } from '../domain/services/pcScore'

export async function fetchPcList(usageCategory: UsageCategory = 'cafe'): Promise<PcWithCpuSpec[]> {
  const supabasePcs = await fetchAllPcs()
  const weights = getUsageWeights(usageCategory)
  
  const pcsWithCalculations = supabasePcs.map((pc) => {
    const cpuSpec = cpuPowerMap[pc.cpu ?? '']
    
    let estimatedBatteryLifeHours: number | null = null

    // 駆動時間(推定)の計算
    if (cpuSpec?.tdpW && pc.display_size && pc.battery_wh_normalized) {
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
    
    let pcScore: number | null = null
    
    // スコアの計算（重み付けを適用）
    if (cpuSpec?.passmarkScore && pc.ram && pc.rom) {
      pcScore = calculatePcScore(
        cpuSpec.passmarkScore,
        pc.ram,
        pc.rom,
        estimatedBatteryLifeHours,
        weights
      )
    }

    return {
      ...pc,
      cores: cpuSpec?.cores ?? null,
      estimatedBatteryLifeHours,
      pcScore,
    }
  })
  
  // スコア降順に並び替え
  return pcsWithCalculations.sort((a, b) => {
    if (a.pcScore === null) return 1
    if (b.pcScore === null) return -1
    return b.pcScore - a.pcScore
  })
}
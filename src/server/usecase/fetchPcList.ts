'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { resolveCpuSpec } from '../infra/data/cpuSpecMap'
import { PcWithCpuSpec } from '../domain/models/pc'
import { ServerUsageCategory as UsageCategory } from '../types'
import { calculateBatteryLifeProfiles } from '../utils/powerCalculations'
import { calculateRelativeRanking } from '../domain/services/relativePcScore'
import { filterPcsByListing, type PcListingType } from '../../lib/pcListing'
import { filterPcsByDeviceCategory, type PcDeviceCategory } from '../../lib/pcDeviceCategory'

export async function fetchPcList(
  usageCategory: UsageCategory = 'cafe',
  listing: PcListingType = 'new',
  device: PcDeviceCategory = 'notebook_pc',
  searchQuery = ''
): Promise<PcWithCpuSpec[]> {
  const basePcs = filterPcsBySearchQuery(
    filterPcsByDeviceCategory(filterPcsByListing(await fetchAllPcs(), listing), device),
    searchQuery
  )
  const supabasePcs = applyUsageIntentFilter(basePcs, usageCategory)
  
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

function normalizeSearchQuery(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .split(/[\s,、　]+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function pcSearchText(pc: Awaited<ReturnType<typeof fetchAllPcs>>[number]): string {
  return [
    pc.brand,
    pc.name,
    pc.cpu,
    pc.gpu,
    pc.form_factor,
    pc.display_size ? `${pc.display_size}インチ` : null,
    pc.ram ? `${pc.ram}gb ${pc.ram}GB メモリ` : null,
    pc.rom ? `${pc.rom}gb ${pc.rom}GB ssd` : null,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function filterPcsBySearchQuery<T extends Awaited<ReturnType<typeof fetchAllPcs>>[number]>(pcs: T[], searchQuery: string): T[] {
  const tokens = normalizeSearchQuery(searchQuery)

  if (tokens.length === 0) {
    return pcs
  }

  return pcs.filter((pc) => {
    const text = pcSearchText(pc)
    return tokens.every((token) => text.includes(token))
  })
}

function applyUsageIntentFilter<T extends Awaited<ReturnType<typeof fetchAllPcs>>[number]>(pcs: T[], usageCategory: UsageCategory): T[] {
  if (usageCategory === 'gaming') {
    const gamingCandidates = pcs.filter((pc) => {
      const gpuScore = pc.gpu_score ?? 0
      return Boolean(pc.has_dgpu) || gpuScore >= 5
    })

    return gamingCandidates.length >= 3 ? gamingCandidates : pcs
  }

  if (usageCategory === 'video_editing') {
    const videoEditingCandidates = pcs.filter((pc) => {
      const gpuScore = pc.gpu_score ?? 0
      const ram = pc.ram ?? 0
      const rom = pc.rom ?? 0
      const cpu = (pc.cpu ?? '').toLowerCase()
      const hasMainstreamCpu =
        cpu.includes('core i5') ||
        cpu.includes('core i7') ||
        cpu.includes('core ultra') ||
        cpu.includes('ryzen 5') ||
        cpu.includes('ryzen 7')

      return ram >= 16 && rom >= 512 && (Boolean(pc.has_dgpu) || gpuScore >= 4 || hasMainstreamCpu)
    })

    return videoEditingCandidates.length >= 3 ? videoEditingCandidates : pcs
  }

  return pcs
}

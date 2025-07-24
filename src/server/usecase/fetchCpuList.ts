'use server'

import { cpuPowerMap } from '../infra/data/cpuSpecMap'

export async function fetchCpuList(): Promise<string[]> {
  // CPU名とPassmarkスコアを取得してスコア降順でソート
  const cpuEntries = Object.entries(cpuPowerMap)
    .map(([cpuName, spec]) => ({
      name: cpuName,
      score: spec.passmarkScore
    }))
    .sort((a, b) => b.score - a.score)
  
  // CPU名のみを返す
  return cpuEntries.map(entry => entry.name)
}
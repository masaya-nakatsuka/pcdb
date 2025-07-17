'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { cpuPowerMap } from '../infra/data/cpuSpecMap'
import { PcWithCpuSpec } from '../domain/models/pc'

export async function fetchPcList(): Promise<PcWithCpuSpec[]> {
  const supabasePcs = await fetchAllPcs()
  
  return supabasePcs.map((pc) => {
    const cpuSpec = cpuPowerMap[pc.cpu ?? '']
    return {
      ...pc,
      cores: cpuSpec?.cores ?? null,
    }
  })
}
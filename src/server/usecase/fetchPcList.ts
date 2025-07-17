'use server'

import { fetchAllPcs } from '../infra/pcRepository'
import { Pc } from '../domain/models/pc'

export async function fetchPcList(): Promise<Pc[]> {
  return await fetchAllPcs()
}
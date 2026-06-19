'use server'

import { Monitor } from '../domain/models/monitor'
import { fetchActiveMonitors } from '../infra/monitorRepository'

export async function fetchMonitorList(): Promise<Monitor[]> {
  const monitors = await fetchActiveMonitors()

  return monitors.sort((a, b) => {
    const aPrice = a.real_price ?? a.price ?? Number.MAX_SAFE_INTEGER
    const bPrice = b.real_price ?? b.price ?? Number.MAX_SAFE_INTEGER

    if (aPrice !== bPrice) {
      return aPrice - bPrice
    }

    return (a.id ?? 0) - (b.id ?? 0)
  })
}

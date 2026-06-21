'use server'

import { Tablet } from '../domain/models/tablet'
import { fetchActiveTablets } from '../infra/tabletRepository'

export async function fetchTabletList(): Promise<Tablet[]> {
  const tablets = await fetchActiveTablets()

  return tablets.sort((a, b) => {
    const aPrice = a.real_price ?? a.price ?? Number.MAX_SAFE_INTEGER
    const bPrice = b.real_price ?? b.price ?? Number.MAX_SAFE_INTEGER

    if (aPrice !== bPrice) {
      return aPrice - bPrice
    }

    return (a.id ?? 0) - (b.id ?? 0)
  })
}

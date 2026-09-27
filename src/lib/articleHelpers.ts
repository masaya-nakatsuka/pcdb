/**
 * Article Helper Utilities
 *
 * Reusable filter functions for common PC filtering patterns in blog articles.
 * Use these to reduce boilerplate when creating filtered article pages.
 */

import type { ServerPcWithCpuSpec } from '@/server/types'

export interface PriceRangeFilter {
  min?: number
  max?: number
}

export interface SpecFilter {
  minRam?: number
  minRom?: number
  maxWeight?: number
  minDisplaySize?: number
  maxDisplaySize?: number
}

/**
 * Filter PCs by price range
 */
export function filterByPrice(
  pcs: ServerPcWithCpuSpec[],
  { min = 0, max = Infinity }: PriceRangeFilter
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => {
    const price = pc.price ?? 0
    return price >= min && price <= max
  })
}

/**
 * Filter PCs by RAM size (GB)
 */
export function filterByRam(
  pcs: ServerPcWithCpuSpec[],
  minRam: number
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => (pc.ram ?? 0) >= minRam)
}

/**
 * Filter PCs by storage size (GB)
 */
export function filterByRom(
  pcs: ServerPcWithCpuSpec[],
  minRom: number
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => (pc.rom ?? 0) >= minRom)
}

/**
 * Filter PCs by weight (kg)
 */
export function filterByWeight(
  pcs: ServerPcWithCpuSpec[],
  maxWeight: number
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => {
    const weight = pc.weight
    return weight !== null && weight <= maxWeight
  })
}

/**
 * Filter PCs by display size range (inches)
 */
export function filterByDisplaySize(
  pcs: ServerPcWithCpuSpec[],
  { min = 0, max = Infinity }: { min?: number; max?: number }
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => {
    const size = pc.display_size
    return size !== null && size >= min && size <= max
  })
}

/**
 * Filter PCs by CPU keyword match (case-insensitive)
 */
export function filterByCpu(
  pcs: ServerPcWithCpuSpec[],
  keyword: string
): ServerPcWithCpuSpec[] {
  const lowerKeyword = keyword.toLowerCase()
  return pcs.filter((pc) => pc.cpu?.toLowerCase().includes(lowerKeyword))
}

/**
 * Filter PCs by multiple specs (AND condition)
 */
export function filterBySpecs(
  pcs: ServerPcWithCpuSpec[],
  specs: SpecFilter
): ServerPcWithCpuSpec[] {
  return pcs.filter((pc) => {
    if (specs.minRam !== undefined && (pc.ram ?? 0) < specs.minRam) return false
    if (specs.minRom !== undefined && (pc.rom ?? 0) < specs.minRom) return false
    if (specs.maxWeight !== undefined) {
      if (pc.weight === null || pc.weight > specs.maxWeight) return false
    }
    if (specs.minDisplaySize !== undefined) {
      if (pc.display_size === null || pc.display_size < specs.minDisplaySize) return false
    }
    if (specs.maxDisplaySize !== undefined) {
      if (pc.display_size === null || pc.display_size > specs.maxDisplaySize) return false
    }
    return true
  })
}

/**
 * Common filter: Practical spec (16GB RAM + 512GB SSD)
 */
export function filterPracticalSpec(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterBySpecs(pcs, { minRam: 16, minRom: 512 })
}

/**
 * Common filter: Lightweight (max 1.3kg)
 */
export function filterLightweight(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterByWeight(pcs, 1.3)
}

/**
 * Common filter: Ultra-lightweight (max 1.0kg)
 */
export function filterUltraLightweight(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterByWeight(pcs, 1.0)
}

/**
 * Common filter: Mini notebook (max 11 inches)
 */
export function filterMiniNotebook(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterByDisplaySize(pcs, { max: 11 })
}

/**
 * Common filter: Large screen (15-16.5 inches)
 */
export function filterLargeScreen(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterByDisplaySize(pcs, { min: 15, max: 16.5 })
}

/**
 * Common filter: Medium screen (13.5-14.5 inches)
 */
export function filterMediumScreen(pcs: ServerPcWithCpuSpec[]): ServerPcWithCpuSpec[] {
  return filterByDisplaySize(pcs, { min: 13.5, max: 14.5 })
}

/**
 * Compose multiple filter functions
 */
export function compose<T>(
  ...filters: Array<(items: T[]) => T[]>
): (items: T[]) => T[] {
  return (items: T[]) => filters.reduce((acc, filter) => filter(acc), items)
}

/**
 * Example usage:
 *
 * // Simple filter
 * const pcs = filterPracticalSpec(await fetchPcList('cafe'))
 *
 * // Compose multiple filters
 * const filter = compose(
 *   filterPracticalSpec,
 *   filterLightweight,
 *   (pcs) => filterByPrice(pcs, { max: 100000 })
 * )
 * const pcs = filter(await fetchPcList('mobile'))
 */

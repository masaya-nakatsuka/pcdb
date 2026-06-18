'use client'

import { useEffect, useState } from 'react'
import { ClientPcListing, ClientPcWithCpuSpec, ClientUsageCategory } from '../../components/types'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import PcTable from '../../components/desktop/PcTable'
import PcList from '../../components/mobile/PcList'
import { getPcQuickFiltersFromSearchParams, type PcQuickFilterKey } from '../../components/utils/pcQuickFilters'
import { getPcSearchQueryFromSearchParams } from '../../components/utils/pcSearch'

interface ClientPcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
  initialUsage?: ClientUsageCategory
  initialQuickFilters?: PcQuickFilterKey[]
  initialSearchQuery?: string
  listing?: ClientPcListing
  urlBasedUsage?: boolean
  embeddedInArticle?: boolean
}

export default function ClientPcList({ pcs, defaultCpu, defaultMaxDisplaySize, initialUsage = 'cafe', initialQuickFilters, initialSearchQuery, listing = 'new', urlBasedUsage = false, embeddedInArticle = false }: ClientPcListProps) {
  const { isMobile, isTablet } = useDeviceDetection()
  const [urlQuickFilters, setUrlQuickFilters] = useState<PcQuickFilterKey[]>([])
  const [urlSearchQuery, setUrlSearchQuery] = useState('')
  const effectiveQuickFilters = initialQuickFilters ?? urlQuickFilters
  const effectiveSearchQuery = initialSearchQuery ?? urlSearchQuery

  useEffect(() => {
    if (embeddedInArticle || typeof window === 'undefined') {
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    setUrlQuickFilters(getPcQuickFiltersFromSearchParams(searchParams))
    setUrlSearchQuery(getPcSearchQueryFromSearchParams(searchParams))
  }, [embeddedInArticle])

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} initialUsage={initialUsage} initialQuickFilters={effectiveQuickFilters} initialSearchQuery={effectiveSearchQuery} listing={listing} urlBasedUsage={urlBasedUsage} />
  }

  return <PcTable pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} initialUsage={initialUsage} initialQuickFilters={effectiveQuickFilters} initialSearchQuery={effectiveSearchQuery} listing={listing} urlBasedUsage={urlBasedUsage} embeddedInArticle={embeddedInArticle} />
}

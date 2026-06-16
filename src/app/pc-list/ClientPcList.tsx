'use client'

import { ClientPcWithCpuSpec, ClientUsageCategory } from '../../components/types'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import PcTable from '../../components/desktop/PcTable'
import PcList from '../../components/mobile/PcList'

interface ClientPcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
  initialUsage?: ClientUsageCategory
  urlBasedUsage?: boolean
}

export default function ClientPcList({ pcs, defaultCpu, defaultMaxDisplaySize, initialUsage = 'cafe', urlBasedUsage = false }: ClientPcListProps) {
  const { isMobile, isTablet } = useDeviceDetection()

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} initialUsage={initialUsage} urlBasedUsage={urlBasedUsage} />
  }

  return <PcTable pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} initialUsage={initialUsage} urlBasedUsage={urlBasedUsage} />
}

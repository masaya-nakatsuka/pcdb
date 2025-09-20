'use client'

import { ClientPcWithCpuSpec } from '../../components/types'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import PcTable from '../../components/desktop/PcTable'
import PcList from '../../components/mobile/PcList'

interface ClientPcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
}

export default function ClientPcList({ pcs, defaultCpu, defaultMaxDisplaySize }: ClientPcListProps) {
  const { isMobile, isTablet } = useDeviceDetection()

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} />
  }

  return <PcTable pcs={pcs} defaultCpu={defaultCpu} defaultMaxDisplaySize={defaultMaxDisplaySize} />
}

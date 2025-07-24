'use client'

import { ClientPcWithCpuSpec } from '../../components/types'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import PcTable from '../../components/desktop/PcTable'
import PcList from '../../components/mobile/PcList'

interface ClientPcListProps {
  pcs: ClientPcWithCpuSpec[]
}

export default function ClientPcList({ pcs }: ClientPcListProps) {
  const { isMobile, isTablet } = useDeviceDetection()

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} />
  }

  return <PcTable pcs={pcs} />
}
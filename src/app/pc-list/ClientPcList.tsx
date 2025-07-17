'use client'

import { PcWithCpuSpec } from '../../shared/types/pc'
import { useDeviceDetection } from '../../hooks/useDeviceDetection'
import PcTable from '../../components/desktop/PcTable'
import PcList from '../../components/mobile/PcList'

interface ClientPcListProps {
  pcs: PcWithCpuSpec[]
}

export default function ClientPcList({ pcs }: ClientPcListProps) {
  const { isMobile, isTablet } = useDeviceDetection()

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} />
  }

  return <PcTable pcs={pcs} />
}
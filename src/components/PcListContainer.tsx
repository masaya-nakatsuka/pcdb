'use client'

import { Pc } from '../shared/types/pc'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import PcTable from './desktop/PcTable'
import PcList from './mobile/PcList'

interface PcListContainerProps {
  pcs: Pc[]
}

export default function PcListContainer({ pcs }: PcListContainerProps) {
  const { isMobile, isTablet } = useDeviceDetection()

  if (isMobile || isTablet) {
    return <PcList pcs={pcs} />
  }

  return <PcTable pcs={pcs} />
}
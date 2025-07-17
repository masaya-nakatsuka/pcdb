'use client'

import { PcListProps } from '../../shared/types/components'
import PcCard from './PcCard'

export default function PcList({ pcs }: PcListProps) {
  return (
    <div style={{ padding: '16px' }}>
      {pcs.map((pc) => (
        <PcCard key={pc.id} pc={pc} />
      ))}
    </div>
  )
}
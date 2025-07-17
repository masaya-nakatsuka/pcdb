import { PcWithCpuSpec } from './pc'

export interface PcCardProps {
  pc: PcWithCpuSpec
}

export interface PcTableProps {
  pcs: PcWithCpuSpec[]
}

export interface PcListProps {
  pcs: PcWithCpuSpec[]
}

export interface ImageComponentProps {
  src: string
  alt: string
  style?: React.CSSProperties
}
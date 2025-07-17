import { Pc } from './pc'

export interface PcCardProps {
  pc: Pc
}

export interface PcTableProps {
  pcs: Pc[]
}

export interface PcListProps {
  pcs: Pc[]
}

export interface ImageComponentProps {
  src: string
  alt: string
  style?: React.CSSProperties
}
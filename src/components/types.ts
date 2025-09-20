export interface ClientPc {
  id: number
  form_factor: string | null
  display_size: number | null
  brand: string | null
  name: string | null
  price: number | null
  real_price: number | null
  cpu: string | null
  ram: number | null
  rom: number | null
  weight: number | null
  url: string | null
  af_url: string | null
  img_url: string | null
  imp_img_url: string | null
  fetched_at: string | null
}

export interface ClientPcWithCpuSpec extends ClientPc {
  estimatedBatteryLifeHours: number | null
  pcScore: number | null
}

export type ClientUsageCategory = 'mobile' | 'cafe' | 'home'

export type ClientSortField = 'pcScore' | 'cpu' | 'ram' | 'rom' | 'display_size' | 'estimatedBatteryLifeHours' | 'weight' | 'price'
export type ClientSortOrder = 'asc' | 'desc'

export interface ClientSortOptions {
  field: ClientSortField
  order: ClientSortOrder
}

export interface PcCardProps {
  pc: ClientPcWithCpuSpec
}

export interface PcTableProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
}

export interface PcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
}

export interface ImageComponentProps {
  src: string
  alt: string
  style?: React.CSSProperties
}

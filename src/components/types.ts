export interface ClientPc {
  id: number
  form_factor: string | null
  display_size: number | null
  brand: string | null
  name: string | null
  price: number | null
  real_price: number | null
  cpu: string | null
  gpu: string | null
  gpu_class: string | null
  gpu_score: number | null
  has_dgpu: boolean | null
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
  batteryLifeProfiles: ClientBatteryLifeProfiles | null
  pcScore: number | null
}

export interface ClientBatteryLifeProfiles {
  excelWorkHours: number
  videoPlaybackHours: number
  gaming3dHours: number
  videoEditingHours: number
}

export type ClientUsageCategory = 'mobile' | 'cafe' | 'home' | 'cost_performance' | 'gaming' | 'video_editing'

export type ClientSortField = 'pcScore' | 'cpu' | 'gpu_score' | 'ram' | 'rom' | 'display_size' | 'estimatedBatteryLifeHours' | 'weight' | 'price'
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
  initialUsage?: ClientUsageCategory
  urlBasedUsage?: boolean
}

export interface PcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
  initialUsage?: ClientUsageCategory
  urlBasedUsage?: boolean
}

export interface ImageComponentProps {
  src: string
  alt: string
  style?: React.CSSProperties
}

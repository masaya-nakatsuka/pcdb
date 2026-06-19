import type { PcListingType } from '@/lib/pcListing'
import type { PcDeviceCategory } from '@/lib/pcDeviceCategory'

export interface ClientPc {
  id: number
  form_factor: string | null
  display_size: number | null
  brand: string | null
  name: string | null
  condition?: string | null
  item_condition?: string | null
  product_condition?: string | null
  condition_label?: string | null
  availability?: string | null
  is_used?: boolean | null
  is_refurbished?: boolean | null
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
export type ClientPcListing = PcListingType
export type ClientPcDeviceCategory = PcDeviceCategory

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
  listing?: ClientPcListing
  device?: ClientPcDeviceCategory
  urlBasedUsage?: boolean
  embeddedInArticle?: boolean
}

export interface PcListProps {
  pcs: ClientPcWithCpuSpec[]
  defaultCpu?: string
  defaultMaxDisplaySize?: number
  initialUsage?: ClientUsageCategory
  listing?: ClientPcListing
  device?: ClientPcDeviceCategory
  urlBasedUsage?: boolean
}

export interface ImageComponentProps {
  src: string
  alt: string
  style?: React.CSSProperties
}

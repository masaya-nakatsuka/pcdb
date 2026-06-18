export interface ServerPc {
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
  battery: string | null
  battery_wh_normalized: number | null
  weight: number | null
  url: string | null
  af_url: string | null
  img_url: string | null
  imp_img_url: string | null
  fetched_at: string | null
}

export interface ServerPcWithCpuSpec extends ServerPc {
  estimatedBatteryLifeHours: number | null
  batteryLifeProfiles: ServerBatteryLifeProfiles | null
  pcScore: number | null
}

export interface ServerBatteryLifeProfiles {
  excelWorkHours: number
  videoPlaybackHours: number
  gaming3dHours: number
  videoEditingHours: number
}

export type ServerUsageCategory = 'mobile' | 'cafe' | 'home' | 'cost_performance' | 'gaming' | 'video_editing'

export interface ServerScoreWeights {
  cpuScoreWeight: number
  gpuScoreWeight: number
  ramScoreWeight: number
  romScoreWeight: number
  batteryScoreWeight: number
  screenScoreWeight: number
  deviceWeightScoreWeight: number
  priceScoreWeight: number
}

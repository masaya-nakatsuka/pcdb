export interface ServerPc {
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
  cores: number | null
  estimatedBatteryLifeHours: number | null
  pcScore: number | null
}

export type ServerUsageCategory = 'mobile' | 'cafe' | 'home'

export interface ServerScoreWeights {
  cpuWeight: number
  ramWeight: number
  romWeight: number
  batteryWeight: number
}
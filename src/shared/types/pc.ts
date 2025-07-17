export interface Pc {
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

export interface PcWithCpuSpec extends Pc {
  cores: number | null
  estimatedBatteryLifeHours: number | null
  pcScore: number | null
}
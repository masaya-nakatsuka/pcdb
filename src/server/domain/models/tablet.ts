export type TabletOsFamily = 'android' | 'ipad'

export interface Tablet {
  id: number
  brand: string | null
  name: string | null
  series: string | null
  os_family: TabletOsFamily | null
  os_version: string | null
  soc: string | null
  soc_score: number | null
  ram_gb: number | null
  rom_gb: number | null
  display_size_inch: number | null
  resolution: string | null
  refresh_rate_hz: number | null
  battery_life_hours: number | null
  battery_capacity_mah: number | null
  weight_g: number | null
  has_cellular: boolean | null
  price: number | null
  real_price: number | null
  url: string | null
  af_url: string | null
  img_url: string | null
  fetched_at: string | null
  is_active: boolean | null
}

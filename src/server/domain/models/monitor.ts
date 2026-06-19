export interface Monitor {
  id: number
  brand: string | null
  name: string | null
  size_inch: number | null
  resolution: string | null
  refresh_rate_hz: number | null
  panel_type: string | null
  has_usb_c: boolean | null
  usb_c_power_delivery_w: number | null
  price: number | null
  real_price: number | null
  url: string | null
  af_url: string | null
  img_url: string | null
  fetched_at: string | null
  is_active: boolean | null
}

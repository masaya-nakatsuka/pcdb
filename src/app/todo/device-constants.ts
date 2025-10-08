export const DEVICE_VARIANT_HEADER = 'x-device-variant';
export const DEVICE_VARIANT_COOKIE = 'device-variant';
export const DEVICE_VARIANT_BREAKPOINT = 768;
export const DEVICE_VARIANT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type DeviceVariant = 'mobile' | 'desktop';

export function normalizeDeviceVariant(value: string | null | undefined): DeviceVariant | null {
  return value === 'mobile' || value === 'desktop' ? value : null;
}

import { ClientBatteryLifeProfiles } from '../types'

export const BATTERY_LIFE_PROFILE_LABELS = [
  { key: 'excelWorkHours', label: 'Excel' },
  { key: 'videoPlaybackHours', label: '動画' },
  { key: 'videoEditingHours', label: '動画編集' },
  { key: 'gaming3dHours', label: '3Dゲーム' },
] as const

export function formatBatteryLifeHours(hours: number | null | undefined): string {
  return typeof hours === 'number' && hours > 0 ? `${hours}h` : '-'
}

export function getBatteryLifeProfileRows(profiles: ClientBatteryLifeProfiles | null | undefined) {
  if (!profiles) {
    return []
  }

  return BATTERY_LIFE_PROFILE_LABELS.map(({ key, label }) => ({
    key,
    label,
    value: formatBatteryLifeHours(profiles[key]),
  }))
}

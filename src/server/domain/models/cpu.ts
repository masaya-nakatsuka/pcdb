export interface CpuSpec {
  cores: number
  threads?: number
  baseClockGHz?: number
  boostClockGHz?: number
  tdpW: number
  minPowerW?: number
  maxPowerW?: number
  passmarkScore?: number
}
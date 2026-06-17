export interface PowerConsumption {
  cpuPowerW: number
  displayPowerW: number
  basePowerW: number
  totalPowerW: number
}

export interface BatteryLifeProfiles {
  excelWorkHours: number
  videoPlaybackHours: number
  gaming3dHours: number
  videoEditingHours: number
}

interface BatteryLifeProfileInput {
  batteryCapacityWh: number
  cpuTdpW: number
  displaySizeInches: number
  gpuScore?: number | null
  hasDgpu?: boolean | null
}

const CPU_POWER_PER_WATT = 0.25
const DISPLAY_POWER_PER_INCH = 0.25
const BASE_SYSTEM_POWER = 2

export function calculateSystemPowerConsumption(
  cpuTdpW: number,
  displaySizeInches: number
): PowerConsumption {
  const cpuPowerW = cpuTdpW * CPU_POWER_PER_WATT
  const displayPowerW = displaySizeInches * DISPLAY_POWER_PER_INCH
  const basePowerW = BASE_SYSTEM_POWER
  const totalPowerW = cpuPowerW + displayPowerW + basePowerW

  return {
    cpuPowerW,
    displayPowerW,
    basePowerW,
    totalPowerW,
  }
}

export function calculateBatteryLifeHours(
  batteryCapacityWh: number,
  totalPowerConsumptionW: number
): number {
  if (totalPowerConsumptionW <= 0 || batteryCapacityWh <= 0) {
    return 0
  }
  
  return batteryCapacityWh / totalPowerConsumptionW
}

export function calculateBatteryLifeProfiles({
  batteryCapacityWh,
  cpuTdpW,
  displaySizeInches,
  gpuScore,
  hasDgpu,
}: BatteryLifeProfileInput): BatteryLifeProfiles | null {
  if (batteryCapacityWh <= 0 || cpuTdpW <= 0 || displaySizeInches <= 0) {
    return null
  }

  const gpuLoadPowerW = estimateGpuLoadPowerW(gpuScore, hasDgpu)

  const excelPowerW = calculateScenarioPowerW({
    cpuTdpW,
    displaySizeInches,
    cpuFactor: 0.25,
    displayFactor: 0.25,
    basePowerW: 2,
  })

  const videoPowerW = calculateScenarioPowerW({
    cpuTdpW,
    displaySizeInches,
    cpuFactor: 0.18,
    displayFactor: 0.30,
    basePowerW: 2.2,
    extraPowerW: hasDgpu ? 1 : 0,
  })

  const gamingPowerW = calculateScenarioPowerW({
    cpuTdpW,
    displaySizeInches,
    cpuFactor: 0.65,
    displayFactor: 0.38,
    basePowerW: 3,
    extraPowerW: gpuLoadPowerW,
  })

  const videoEditingPowerW = calculateScenarioPowerW({
    cpuTdpW,
    displaySizeInches,
    cpuFactor: 0.55,
    displayFactor: 0.35,
    basePowerW: 3,
    extraPowerW: gpuLoadPowerW * 0.65,
  })

  return {
    excelWorkHours: roundBatteryLife(calculateBatteryLifeHours(batteryCapacityWh, excelPowerW)),
    videoPlaybackHours: roundBatteryLife(calculateBatteryLifeHours(batteryCapacityWh, videoPowerW)),
    gaming3dHours: roundBatteryLife(calculateBatteryLifeHours(batteryCapacityWh, gamingPowerW)),
    videoEditingHours: roundBatteryLife(calculateBatteryLifeHours(batteryCapacityWh, videoEditingPowerW)),
  }
}

function calculateScenarioPowerW({
  cpuTdpW,
  displaySizeInches,
  cpuFactor,
  displayFactor,
  basePowerW,
  extraPowerW = 0,
}: {
  cpuTdpW: number
  displaySizeInches: number
  cpuFactor: number
  displayFactor: number
  basePowerW: number
  extraPowerW?: number
}): number {
  return (cpuTdpW * cpuFactor) + (displaySizeInches * displayFactor) + basePowerW + extraPowerW
}

function estimateGpuLoadPowerW(gpuScore?: number | null, hasDgpu?: boolean | null): number {
  const normalizedGpuScore = Math.min(Math.max(gpuScore ?? 2, 1), 10)

  if (hasDgpu) {
    return 12 + (normalizedGpuScore * 4.5)
  }

  return 2 + (normalizedGpuScore * 1.5)
}

function roundBatteryLife(hours: number): number {
  return Math.round(hours * 10) / 10
}

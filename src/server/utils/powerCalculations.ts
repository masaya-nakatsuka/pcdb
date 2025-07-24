export interface PowerConsumption {
  cpuPowerW: number
  displayPowerW: number
  basePowerW: number
  totalPowerW: number
}

const CPU_POWER_PER_WATT = 0.4
const DISPLAY_POWER_PER_INCH = 0.5
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
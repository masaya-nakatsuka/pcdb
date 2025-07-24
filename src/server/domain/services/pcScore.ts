import { ServerUsageCategory as UsageCategory, ServerScoreWeights as ScoreWeights } from '../../types'

export function calculatePcScore(
  cpuPassmark: number,
  ramGB: number,
  romGB: number,
  batteryLifeHours: number | null = null,
  weights?: ScoreWeights
): number {
  const baseCpu = 6000;
  const baseRam = 12;
  const baseRom = 512;
  const baseBatteryLife = 4;

  const defaultWeights: ScoreWeights = {
    cpuWeight: 1,
    ramWeight: 1,
    romWeight: 1,
    batteryWeight: 1
  }

  const finalWeights = weights ?? defaultWeights;

  const cpuScore = (cpuPassmark / baseCpu) * 10 * finalWeights.cpuWeight;
  const ramScore = (ramGB / baseRam) * 10 * finalWeights.ramWeight;
  const romScore = (romGB / baseRom) * 10 * finalWeights.romWeight;

  const actualBatteryLife = batteryLifeHours ?? 2;
  const batteryScore = (actualBatteryLife / baseBatteryLife) * 10 * finalWeights.batteryWeight;

  const totalScore = cpuScore + ramScore + romScore + batteryScore;

  return Math.round(totalScore);
}

export function getUsageWeights(category: UsageCategory): ScoreWeights {
  switch (category) {
    case 'mobile':
      return {
        cpuWeight: 1,
        ramWeight: 1,
        romWeight: 1,
        batteryWeight: 1
      }
    case 'cafe':
      return {
        cpuWeight: 1,
        ramWeight: 1,
        romWeight: 1,
        batteryWeight: 1
      }
    case 'home':
      return {
        cpuWeight: 9,
        ramWeight: 1,
        romWeight: 1,
        batteryWeight: 1
      }
    default:
      return {
        cpuWeight: 1,
        ramWeight: 1,
        romWeight: 1,
        batteryWeight: 1
      }
  }
}

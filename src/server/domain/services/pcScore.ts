export function calculatePcScore(
  cpuPassmark: number,
  ramGB: number,
  romGB: number,
  batteryLifeHours: number | null = null
): number {
  const baseCpu = 6000;
  const baseRam = 12;
  const baseRom = 512;
  const baseBatteryLife = 4;

  const cpuScore = (cpuPassmark / baseCpu) * 10;
  const ramScore = (ramGB / baseRam) * 10;
  const romScore = (romGB / baseRom) * 10;

  const actualBatteryLife = batteryLifeHours ?? 2;
  const batteryScore = (actualBatteryLife / baseBatteryLife) * 10;

  const totalScore = cpuScore + ramScore + romScore + batteryScore;

  return Math.round(totalScore);
}

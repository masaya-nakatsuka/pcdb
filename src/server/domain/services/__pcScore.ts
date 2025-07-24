// import { ServerUsageCategory as UsageCategory, ServerScoreWeights as ScoreWeights } from '../../types'

// export function calculatePcScore(
//   cpuPassmark: number,
//   ramGB: number,
//   romGB: number,
//   batteryLifeHours: number = 2,
//   screenSizeInch: number,
//   deviceWeight: number = 2000,
//   scoreWeights?: ScoreWeights
// ): number {
//   const baseCpu = 6000;
//   const baseRam = 12;
//   const baseRom = 512;
//   const baseBatteryLife = 4;

//   const defaultScoreWeights: ScoreWeights = {
//     cpuScoreWeight: 1,
//     ramScoreWeight: 1,
//     romScoreWeight: 1,
//     batteryScoreWeight: 1
//   }

//   const finalScoreWeights = scoreWeights ?? defaultScoreWeights;

//   const cpuScore = (cpuPassmark / baseCpu) * 10 * finalScoreWeights.cpuScoreWeight;
//   const ramScore = (ramGB / baseRam) * 10 * finalScoreWeights.ramScoreWeight;
//   const romScore = (romGB / baseRom) * 10 * finalScoreWeights.romScoreWeight;
//   const batteryScore = (batteryLifeHours / baseBatteryLife) * 10 * finalScoreWeights.batteryScoreWeight;

//   const totalScore = cpuScore + ramScore + romScore + batteryScore;

//   return Math.round(totalScore);
// }

// export function getUsageWeights(category: UsageCategory): ScoreWeights {
//   switch (category) {
//     case 'mobile':
//       return {
//         cpuScoreWeight: 1,
//         ramScoreWeight: 1,
//         romScoreWeight: 1,
//         batteryScoreWeight: 1
//       }
//     case 'cafe':
//       return {
//         cpuScoreWeight: 1,
//         ramScoreWeight: 1,
//         romScoreWeight: 1,
//         batteryScoreWeight: 1
//       }
//     case 'home':
//       return {
//         cpuScoreWeight: 9,
//         ramScoreWeight: 1,
//         romScoreWeight: 1,
//         batteryScoreWeight: 1
//       }
//     default:
//       return {
//         cpuScoreWeight: 1,
//         ramScoreWeight: 1,
//         romScoreWeight: 1,
//         batteryScoreWeight: 1
//       }
//   }
// }

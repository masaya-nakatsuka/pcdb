import type { RecentXpGain } from '../types'

export const XP_REWARD_MIN = 25
export const XP_REWARD_MAX = 35

export const LEVEL_BASE_XP = 100
export const LEVEL_GROWTH_RATE = 1.25

export function rollXpReward(): number {
  const span = XP_REWARD_MAX - XP_REWARD_MIN + 1
  return Math.floor(Math.random() * span) + XP_REWARD_MIN
}

export type LevelProgress = {
  level: number
  totalXp: number
  xpIntoLevel: number
  xpForNextLevel: number
  progressToNext: number
}

export function getLevelThreshold(level: number): number {
  if (level <= 0) return 0
  const base = LEVEL_BASE_XP * Math.pow(LEVEL_GROWTH_RATE, level - 1)
  return Math.max(LEVEL_BASE_XP, Math.round(base))
}

export function summarizeLevelProgress(totalXp: number): LevelProgress {
  if (!Number.isFinite(totalXp) || totalXp <= 0) {
    return {
      level: 1,
      totalXp: 0,
      xpIntoLevel: 0,
      xpForNextLevel: getLevelThreshold(1),
      progressToNext: 0
    }
  }

  let remaining = Math.floor(totalXp)
  let level = 1
  let threshold = getLevelThreshold(level)

  while (remaining >= threshold) {
    remaining -= threshold
    level += 1
    threshold = getLevelThreshold(level)
  }

  return {
    level,
    totalXp,
    xpIntoLevel: remaining,
    xpForNextLevel: threshold,
    progressToNext: threshold === 0 ? 1 : remaining / threshold
  }
}

export function createXpGain(todoId: string, amount: number): RecentXpGain {
  return { todoId, amount }
}

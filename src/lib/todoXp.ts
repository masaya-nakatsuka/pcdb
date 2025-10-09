export const XP_REWARD_MIN = 25
export const XP_REWARD_MAX = 35

export const LEVEL_BASE_XP = 100
export const LEVEL_GROWTH_RATE = 1.25

export type TodoXpLog = {
  id?: string
  user_id: string
  todo_id: string
  xp: number
  created_at?: string
}

export type LevelProgress = {
  level: number
  totalXp: number
  xpIntoLevel: number
  xpForNextLevel: number
  progressToNext: number
}

export function rollXpReward(): number {
  const span = XP_REWARD_MAX - XP_REWARD_MIN + 1
  return Math.floor(Math.random() * span) + XP_REWARD_MIN
}

export function getLevelThreshold(level: number): number {
  if (level <= 0) return 0
  return Math.max(LEVEL_BASE_XP, Math.round(LEVEL_BASE_XP * Math.pow(LEVEL_GROWTH_RATE, level - 1)))
}

export function summarizeLevelProgress(totalXp: number): LevelProgress {
  if (!Number.isFinite(totalXp) || totalXp < 0) {
    return {
      level: 1,
      totalXp: 0,
      xpIntoLevel: 0,
      xpForNextLevel: getLevelThreshold(1),
      progressToNext: 0,
    }
  }

  let remainingXp = Math.floor(totalXp)
  let currentLevel = 1
  let threshold = getLevelThreshold(currentLevel)

  while (remainingXp >= threshold) {
    remainingXp -= threshold
    currentLevel += 1
    threshold = getLevelThreshold(currentLevel)
  }

  const progressToNext = threshold === 0 ? 1 : remainingXp / threshold

  return {
    level: currentLevel,
    totalXp,
    xpIntoLevel: remainingXp,
    xpForNextLevel: threshold,
    progressToNext,
  }
}

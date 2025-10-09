"use client"

export type RecentXpGain = {
  amount: number
  todoId: string
}

export type XpProgressCardProps = {
  level: number
  xpTotal: number
  xpNeededForNextLevel: number
  xpProgressPercent: number
  recentXpGain: RecentXpGain | null
}

export default function XpProgressCard({
  level,
  xpTotal,
  xpNeededForNextLevel,
  xpProgressPercent,
  recentXpGain,
}: XpProgressCardProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-night-border-muted bg-night-glass-strong p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-frost-subtle">
          <span className="rounded-full bg-sky-500/20 px-3 py-1 font-semibold text-sky-300">Lv.{level}</span>
          <span>growth stage</span>
        </div>
        <div className="text-sm text-frost-soft">
          合計 {xpTotal} XP ・ 次のレベルまで {xpNeededForNextLevel} XP
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-night-border-strong">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-500 transition-[width] duration-500"
          style={{ width: `${xpProgressPercent}%` }}
        />
      </div>
      {recentXpGain && (
        <div className="text-sm font-semibold text-emerald-300">
          +{recentXpGain.amount} XP 獲得！
        </div>
      )}
    </div>
  )
}

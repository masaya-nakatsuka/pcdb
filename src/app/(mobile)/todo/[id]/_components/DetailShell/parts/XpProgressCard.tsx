"use client"

type RecentXpGain = {
  amount: number
  todoId: string
}

type XpProgressCardProps = {
  level: number
  xpTotal: number
  xpNeededForNextLevel: number
  xpProgressPercent: number
  recentXpGain: RecentXpGain | null
}

export { type RecentXpGain, type XpProgressCardProps }

export default function XpProgressCard({
  level,
  xpTotal,
  xpNeededForNextLevel,
  xpProgressPercent,
  recentXpGain,
}: XpProgressCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-950/70 via-indigo-950/60 to-fuchsia-950/60 px-5 py-6 shadow-glass-xl">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-frost-subtle">
            <span className="rounded-full bg-sky-500/30 px-3 py-1 font-semibold text-sky-100">Lv.{level}</span>
            <span className="text-frost-soft">アドベンチャー進捗</span>
          </div>
          <div className="text-sm text-frost-soft">
            合計 {xpTotal} XP ・ 次のレベルまで {xpNeededForNextLevel} XP
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-night-border/60 bg-night-glass/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-fuchsia-300 transition-[width] duration-500"
            style={{ width: `${xpProgressPercent}%` }}
          />
        </div>
        {recentXpGain && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-100">
            <span aria-hidden>✨</span>
            <span>+{recentXpGain.amount} XP 獲得！</span>
          </div>
        )}
      </div>
    </div>
  )
}

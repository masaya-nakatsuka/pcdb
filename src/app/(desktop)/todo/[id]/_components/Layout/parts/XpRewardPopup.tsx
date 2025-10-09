"use client"

import { useMemo, type CSSProperties } from 'react'

import type { RecentXpGain } from './XpProgressCard'

type XpRewardPopupProps = {
  recentXpGain: RecentXpGain | null
}

type ConfettiPiece = {
  id: string
  color: string
  size: number
  delay: number
  duration: number
  translateX: number
  translateY: number
  rotation: number
}

const CONFETTI_COLORS = ['#38bdf8', '#a78bfa', '#f472b6', '#facc15', '#34d399']
const CONFETTI_COUNT = 16

export default function XpRewardPopup({ recentXpGain }: XpRewardPopupProps) {
  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    if (!recentXpGain) return []

    return Array.from({ length: CONFETTI_COUNT }, (_, index) => {
      const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length]
      const translateX = (Math.random() - 0.5) * 360
      const translateY = 70 + Math.random() * 90
      const size = 6 + Math.random() * 8

      return {
        id: `${recentXpGain.todoId}-${index}`,
        color,
        size,
        delay: Math.random() * 140,
        duration: 900 + Math.random() * 600,
        translateX,
        translateY,
        rotation: (Math.random() - 0.5) * 720,
      }
    })
  }, [recentXpGain])

  if (!recentXpGain) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center">
      <div className="relative mt-16 flex flex-col items-center gap-3">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className="xp-confetti-piece"
              style={
                {
                  '--xp-confetti-size': `${piece.size}px`,
                  '--xp-confetti-x': `${piece.translateX}px`,
                  '--xp-confetti-y': `${piece.translateY}px`,
                  '--xp-confetti-rot': `${piece.rotation}deg`,
                  backgroundColor: piece.color,
                  animationDelay: `${piece.delay}ms`,
                  animationDuration: `${piece.duration}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div
          className="xp-popup-card pointer-events-auto flex min-w-[240px] flex-col items-center gap-1 rounded-2xl border border-night-border bg-night-glass/95 px-6 py-4 text-center shadow-2xl shadow-night-900/60 backdrop-blur"
          role="alert"
          aria-live="assertive"
        >
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            XP Gain
          </div>
          <div className="text-lg font-semibold text-frost-soft">
            +{recentXpGain.amount} XP 獲得！
          </div>
          <div className="flex items-center gap-2 text-sm text-frost-subtle">
            <span aria-hidden="true">🎉</span>
            <span>TODOを完了しました！</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .xp-popup-card {
          animation:
            xp-popup-enter 260ms ease-out,
            xp-popup-exit 340ms ease-in forwards;
          animation-delay: 0ms, 3000ms;
        }

        .xp-confetti-piece {
          position: absolute;
          top: 0;
          left: 50%;
          width: var(--xp-confetti-size);
          height: calc(var(--xp-confetti-size) * 0.4 + 4px);
          border-radius: 999px;
          opacity: 0;
          transform-origin: center;
          animation-name: xp-confetti-burst;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
          animation-fill-mode: forwards;
        }

        @keyframes xp-popup-enter {
          0% {
            opacity: 0;
            transform: translateY(-18px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes xp-popup-exit {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0.96);
          }
        }

        @keyframes xp-confetti-burst {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -10%, 0) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform:
              translate3d(
                calc(-50% + var(--xp-confetti-x)),
                calc(-10% + var(--xp-confetti-y)),
                0
              )
              rotate(var(--xp-confetti-rot));
          }
        }
      `}</style>
    </div>
  )
}

'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { ClientUsageCategory } from '../../components/types'

interface PcListHeaderProps {
  usage: ClientUsageCategory
  heading: string
  description: string
}

const usageAccents: Record<ClientUsageCategory, { primary: string; secondary: string; surface: string; line: string }> = {
  mobile: {
    primary: '#0284c7',
    secondary: '#16a34a',
    surface: '#f0fdfa',
    line: 'rgba(2, 132, 199, 0.22)',
  },
  cafe: {
    primary: '#2563eb',
    secondary: '#f59e0b',
    surface: '#fffbeb',
    line: 'rgba(37, 99, 235, 0.2)',
  },
  home: {
    primary: '#475569',
    secondary: '#16a34a',
    surface: '#f8fafc',
    line: 'rgba(71, 85, 105, 0.2)',
  },
  cost_performance: {
    primary: '#059669',
    secondary: '#ea580c',
    surface: '#f0fdf4',
    line: 'rgba(5, 150, 105, 0.2)',
  },
  gaming: {
    primary: '#2563eb',
    secondary: '#dc2626',
    surface: '#eff6ff',
    line: 'rgba(37, 99, 235, 0.2)',
  },
  video_editing: {
    primary: '#0f766e',
    secondary: '#7c3aed',
    surface: '#f0fdfa',
    line: 'rgba(15, 118, 110, 0.2)',
  },
}

export default function PcListHeader({ usage, heading, description }: PcListHeaderProps) {
  const accent = usageAccents[usage]
  const cssVars = {
    '--accent-primary': accent.primary,
    '--accent-secondary': accent.secondary,
    '--accent-surface': accent.surface,
    '--accent-line': accent.line,
  } as CSSProperties

  return (
    <header className="pc-list-header" style={cssVars}>
      <div className="pc-list-header__top">
        <Link href="/" className="pc-list-header__brand" aria-label="Specsy Hub ホーム">
          <span className="pc-list-header__brand-mark">S</span>
          <span>
            <span className="pc-list-header__brand-name">Specsy Hub</span>
            <span className="pc-list-header__brand-sub">PC選びをスコアで短縮</span>
          </span>
        </Link>

        <Link href="/" className="pc-list-header__back">
          ホームへ
        </Link>
      </div>

      <div className="pc-list-header__hero">
        <div className="pc-list-header__copy">
          <p className="pc-list-header__eyebrow">Amazon PC Comparison</p>
          <h1>{heading}</h1>
          <p className="pc-list-header__lead">{description}</p>
          <p className="pc-list-header__note">
            Amazonで見つかるノートPC・ミニPC・デスクトップを、用途別の見やすいランキングに整理しています。
          </p>
        </div>

        <div className="pc-list-header__panel" aria-label="Specsy Hubの比較軸">
          <div className="pc-list-header__panel-title">Specsy PC Finder</div>
          <div className="pc-list-header__metric">
            <span>対象</span>
            <strong>Amazon掲載PC</strong>
          </div>
          <div className="pc-list-header__metric">
            <span>評価</span>
            <strong>CPU / GPU / 価格 / 電池</strong>
          </div>
          <div className="pc-list-header__metric">
            <span>用途</span>
            <strong>持ち運び・作業・ゲーム・編集</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pc-list-header {
          background:
            linear-gradient(115deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 43%, var(--accent-surface) 100%);
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
        }

        .pc-list-header__top {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .pc-list-header__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #0f172a;
          text-decoration: none;
          min-width: 0;
        }

        .pc-list-header__brand-mark {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 900;
          font-size: 18px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          box-shadow: 0 10px 24px color-mix(in srgb, var(--accent-primary) 20%, transparent);
          flex: 0 0 auto;
        }

        .pc-list-header__brand-name {
          display: block;
          font-size: 16px;
          font-weight: 900;
          line-height: 1.1;
        }

        .pc-list-header__brand-sub {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
        }

        .pc-list-header__back {
          color: #2563eb;
          font-size: 14px;
          font-weight: 800;
          text-decoration: none;
          white-space: nowrap;
        }

        .pc-list-header__hero {
          max-width: 1280px;
          margin: 0 auto;
          padding: 22px 16px 30px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 28px;
          align-items: end;
        }

        .pc-list-header__copy {
          min-width: 0;
        }

        .pc-list-header__eyebrow {
          margin: 0 0 10px;
          color: var(--accent-primary);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .pc-list-header h1 {
          margin: 0;
          color: #0f172a;
          font-size: clamp(30px, 4.4vw, 52px);
          line-height: 1.08;
          letter-spacing: 0;
          font-weight: 900;
        }

        .pc-list-header__lead {
          margin: 14px 0 0;
          max-width: 760px;
          color: #334155;
          font-size: 16px;
          line-height: 1.8;
          font-weight: 700;
        }

        .pc-list-header__note {
          margin: 8px 0 0;
          max-width: 820px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .pc-list-header__panel {
          border: 1px solid var(--accent-line);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
          padding: 16px;
        }

        .pc-list-header__panel-title {
          margin-bottom: 12px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 900;
        }

        .pc-list-header__metric {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 12px;
          align-items: center;
          padding: 10px 0;
          border-top: 1px solid #e2e8f0;
        }

        .pc-list-header__metric span {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
        }

        .pc-list-header__metric strong {
          color: #0f172a;
          font-size: 14px;
          line-height: 1.35;
        }

        @media (max-width: 860px) {
          .pc-list-header__hero {
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 18px 16px 24px;
          }

          .pc-list-header__panel {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        @media (max-width: 520px) {
          .pc-list-header__top {
            align-items: flex-start;
          }

          .pc-list-header__brand-mark {
            width: 32px;
            height: 32px;
            font-size: 16px;
          }

          .pc-list-header__brand-name {
            font-size: 15px;
          }

          .pc-list-header__brand-sub {
            font-size: 11px;
          }

          .pc-list-header h1 {
            font-size: 30px;
          }

          .pc-list-header__lead {
            font-size: 14px;
          }

          .pc-list-header__note {
            font-size: 12px;
          }

          .pc-list-header__metric {
            grid-template-columns: 46px 1fr;
          }
        }
      `}</style>
    </header>
  )
}
